import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import LetterView from "./LetterView";
import { MESSAGE_SELECT, toMessageData } from "@/lib/message";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const message = await prisma.message.findUnique({
    where: { id, isDeleted: false },
    select: { content: true, tag: { select: { name: true } } },
  });

  if (!message) {
    return { title: "바다사서" };
  }

  const tagName = message.tag?.name;
  const description = message.content.slice(0, 100);
  const ogImageUrl = `/api/og/${id}`;

  return {
    title: tagName ? `${tagName} — 바다사서` : "바다사서",
    description,
    openGraph: {
      title: "바다사서 — 바다에서 건져낸 편지",
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "바다사서",
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function LetterPage({ params }: Props) {
  const { id } = await params;

  const message = await prisma.message.findUnique({
    where: { id, isDeleted: false, expiresAt: { gt: new Date() } },
    select: MESSAGE_SELECT,
  });

  if (!message) notFound();

  return <LetterView message={toMessageData(message)} />;
}
