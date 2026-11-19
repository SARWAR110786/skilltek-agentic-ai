import { NextResponse } from "next/server";
import { callN8n, clientIp, jsonError, rateLimited, saruConfig, sameOrigin, validLang } from "@/lib/saru/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Live voice: asks n8n for a short-lived OpenAI Realtime client secret
 * (expires in minutes, usable only to open one voice session). The permanent
 * OpenAI key stays inside n8n; the n8n key stays on this server.
 */
export async function POST(req: Request) {
  const { secret } = saruConfig();
  const url = process.env.N8N_REALTIME_WEBHOOK ?? "";
  if (!url || !secret) return jsonError(503, "not_configured", "Live voice is not set up yet.");
  if (!sameOrigin(req)) return jsonError(403, "forbidden", "Requests from other sites are not allowed.");
  if (rateLimited(`live:${clientIp(req)}`, 6, 10 * 60_000))
    return jsonError(429, "rate_limited", "Too many calls started. Please wait a few minutes.");

  const body = (await req.json().catch(() => ({}))) as { language?: unknown };
  try {
    const { status, data } = await callN8n(url, secret, { language: validLang(body.language) }, 20_000);
    const d = data as { ok?: boolean; clientSecret?: string; model?: string } | null;
    if (status !== 200 || !d?.ok || typeof d.clientSecret !== "string" || !d.clientSecret.startsWith("ek_"))
      return jsonError(502, "realtime_unavailable", "Live voice is unavailable right now.");
    return NextResponse.json(
      { ok: true, clientSecret: d.clientSecret, model: d.model ?? "gpt-realtime" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return jsonError(504, "timeout", "Live voice took too long to start.");
  }
}
