import { NextResponse } from "next/server";
import {
  callN8n, clientIp, cleanText, jsonError, n8nErrorResponse, rateLimited,
  saruConfig, sameOrigin, sanitizeReply, validId, validLang,
} from "@/lib/saru/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Text chat: browser → this proxy (adds the secret) → n8n Saru workflow. */
export async function POST(req: Request) {
  const { chatUrl, secret } = saruConfig();
  if (!chatUrl || !secret) return jsonError(503, "not_configured", "Saru is not connected yet. Please contact us at 0312 2098894.");
  if (!sameOrigin(req)) return jsonError(403, "forbidden", "Requests from other sites are not allowed.");
  if (rateLimited(`chat:${clientIp(req)}`, 20, 60_000))
    return jsonError(429, "rate_limited", "You're sending messages very quickly. Please wait a moment and try again.");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "bad_request", "Invalid request.");
  }
  const message = cleanText(body.message, 1000);
  if (!message) return jsonError(400, "empty_message", "Please type a message.");
  if (!validId(body.sessionId) || !validId(body.conversationId))
    return jsonError(400, "invalid_session", "Your session expired. Please clear the conversation and try again.");

  // Only these fields reach n8n — browser-supplied instructions or extra fields are dropped.
  const payload = {
    message,
    sessionId: body.sessionId,
    conversationId: body.conversationId,
    inputType: "text",
    language: validLang(body.language),
    timestamp: new Date().toISOString(),
  };

  try {
    const { status, data } = await callN8n(chatUrl, secret, payload, 45_000);
    if (status !== 200) return n8nErrorResponse(status, data);
    const reply = sanitizeReply(data, payload.sessionId as string);
    if (!reply) return jsonError(502, "invalid_response", "Saru gave an unexpected answer. Please try again.");
    return NextResponse.json(reply, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const timeout = e instanceof Error && e.name === "AbortError";
    return jsonError(504, timeout ? "timeout" : "network", timeout ? "Saru took too long to reply. Please try again." : "Couldn't reach Saru. Please check your connection and try again.");
  }
}
