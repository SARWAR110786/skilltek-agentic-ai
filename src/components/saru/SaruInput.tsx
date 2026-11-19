"use client";

import { useRef, useState } from "react";
import { AudioLines, Loader2, Mic, SendHorizontal, Square } from "lucide-react";

export default function SaruInput({
  onSend,
  onDictate,
  onVoiceMode,
  busy,
  dictating,
}: {
  onSend: (text: string) => void;
  /** start/stop one-shot dictation (speech → text message) */
  onDictate: () => void;
  onVoiceMode: () => void;
  busy: boolean;
  dictating: boolean;
}) {
  const [text, setText] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const t = text.trim();
    if (!t || busy) return;
    onSend(t);
    setText("");
    requestAnimationFrame(() => {
      if (area.current) area.current.style.height = "auto";
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-1.5 rounded-[20px] border border-white/10 bg-white/[0.04] p-1.5 focus-within:border-violet/60"
    >
      <button
        type="button"
        onClick={onVoiceMode}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Open voice conversation mode"
        title="Voice mode"
      >
        <AudioLines size={18} aria-hidden />
      </button>
      <label htmlFor="saru-input" className="sr-only">
        Message Saru
      </label>
      <textarea
        id="saru-input"
        ref={area}
        rows={1}
        maxLength={1000}
        value={text}
        dir="auto"
        placeholder={dictating ? "Listening… speak now" : "Ask Saru anything…"}
        onChange={(e) => {
          setText(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        className="max-h-[120px] min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-[14px] text-ink outline-none placeholder:text-muted/80"
      />
      <button
        type="button"
        onClick={onDictate}
        disabled={busy && !dictating}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-40 ${
          dictating ? "bg-red-500/90 text-white" : "text-muted hover:bg-white/10 hover:text-white"
        }`}
        aria-label={dictating ? "Stop recording" : "Speak your question"}
        aria-pressed={dictating}
        title={dictating ? "Stop" : "Speak"}
      >
        {dictating ? <Square size={14} fill="currentColor" aria-hidden /> : <Mic size={18} aria-hidden />}
      </button>
      <button
        type="submit"
        disabled={busy || !text.trim()}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet to-blue text-white transition-opacity disabled:opacity-40"
        aria-label="Send message"
      >
        {busy && !dictating ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <SendHorizontal size={16} aria-hidden />}
      </button>
    </form>
  );
}
