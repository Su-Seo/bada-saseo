import type { Prisma } from "@/app/generated/prisma";
import { prisma } from "./db";
import type { MessageData } from "./types";
import { EXPIRE_DAYS, REPORT_THRESHOLD } from "./constants";
import { computeWordFrequency } from "./wordFrequency";
import { getStopwords } from "./wordList";

/** 삭제되지 않고 만료되지 않은 유효한 메시지 필터 */
export function validMessageWhere(): Prisma.MessageWhereInput {
  return { isDeleted: false, expiresAt: { gt: new Date() } };
}

/**
 * Message를 조회할 때 사용하는 공통 select.
 * relation(tag 등)을 포함하며, toMessageData()와 쌍으로 사용한다.
 */
export const MESSAGE_SELECT = {
  id: true,
  content: true,
  tag: { select: { name: true } },
  bottleColor: true,
  paperStyle: true,
  heartCount: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

type RawMessage = Prisma.MessageGetPayload<{ select: typeof MESSAGE_SELECT }>;

/** Prisma 결과 → 프론트엔드용 플랫 객체 */
export function toMessageData(raw: RawMessage): MessageData & { createdAt: Date } {
  const { tag, ...rest } = raw;
  return { ...rest, tag: tag?.name ?? null };
}

/** 유효한(삭제·만료되지 않은) 메시지인지 확인. 없으면 null 반환 */
export async function findValidMessage(id: string) {
  return prisma.message.findFirst({
    where: { id, ...validMessageWhere() },
  });
}

/** 활성 태그 목록 조회 (정렬순) */
export function findActiveTags() {
  return prisma.tag.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
}

/** 태그 이름으로 활성 태그 ID 조회 */
export async function resolveTagId(tagName: string | null | undefined): Promise<string | null> {
  if (!tagName) return null;
  const found = await prisma.tag.findFirst({
    where: { name: tagName, isActive: true },
    select: { id: true },
  });
  return found?.id ?? null;
}

// ─── 메시지 조회 ────────────────────────────────────────

/** ID로 유효한 메시지 조회 → 프론트엔드용 플랫 객체 반환 */
export async function findMessageById(id: string): Promise<(MessageData & { createdAt: Date }) | null> {
  const raw = await prisma.message.findFirst({
    where: { id, ...validMessageWhere() },
    select: MESSAGE_SELECT,
  });
  return raw ? toMessageData(raw) : null;
}

/** 랜덤 메시지 1건 조회. 태그 필터 선택 가능 */
export async function findRandomMessage(tagName?: string | null): Promise<(MessageData & { createdAt: Date }) | null> {
  const tagId = tagName ? await resolveTagId(tagName) : null;
  const where = {
    ...validMessageWhere(),
    ...(tagId ? { tagId } : {}),
  };

  const count = await prisma.message.count({ where });
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  const raw = await prisma.message.findFirst({ where, skip, select: MESSAGE_SELECT });
  return raw ? toMessageData(raw) : null;
}

/** 오늘 보낸 메시지 목록. hearted=true이면 공감(heartCount>0)만, false이면 미공감만 */
export async function findTodayMessages(hearted: boolean) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return prisma.message.findMany({
    where: {
      ...validMessageWhere(),
      createdAt: { gte: todayStart },
      heartCount: hearted ? { gt: 0 } : { equals: 0 },
    },
    orderBy: { createdAt: "desc" },
    select: MESSAGE_SELECT,
  });
}

/** 오늘 병 개수 — unhearted/hearted 구분 */
export async function countTodayMessages() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const base = { ...validMessageWhere(), createdAt: { gte: todayStart } };
  const [unhearted, hearted] = await Promise.all([
    prisma.message.count({ where: { ...base, heartCount: { equals: 0 } } }),
    prisma.message.count({ where: { ...base, heartCount: { gt: 0 } } }),
  ]);
  return { unhearted, hearted };
}

/** 특정 시점 이후 새 병 목록 (SSE 폴링용) */
export async function findNewBottlesSince(since: Date) {
  return prisma.message.findMany({
    where: {
      createdAt: { gt: since },
      ...validMessageWhere(),
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, createdAt: true, bottleColor: true },
  });
}

