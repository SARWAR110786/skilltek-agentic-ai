"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SaruLanguage, SaruMessageT } from "@/lib/saru/types";

/**
 * SaruSessionManager — owns the visitor's session id, conversation id,
 * language preference and message history, persisted in localStorage so the
 * conversation survives page reloads and navigation (session continuity).
 * Nothing here is sensitive: the n8n key lives only on the server.
 */
const KEY = "saru:v1";
const MAX_MESSAGES = 60;

type Stored = {
  sessionId: string;
  conversationId: string;
  language: SaruLanguage;
  messages: SaruMessageT[];
  seen: boolean;
};

export function newId(prefix: string) {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${prefix}_${raw}`;
}

function fresh(language: SaruLanguage = "auto"): Stored {
  return { sessionId: newId("s"), conversationId: newId("c"), language, messages: [], seen: false };
}

function load(): Stored {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null") as Stored | null;
    if (s && /^[A-Za-z0-9_-]{16,64}$/.test(s.sessionId) && Array.isArray(s.messages)) return s;
  } catch {
    /* storage blocked or corrupt — start fresh */
  }
  return fresh();
}

export function useSaruSession() {
  const [state, setState] = useState<Stored | null>(null);
  const ref = useRef<Stored | null>(null);

  useEffect(() => {
    const s = load();
    ref.current = s;
    setState(s);
  }, []);

  const update = useCallback((fn: (s: Stored) => Stored) => {
    setState((prev) => {
      const next = fn(prev ?? fresh());
      next.messages = next.messages.slice(-MAX_MESSAGES);
      ref.current = next;
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private mode: keep in memory only */
      }
      return next;
    });
  }, []);

  const addMessage = useCallback(
    (m: SaruMessageT) => update((s) => ({ ...s, messages: [...s.messages, m] })),
    [update]
  );
  const removeMessage = useCallback(
    (id: string) => update((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== id) })),
    [update]
  );
  const setLanguage = useCallback((language: SaruLanguage) => update((s) => ({ ...s, language })), [update]);
  const markSeen = useCallback(() => update((s) => (s.seen ? s : { ...s, seen: true })), [update]);
  /** Clear conversation: new ids, so the agent's memory starts fresh too. */
  const clear = useCallback(() => update((s) => ({ ...fresh(s.language), seen: true })), [update]);

  return { state, ref, addMessage, removeMessage, setLanguage, markSeen, clear };
}
