"use client";

import { useRouter } from "next/navigation";
import OceanBackground from "@/components/animations/OceanBackground";
import MessageCard from "@/components/ui/MessageCard";
import type { MessageData } from "@/lib/types";

interface Props {
  message: MessageData;
}

export default function LetterView({ message }: Props) {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 text-white overflow-hidden">
      <OceanBackground />
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
        <MessageCard {...message} onClose={() => router.push("/")} />
        <button
          onClick={() => router.push("/")}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          바다로 돌아가기
        </button>
      </div>
    </main>
  );
}
