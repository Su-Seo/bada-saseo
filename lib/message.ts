import type { Prisma } from "@/app/generated/prisma";
import type { MessageData } from "./types";

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