/** 날짜 범위별 일별 메시지 수 (통계 그래프용) */
export async function getMessageCountByDate(from: Date, to: Date) {
  const rows = await prisma.message.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      ...validMessageWhere(),
    },
    select: { createdAt: true },
  });

  // JS에서 날짜별 집계 (KST 기준 YYYY-MM-DD)
  const countMap: Record<string, number> = {};
  for (const { createdAt } of rows) {
    const key = createdAt.toISOString().slice(0, 10);
    countMap[key] = (countMap[key] ?? 0) + 1;
  }

  // from~to 전체 날짜 채우기 (빈 날짜 = 0)
  const result: { date: string; count: number }[] = [];
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    result.push({ date: key, count: countMap[key] ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }

  return result;
}

// ─── 메시지 생성/수정 ──────────────────────────────────

interface CreateMessageInput {
  content: string;
  tagId: string | null;
  bottleColor: string | null;
  paperStyle: string | null;
}

/** 새 메시지 생성 후 SSE 구독자에게 NOTIFY */
export async function createMessage(input: CreateMessageInput) {
  const expiresAt = new Date(Date.now() + EXPIRE_DAYS * 24 * 60 * 60 * 1000);
  const created = await prisma.message.create({
    data: { ...input, expiresAt },
    select: { id: true, createdAt: true, bottleColor: true },
  });
  const payload = JSON.stringify({
    id: created.id,
    createdAt: created.createdAt.toISOString(),
    bottleColor: created.bottleColor ?? null,
  });
  await prisma.$executeRaw`SELECT pg_notify('new_bottle', ${payload})`;
  return { id: created.id, bottleColor: created.bottleColor };
}

/** 하트 수 1 증가 */
export async function incrementHeart(id: string) {
  await prisma.message.update({
    where: { id },
    data: { heartCount: { increment: 1 } },
  });
}

/** 신고 처리. 임계값 도달 시 자동 삭제. 메시지 없으면 null 반환 */
export async function reportMessage(id: string): Promise<boolean> {
  const message = await findValidMessage(id);
  if (!message) return false;

  const shouldDelete = message.reportCount + 1 >= REPORT_THRESHOLD;
  await prisma.message.update({
    where: { id },
    data: {
      reportCount: { increment: 1 },
      ...(shouldDelete && { isDeleted: true }),
    },
  });
  return true;
}

// ─── 통계/정리 ──────────────────────────────────────────

/** 오늘/전체 유효 메시지 수, 평균 하트 수. from/to 지정 시 해당 기간으로 필터 */
export async function getMessageStats(from?: Date, to?: Date) {
  const dateFilter = from || to
    ? { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }
    : {};

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayFrom = from && from > todayStart ? from : todayStart;
  const todayFilter = { createdAt: { gte: todayFrom } };

  const [todayCount, totalCount] = await Promise.all([
    prisma.message.count({
      where: { ...validMessageWhere(), ...todayFilter },
    }),
    prisma.message.count({
      where: { ...validMessageWhere(), ...dateFilter },
    }),
  ]);

  return {
    todayCount,
    totalCount,
  };
}

/** 유효 메시지 단어 빈도 (단어 클라우드용, 최신 500개 기준). from/to 지정 시 해당 기간으로 필터 */
export async function getWordFrequency(limit = 60, from?: Date, to?: Date) {
  const dateFilter = from || to
    ? { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }
    : {};

  const messages = await prisma.message.findMany({
    where: { ...validMessageWhere(), ...dateFilter },
    select: { content: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const stopwords = await getStopwords();
  return computeWordFrequency(messages.map((m) => m.content), new Set(stopwords), limit);
}

/** 태그별 메시지 수 통계. from/to 지정 시 해당 기간으로 필터 */
export async function getTagStats(from?: Date, to?: Date) {
  const dateFilter = from || to
    ? { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } }
    : {};

  const [tags, grouped] = await Promise.all([
    findActiveTags(),
    prisma.message.groupBy({
      by: ["tagId"],
      where: { ...validMessageWhere(), ...dateFilter, tagId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const countMap = Object.fromEntries(
    grouped.map((g) => [g.tagId as string, g._count._all]),
  );

  return tags.map((t) => ({
    name: t.name,
    count: countMap[t.id] ?? 0,
  }));
}

/** 만료된 메시지 삭제 (cron용) */
export async function deleteExpiredMessages() {
  const result = await prisma.message.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
