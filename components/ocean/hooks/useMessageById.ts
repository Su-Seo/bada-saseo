"use client";

import { useEffect, useState } from "react";
import type { MessageData } from "@/lib/types";

export function useMessageById(messageId: string) {
  const [message, setMessage] = useState<MessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

  return { message, loading, notFound };
}
