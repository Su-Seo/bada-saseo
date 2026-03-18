import type { Prisma } from "@/app/generated/prisma";
import { prisma } from "./db";
import type { MessageData } from "./types";

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
