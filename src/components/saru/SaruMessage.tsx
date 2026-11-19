"use client";

import { ArrowUpRight, Mic, Phone, RotateCw } from "lucide-react";
import type { SaruAction, SaruMessageT } from "@/lib/saru/types";
import SaruAvatar from "./SaruAvatar";

const RTL = /[؀-ۿ]/;

/** Linkify phone, email and https URLs inside a reply. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(https:\/\/[^\s)]+|theskilltek@gmail\.com|0312[\s-]?2098894)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (/^https:\/\//.test(p))
          return (
            <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="break-all text-cyan underline underline-offset-2">
              {p.replace(/^https:\/\//, "")}
            </a>
          );
        if (p === "theskilltek@gmail.com")
          return (
            <a key={i} href={`mailto:${p}`} className="text-cyan underline underline-offset-2">
              {p}
            </a>
          );
        if (/^0312[\s-]?2098894$/.test(p))
          return (
            <a key={i} href="tel:+923122098894" className="whitespace-nowrap text-cyan underline underline-offset-2">
              {p}
            </a>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export function ActionButton({ action, onScroll }: { action: SaruAction; onScroll: (id: string) => void }) {
  const cls =
    "mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-[12.5px] font-medium text-cyan transition-colors hover:bg-cyan/20";
  if (action.type === "scroll" && action.target)
    return (
      <button type="button" className={cls} onClick={() => onScroll(action.target!)}>
        {action.label} <ArrowUpRight size={13} aria-hidden />
      </button>
    );
  if (action.href)
    return (
      <a className={cls} href={action.href} target={action.type === "link" ? "_blank" : undefined} rel="noopener noreferrer">
        {action.type === "call" ? <Phone size={13} aria-hidden /> : null}
        {action.label}
        {action.type === "link" ? <ArrowUpRight size={13} aria-hidden /> : null}
      </a>
    );
  return null;
}

export default function SaruMessage({
  m,
  onRetry,
  onScroll,
}: {
  m: SaruMessageT;
  onRetry?: (m: SaruMessageT) => void;
  onScroll: (id: string) => void;
}) {
  const mine = m.role === "user";
  const rtl = RTL.test(m.text);
  return (
    <li className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && <SaruAvatar size={26} />}
      <div className={`flex max-w-[82%] flex-col ${mine ? "items-end" : "items-start"}`}>
        <div
          dir={rtl ? "rtl" : "ltr"}
          className={`whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-2.5 text-[14px] leading-relaxed ${
            mine
              ? "rounded-br-md bg-gradient-to-br from-violet to-blue text-white"
              : "rounded-bl-md border border-white/[0.08] bg-white/[0.06] text-ink"
          } ${m.status === "error" ? "border border-red-400/40 bg-red-500/10 text-red-100" : ""} ${rtl ? "font-[system-ui] text-[15px]" : ""}`}
        >
          {mine ? m.text : <Rich text={m.text} />}
        </div>
        <div className="mt-1 flex items-center gap-2 px-1 text-[10.5px] text-muted">
          {m.via === "voice" && (
            <span className="inline-flex items-center gap-1">
              <Mic size={10} aria-hidden /> voice
            </span>
          )}
          <time dateTime={new Date(m.at).toISOString()}>
            {new Date(m.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </time>
          {m.status === "error" && m.retry && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(m)}
              className="inline-flex items-center gap-1 font-medium text-cyan hover:underline"
            >
              <RotateCw size={11} aria-hidden /> Retry
            </button>
          )}
        </div>
        {m.action && !mine && <ActionButton action={m.action} onScroll={onScroll} />}
      </div>
    </li>
  );
}

export function TypingIndicator() {
  return (
    <li className="flex items-end gap-2" aria-live="polite" aria-label="Saru is typing">
      <SaruAvatar size={26} state="thinking" />
      <div className="flex gap-1 rounded-[18px] rounded-bl-md border border-white/[0.08] bg-white/[0.06] px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="saru-dot h-1.5 w-1.5 rounded-full bg-ink/70" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </div>
    </li>
  );
}
