"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquareText, Mic, MicOff, PhoneOff } from "lucide-react";
import type { SaruLanguage, SaruReply } from "@/lib/saru/types";
import { sendVoice, SaruRequestError } from "@/lib/saru/client";
import { MicError, playAudio, startRecording, type RecorderHandle } from "@/lib/saru/recorder";
import SaruAvatar from "./SaruAvatar";
import SaruVoiceVisualizer from "./SaruVoiceVisualizer";

const LANGS: { v: SaruLanguage; label: string }[] = [
  { v: "auto", label: "Auto" },
  { v: "en", label: "English" },
  { v: "ur", label: "اردو" },
  { v: "sd", label: "سنڌي" },
];

type Phase = "idle" | "listening" | "thinking" | "speaking";
type Line = { who: "you" | "saru"; text: string };

const LABEL: Record<Phase, string> = {
  idle: "Tap the microphone to talk",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Saru is speaking",
};

/**
 * SaruVoiceMode — a hands-free conversation loop:
 * record (auto-stops on silence) → /api/saru/voice → n8n speech-to-text →
 * Saru agent → text-to-speech → play → listen again.
 * This is a turn-based pipeline, not a streaming real-time voice agent.
 */
export default function SaruVoiceMode({
  getIds,
  onTurn,
  onClose,
  onSwitchToText,
  autoStart = false,
  language,
  onLanguage,
}: {
  autoStart?: boolean;
  language: SaruLanguage;
  onLanguage: (l: SaruLanguage) => void;
  getIds: () => { sessionId: string; conversationId: string; language: SaruLanguage };
  onTurn: (userText: string, reply: SaruReply) => void;
  onClose: () => void;
  onSwitchToText: (notice?: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [hint, setHint] = useState("");
  const [fatal, setFatal] = useState("");
  const rec = useRef<RecorderHandle | null>(null);
  const player = useRef<ReturnType<typeof playAudio> | null>(null);
  const alive = useRef(true);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  const stopAll = useCallback(() => {
    rec.current?.cancel();
    rec.current = null;
    player.current?.stop();
    player.current = null;
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      stopAll();
    };
  }, [stopAll]);

  const listen = useCallback(async () => {
    if (!alive.current || mutedRef.current) return;
    setHint("");
    let handle: RecorderHandle;
    try {
      handle = await startRecording({ onSpeech: () => setHint("") });
    } catch (e) {
      setPhase("idle");
      setFatal(e instanceof MicError ? e.message : "Couldn't start the microphone.");
      return;
    }
    if (!alive.current) return handle.cancel();
    rec.current = handle;
    setAnalyser(handle.analyser);
    setPhase("listening");
    const blob = await handle.result;
    rec.current = null;
    setAnalyser(null);
    if (!alive.current) return;
    if (!blob) {
      setPhase("idle");
      setHint("I didn't catch that. Tap the microphone and try again.");
      return;
    }

    setPhase("thinking");
    let reply: SaruReply;
    try {
      reply = await sendVoice(blob, getIds(), true);
    } catch (e) {
      if (!alive.current) return;
      setPhase("idle");
      setHint(e instanceof SaruRequestError ? e.message : "Something went wrong. Please try again.");
      return;
    }
    if (!alive.current) return;
    const said = reply.transcript ?? "";
    setLines((l) => [...l, ...(said ? [{ who: "you" as const, text: said }] : []), { who: "saru" as const, text: reply.reply }].slice(-8));
    onTurn(said, reply);

    if (reply.audio) {
      setPhase("speaking");
      const p = playAudio(reply.audio.base64);
      player.current = p;
      setAnalyser(p.analyser);
      await p.ended;
      player.current = null;
      setAnalyser(null);
      if (!alive.current) return;
    } else {
      setHint("Voice reply unavailable for this answer, so it's shown as text.");
    }
    // keep the conversation going hands-free
    if (!mutedRef.current) void listen();
    else setPhase("idle");
  }, [getIds, onTurn]);

  const started = useRef(false);
  useEffect(() => {
    if (autoStart && !started.current) {
      started.current = true;
      void listen();
    }
  }, [autoStart, listen]);

  const micPress = () => {
    if (phase === "listening") return rec.current?.stop();
    if (phase === "speaking") {
      player.current?.stop();
      return;
    }
    if (phase === "idle") {
      setMuted(false);
      mutedRef.current = false;
      void listen();
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    if (next && phase === "listening") {
      rec.current?.cancel();
      setPhase("idle");
    }
  };

  const avatarState = phase === "thinking" ? "thinking" : phase === "speaking" ? "speaking" : phase === "listening" ? "listening" : "idle";

  return (
    <div className="saru-voice absolute inset-0 z-10 flex flex-col bg-[#080814]" role="dialog" aria-label="Voice conversation with Saru">
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <SaruAvatar size={28} state={avatarState} />
          <div>
            <p className="font-display text-[14px] font-semibold leading-tight">Voice mode</p>
            <p className="text-[11px] text-muted">English · اردو · سنڌي</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            stopAll();
            onSwitchToText();
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-ink/85 hover:bg-white/10"
        >
          <MessageSquareText size={14} aria-hidden /> Text chat
        </button>
      </div>

      <div className="relative mx-auto mt-2 grid place-items-center">
        <SaruVoiceVisualizer analyser={analyser} mode={avatarState} size={220} />
        <button
          type="button"
          onClick={micPress}
          disabled={phase === "thinking"}
          aria-label={phase === "listening" ? "Stop and send" : phase === "speaking" ? "Interrupt Saru" : "Start talking"}
          className={`saru-mic absolute grid h-[92px] w-[92px] place-items-center rounded-full text-white transition-transform active:scale-95 disabled:cursor-wait ${
            phase === "listening" ? "saru-mic-live" : ""
          }`}
        >
          {muted && phase === "idle" ? <MicOff size={34} aria-hidden /> : <Mic size={34} aria-hidden />}
        </button>
      </div>

      <p className="mt-1 text-center font-display text-[15px] font-semibold" aria-live="polite">
        {LABEL[phase]}
      </p>
      <p className="mx-6 mt-1 min-h-[2.2em] text-center text-[12.5px] text-muted" aria-live="polite">
        {fatal || hint || (phase === "listening" ? "Pause when you're done and Saru will answer." : "")}
      </p>

      <div className="mx-auto mt-1 flex gap-1.5" role="radiogroup" aria-label="Conversation language">
        {LANGS.map((l) => (
          <button
            key={l.v}
            type="button"
            role="radio"
            aria-checked={language === l.v}
            onClick={() => onLanguage(l.v)}
            className={`rounded-full border px-3 py-1 text-[12.5px] transition-colors ${
              language === l.v ? "border-cyan/60 bg-cyan/15 text-white" : "border-white/10 text-muted hover:text-white"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <ol className="mx-4 mt-2 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-2" aria-label="Voice transcript">
        {lines.map((l, i) => (
          <li key={i} dir="auto" className={`text-[13px] leading-relaxed ${l.who === "you" ? "text-ink/70" : "text-ink"}`}>
            <span className={`mr-1.5 font-mono text-[10px] uppercase tracking-widest ${l.who === "you" ? "text-muted" : "text-cyan"}`}>
              {l.who === "you" ? "You" : "Saru"}
            </span>
            {l.text}
          </li>
        ))}
      </ol>

      {fatal ? (
        <div className="px-4 pb-4">
          <button type="button" onClick={() => onSwitchToText(fatal)} className="btn btn-primary btn-sm w-full">
            Continue in text chat
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4 px-4 pb-4 pt-1">
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            className={`grid h-12 w-12 place-items-center rounded-full border transition-colors ${
              muted ? "border-amber-300/50 bg-amber-300/15 text-amber-200" : "border-white/15 text-ink hover:bg-white/10"
            }`}
            aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          >
            {muted ? <MicOff size={20} aria-hidden /> : <Mic size={20} aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => {
              stopAll();
              onClose();
            }}
            className="grid h-12 w-12 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600"
            aria-label="End voice conversation"
          >
            <PhoneOff size={20} aria-hidden />
          </button>
        </div>
      )}
      <p className="px-4 pb-3 text-center text-[10.5px] leading-snug text-muted/80">
        Your voice is sent securely for transcription and is not stored by SkillTek.
      </p>
    </div>
  );
}
