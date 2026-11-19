"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Trash2, X } from "lucide-react";
import type { SaruLanguage, SaruMessageT, SaruReply } from "@/lib/saru/types";
import { sendChat, sendVoice, SaruRequestError } from "@/lib/saru/client";
import { MicError, startRecording, type RecorderHandle } from "@/lib/saru/recorder";
import { scrollToId } from "@/lib/scroll";
import { newId, useSaruSession } from "./SaruSessionManager";
import SaruAvatar from "./SaruAvatar";
import SaruMessage, { TypingIndicator } from "./SaruMessage";
import SaruInput from "./SaruInput";
import SaruSuggestedQuestions, { DEFAULT_SUGGESTIONS } from "./SaruSuggestedQuestions";
import SaruVoiceMode from "./SaruVoiceMode";

export const WELCOME =
  "Assalam o Alaikum! 👋 I'm Saru, your AI assistant at SkillTek Institute.\nI can help you explore courses, understand admissions, learn about our services, and answer your questions.\nHow can I help you today?";

const LANGS: { v: SaruLanguage; label: string }[] = [
  { v: "auto", label: "Auto" },
  { v: "en", label: "English" },
  { v: "ur", label: "اردو" },
  { v: "sd", label: "سنڌي" },
];

export default function SaruChatWindow({
  open,
  onMinimize,
  onClose,
  session,
}: {
  open: boolean;
  onMinimize: () => void;
  onClose: () => void;
  session: ReturnType<typeof useSaruSession>;
}) {
  const { state, ref, addMessage, removeMessage, setLanguage, clear } = session;
  const [busy, setBusy] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [voice, setVoice] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const dict = useRef<RecorderHandle | null>(null);

  const messages = state?.messages ?? [];

  // keep the newest message in view
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy, open]);

  // stop any recording / voice session when the window closes
  useEffect(() => {
    if (!open) {
      dict.current?.cancel();
      setVoice(false);
    } else {
      requestAnimationFrame(() => document.getElementById("saru-input")?.focus());
    }
  }, [open]);

  const ids = useCallback(() => {
    const s = ref.current!;
    return { sessionId: s.sessionId, conversationId: s.conversationId, language: s.language };
  }, [ref]);

  const handleReply = useCallback(
    (reply: SaruReply) => {
      addMessage({ id: newId("m"), role: "assistant", text: reply.reply, at: Date.now(), action: reply.action });
      setSuggestions(reply.suggestedQuestions.length ? reply.suggestedQuestions : []);
    },
    [addMessage]
  );

  const send = useCallback(
    async (text: string, retryOf?: SaruMessageT) => {
      if (busy || !ref.current) return;
      setNotice("");
      if (retryOf) removeMessage(retryOf.id);
      const id = newId("m");
      addMessage({ id, role: "user", text, at: Date.now(), via: "text" });
      setSuggestions([]);
      setBusy(true);
      try {
        handleReply(await sendChat(text, ids()));
      } catch (e) {
        removeMessage(id);
        addMessage({
          id: newId("m"),
          role: "user",
          text,
          at: Date.now(),
          via: "text",
          status: "error",
          retry: text,
        });
        setNotice(e instanceof SaruRequestError ? e.message : "Something went wrong. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, ref, addMessage, removeMessage, handleReply, ids]
  );

  /** Microphone button: one-shot dictation → transcript + text reply. */
  const dictate = useCallback(async () => {
    if (dictating) return dict.current?.stop();
    if (busy) return;
    setNotice("");
    try {
      const h = await startRecording({ noSpeechMs: 7000 });
      dict.current = h;
      setDictating(true);
      const blob = await h.result;
      dict.current = null;
      setDictating(false);
      if (!blob) return setNotice("I didn't hear anything. Tap the microphone and speak, or type your question.");
      setBusy(true);
      const reply = await sendVoice(blob, ids(), false);
      if (reply.transcript) addMessage({ id: newId("m"), role: "user", text: reply.transcript, at: Date.now(), via: "voice" });
      handleReply(reply);
    } catch (e) {
      setDictating(false);
      setNotice(
        e instanceof MicError || e instanceof SaruRequestError ? e.message : "Voice input failed. Please type your question."
      );
    } finally {
      setBusy(false);
    }
  }, [dictating, busy, ids, addMessage, handleReply]);

  const onVoiceTurn = useCallback(
    (userText: string, reply: SaruReply) => {
      if (userText) addMessage({ id: newId("m"), role: "user", text: userText, at: Date.now(), via: "voice" });
      handleReply(reply);
    },
    [addMessage, handleReply]
  );

  const goTo = (id: string) => {
    if (window.innerWidth < 640) onMinimize();
    scrollToId(id);
  };

  return (
    <section
      id="saru-window"
      role="dialog"
      aria-modal="false"
      aria-label="Saru Assistant chat"
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(e) => e.key === "Escape" && onMinimize()}
      className={`saru-window fixed z-[90] flex flex-col overflow-hidden rounded-[26px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(139,92,246,0.25)] ${
        open ? "saru-open" : "saru-closed"
      }`}
    >
      {/* header */}
      <header className="relative flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-violet/20 to-transparent" aria-hidden />
        <SaruAvatar size={38} state={busy ? "thinking" : "idle"} />
        <div className="relative min-w-0 flex-1">
          <h2 className="truncate font-display text-[15px] font-semibold leading-tight">Saru<span className="hidden sm:inline"> Assistant</span></h2>
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Online<span className="hidden sm:inline"> · SkillTek Institute</span>
          </p>
        </div>
        <label className="sr-only" htmlFor="saru-lang">
          Reply language
        </label>
        <select
          id="saru-lang"
          value={state?.language ?? "auto"}
          onChange={(e) => setLanguage(e.target.value as SaruLanguage)}
          className="relative h-8 rounded-full border border-white/10 bg-white/[0.04] px-2 text-[12px] text-ink outline-none"
          title="Reply language"
        >
          {LANGS.map((l) => (
            <option key={l.v} value={l.v} className="bg-surface">
              {l.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setConfirmClear((v) => !v)}
          className="relative grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-white"
          aria-label="Clear conversation"
          title="Clear conversation"
        >
          <Trash2 size={15} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onMinimize}
          className="relative grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-white"
          aria-label="Minimize chat"
        >
          <Minus size={17} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="relative grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
        >
          <X size={17} aria-hidden />
        </button>
      </header>

      {confirmClear && (
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] bg-red-500/10 px-4 py-2 text-[12.5px]">
          <span>Clear this conversation? Saru will forget it.</span>
          <span className="flex gap-2">
            <button type="button" className="rounded-full px-2.5 py-1 text-muted hover:text-white" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="rounded-full bg-red-500 px-2.5 py-1 font-medium text-white"
              onClick={() => {
                clear();
                setSuggestions(DEFAULT_SUGGESTIONS);
                setConfirmClear(false);
                setNotice("");
              }}
            >
              Clear
            </button>
          </span>
        </div>
      )}

      {/* messages */}
      <div ref={list} className="flex-1 overflow-y-auto overscroll-contain px-3.5 py-4" data-lenis-prevent>
        <ol className="space-y-3" aria-live="polite" aria-relevant="additions">
          <SaruMessage m={{ id: "welcome", role: "assistant", text: WELCOME, at: messages[0]?.at ?? Date.now() }} onScroll={goTo} />
          {messages.map((m) => (
            <SaruMessage key={m.id} m={m} onScroll={goTo} onRetry={(mm) => mm.retry && send(mm.retry, mm)} />
          ))}
          {busy && <TypingIndicator />}
        </ol>
        {!busy && suggestions.length > 0 && (
          <div className="mt-4">
            <SaruSuggestedQuestions items={suggestions} onPick={(q) => send(q)} disabled={busy} />
          </div>
        )}
      </div>

      {/* input */}
      <div className="border-t border-white/[0.07] p-3">
        {notice && (
          <p role="alert" className="mb-2 rounded-xl bg-amber-400/10 px-3 py-2 text-[12.5px] text-amber-100">
            {notice}
          </p>
        )}
        <SaruInput
          onSend={(t) => send(t)}
          onDictate={dictate}
          onVoiceMode={() => setVoice(true)}
          busy={busy}
          dictating={dictating}
        />
        <p className="mt-2 text-center text-[10.5px] text-muted/80">
          Saru is an AI assistant and can make mistakes. Official contact: 0312 2098894
        </p>
      </div>

      {voice && (
        <SaruVoiceMode
          getIds={ids}
          onTurn={onVoiceTurn}
          onClose={() => setVoice(false)}
          onSwitchToText={(n) => {
            setVoice(false);
            if (n) setNotice(n);
          }}
        />
      )}
    </section>
  );
}
