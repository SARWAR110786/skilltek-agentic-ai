import "server-only";
import { NextResponse } from "next/server";
import type { SaruLanguage, SaruReply } from "./types";

/* ───────────────────────── config (server-only env) ───────────────────────── */
export function saruConfig() {
  return {
    chatUrl: process.env.N8N_TEXT_CHAT_WEBHOOK ?? "",
    voiceUrl: process.env.N8N_VOICE_WEBHOOK ?? "",
    secret: process.env.SARU_N8N_SECRET ?? "",
  };
}

/* ───────────────────────── rate limiting ─────────────────────────
 * Sliding window per client IP, kept in memory. On serverless hosts each
 * instance has its own window, so this is a first line of defence; add an
 * edge rate limiter (e.g. Vercel Firewall rules) for stronger guarantees. */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return list.length > limit;
}

export function clientIp(req: Request) {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/* ───────────────────────── validation ───────────────────────── */
const ID = /^[A-Za-z0-9_-]{16,64}$/;
const LANGS: SaruLanguage[] = ["auto", "en", "ur", "sd"];

export function validId(v: unknown): v is string {
  return typeof v === "string" && ID.test(v);
}
export function validLang(v: unknown): SaruLanguage {
  return LANGS.includes(v as SaruLanguage) ? (v as SaruLanguage) : "auto";
}
export function cleanText(v: unknown, max: number) {
  return typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
}

/** Same-origin check: browsers send Origin on POST; reject other sites. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; still rate-limited
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export function jsonError(status: number, error: string, message: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

/* ───────────────────────── n8n call ───────────────────────── */
export async function callN8n(url: string, secret: string, payload: unknown, timeoutMs: number) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-saru-key": secret },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      cache: "no-store",
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* invalid JSON handled below */
    }
    return { status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

/** Accept only the fields the widget understands, with safe types. */
export function sanitizeReply(data: unknown, fallbackSession: string): SaruReply | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.reply !== "string" || !d.reply.trim()) return null;
  const action = d.action as Record<string, unknown> | null | undefined;
  const audio = d.audio as Record<string, unknown> | null | undefined;
  return {
    ok: true,
    reply: d.reply.slice(0, 4000),
    sessionId: validId(d.sessionId) ? d.sessionId : fallbackSession,
    language: validLang(d.language),
    suggestedQuestions: Array.isArray(d.suggestedQuestions)
      ? d.suggestedQuestions.filter((q): q is string => typeof q === "string").map((q) => q.slice(0, 120)).slice(0, 3)
      : [],
    action:
      action && typeof action.label === "string" && ["link", "scroll", "call"].includes(String(action.type))
        ? {
            type: action.type as "link" | "scroll" | "call",
            label: action.label.slice(0, 60),
            href: typeof action.href === "string" && /^(https:\/\/|tel:\+?\d)/.test(action.href) ? action.href : undefined,
            target: typeof action.target === "string" && /^[a-z-]{1,40}$/.test(action.target) ? action.target : undefined,
          }
        : null,
    transcript: typeof d.transcript === "string" ? d.transcript.slice(0, 1000) : null,
    audio:
      audio && typeof audio.base64 === "string" && audio.base64.length < 4_000_000
        ? { mimeType: "audio/mpeg", base64: audio.base64 }
        : null,
  };
}

const N8N_ERRORS: Record<string, string> = {
  no_speech: "I couldn't hear anything. Please try speaking again, a little closer to the microphone.",
  stt_failed: "I couldn't understand the audio. Please try again or type your question.",
  empty_message: "Please type a message.",
  invalid_session: "Your session expired. Please clear the conversation and try again.",
};

export function n8nErrorResponse(status: number, data: unknown) {
  const code = (data as { error?: string } | null)?.error;
  if (status === 400 && code && N8N_ERRORS[code]) return jsonError(400, code, N8N_ERRORS[code]);
  return jsonError(502, "upstream_error", "Saru is having trouble answering right now. Please try again in a moment.");
}
