"use client";

import { useEffect, useState } from "react";
import type { MessageData } from "@/lib/types";
import { fetchJSON } from "@/lib/api";

export function useMessageById(messageId: string) {
  const [message, setMessage] = useState<MessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchJSON<{ message?: MessageData }>(`/api/messages/${messageId}`)
      .then((data) => {
        if (data?.message) {
          setMessage(data.message);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [messageId]);

  return { message, loading, notFound };
}
