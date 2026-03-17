"use client";

import { useEffect, useState } from "react";
import { playBottlePop } from "@/lib/sounds";
import { motion } from "framer-motion";
import MessageCard from "@/components/ui/MessageCard";
import type { MessageData } from "@/lib/types";

interface Props {
  messageId: string;
  onClose: () => void;
}

export default function PickModal({ messageId, onClose }: Props) {
  const [message, setMessage] = useState<MessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { playBottlePop(); }, []);

  useEffect(() => {
    fetch(`/api/messages/${messageId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.message) {
          setMessage(data.message);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [messageId]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md">
        {loading && (
          <div className="text-center text-white">
            <motion.p
              className="text-4xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🍾
            </motion.p>
            <p className="text-sm text-white/50 tracking-wider">
              편지를 열어보는 중...
            </p>
          </div>
        )}

        {notFound && (
          <div className="text-center text-white/60">
            <p className="text-3xl mb-3">🌊</p>
            <p className="text-sm">이미 파도에 쓸려간 편지예요.</p>
            <button
              onClick={onClose}
              className="mt-4 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              닫기
            </button>
          </div>
        )}

        {message && (
          <MessageCard {...message} onClose={onClose} />
        )}
      </div>
    </motion.div>
  );
}
