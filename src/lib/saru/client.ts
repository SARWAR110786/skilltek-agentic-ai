import type { SaruError, SaruLanguage, SaruReply } from "./types";

type Ids = { sessionId: string; conversationId: string; language: SaruLanguage };

async function parse(res: Response): Promise<SaruReply> {
  let data: SaruReply | SaruError | null = null;
  try {
    data = await res.json();
  } catch {
    /* fallthrough */
  }
  if (res.ok && data && data.ok) return data;
  const msg = data && !data.ok ? data.message : "Saru couldn't respond right now. Please try again.";
  throw new SaruRequestError(msg, data && !data.ok ? data.error : `http_${res.status}`);
}

export class SaruRequestError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

function withTimeout(ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(t) };
}

function wrapNetwork(e: unknown): never {
  if (e instanceof SaruRequestError) throw e;
  if (e instanceof DOMException && e.name === "AbortError")
    throw new SaruRequestError("Saru took too long to reply. Please try again.", "timeout");
  throw new SaruRequestError("Couldn't reach Saru. Please check your internet connection.", "network");
}

export async function sendChat(message: string, ids: Ids): Promise<SaruReply> {
  const t = withTimeout(50_000);
  try {
    const res = await fetch("/api/saru/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        sessionId: ids.sessionId,
        conversationId: ids.conversationId,
        inputType: "text",
        language: ids.language,
        timestamp: new Date().toISOString(),
      }),
      signal: t.signal,
    });
    return await parse(res);
  } catch (e) {
    wrapNetwork(e);
  } finally {
    t.done();
  }
}

export async function sendVoice(audio: Blob, ids: Ids, wantAudio: boolean): Promise<SaruReply> {
  const t = withTimeout(65_000);
  const form = new FormData();
  form.append("audio", audio, "speech");
  form.append("sessionId", ids.sessionId);
  form.append("conversationId", ids.conversationId);
  form.append("language", ids.language);
  form.append("wantAudio", String(wantAudio));
  form.append("inputType", "voice");
  form.append("timestamp", new Date().toISOString());
  try {
    const res = await fetch("/api/saru/voice", { method: "POST", body: form, signal: t.signal });
    return await parse(res);
  } catch (e) {
    wrapNetwork(e);
  } finally {
    t.done();
  }
}
