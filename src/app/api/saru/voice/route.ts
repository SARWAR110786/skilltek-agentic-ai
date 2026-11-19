import { NextResponse } from "next/server";
import {
  callN8n, clientIp, jsonError, n8nErrorResponse, rateLimited,
  saruConfig, sameOrigin, sanitizeReply, validId, validLang,
} from "@/lib/saru/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_AUDIO_BYTES = 3 * 1024 * 1024; // ~3 MB ≈ well over a minute of opus speech
const AUDIO_TYPES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-m4a", "audio/aac"];

/**
 * Voice turn: browser audio → this proxy → n8n (speech-to-text → Saru agent →
 * text-to-speech) → reply text + transcript + spoken audio.
 * Audio is forwarded in memory only; this server never writes it anywhere.
 */
export async function POST(req: Request) {
  const { voiceUrl, secret } = saruConfig();
  if (!voiceUrl || !secret) return jsonError(503, "not_configured", "Voice is not connected yet. Please use text chat.");
  if (!sameOrigin(req)) return jsonError(403, "forbidden", "Requests from other sites are not allowed.");
  if (rateLimited(`voice:${clientIp(req)}`, 10, 60_000))
    return jsonError(429, "rate_limited", "Too many voice messages in a short time. Please wait a moment.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(400, "bad_request", "Invalid audio upload.");
  }
  const audio = form.get("audio");
  const sessionId = form.get("sessionId");
  const conversationId = form.get("conversationId");
  if (!(audio instanceof Blob) || audio.size < 1200) return jsonError(400, "no_speech", "I couldn't hear anything. Please try again.");
  if (audio.size > MAX_AUDIO_BYTES) return jsonError(413, "too_long", "That recording is too long. Please keep questions under a minute.");
  const mimeType = (audio.type || "audio/webm").split(";")[0];
  if (!AUDIO_TYPES.includes(mimeType)) return jsonError(415, "bad_audio", "This audio format isn't supported.");
  if (!validId(sessionId) || !validId(conversationId))
    return jsonError(400, "invalid_session", "Your session expired. Please clear the conversation and try again.");

  const payload = {
    audio: Buffer.from(await audio.arrayBuffer()).toString("base64"),
    mimeType,
    sessionId,
    conversationId,
    inputType: "voice",
    language: validLang(form.get("language")),
    wantAudio: form.get("wantAudio") !== "false",
    timestamp: new Date().toISOString(),
  };

  try {
    const { status, data } = await callN8n(voiceUrl, secret, payload, 58_000);
    if (status !== 200) return n8nErrorResponse(status, data);
    const reply = sanitizeReply(data, sessionId);
    if (!reply) return jsonError(502, "invalid_response", "Saru gave an unexpected answer. Please try again.");
    return NextResponse.json(reply, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const timeout = e instanceof Error && e.name === "AbortError";
    return jsonError(504, timeout ? "timeout" : "network", timeout ? "Saru took too long to reply. Please try again." : "Couldn't reach Saru. Please check your connection and try again.");
  }
}
