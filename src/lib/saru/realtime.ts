/**
 * Live streaming voice for Saru: the browser talks to OpenAI Realtime over
 * WebRTC (speech in → speech out, with server-side turn detection and
 * barge-in). The short-lived client secret comes from our own server
 * (/api/saru/realtime → n8n), so no permanent API key ever reaches the browser.
 */
import { audioContext } from "./recorder";
import type { SaruLanguage } from "./types";

export type LiveEvent =
  | { kind: "state"; state: "connecting" | "listening" | "user-speaking" | "thinking" | "speaking" }
  | { kind: "user"; text: string }
  | { kind: "assistant"; text: string }
  | { kind: "error"; message: string };

export type LiveCall = {
  micAnalyser: AnalyserNode;
  outAnalyser: AnalyserNode | null;
  setMuted: (muted: boolean) => void;
  setLanguage: (lang: SaruLanguage) => void;
  close: () => void;
};

export class LiveUnavailable extends Error {}

const LANG_NAME: Record<SaruLanguage, string> = { auto: "", en: "English", ur: "Urdu", sd: "Sindhi" };

async function getSecret(language: SaruLanguage) {
  const res = await fetch("/api/saru/realtime", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new LiveUnavailable(data?.message ?? "Live voice is unavailable right now.");
  return data as { clientSecret: string; model: string };
}

export async function startLiveCall(opts: {
  language: SaruLanguage;
  onEvent: (e: LiveEvent) => void;
}): Promise<LiveCall> {
  const { language, onEvent } = opts;
  if (typeof RTCPeerConnection === "undefined" || !navigator.mediaDevices?.getUserMedia)
    throw new LiveUnavailable("This browser doesn't support live voice.");

  onEvent({ kind: "state", state: "connecting" });

  // microphone first (permission prompt), then the session — in parallel
  const [mic, secret] = await Promise.all([
    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    }),
    getSecret(language),
  ]);

  const ctx = audioContext();
  const micSource = ctx.createMediaStreamSource(mic);
  const micAnalyser = ctx.createAnalyser();
  micAnalyser.fftSize = 1024;
  micSource.connect(micAnalyser);

  const pc = new RTCPeerConnection();
  const audioEl = new Audio();
  audioEl.autoplay = true;
  let outAnalyser: AnalyserNode | null = null;
  const call: LiveCall = {
    micAnalyser,
    outAnalyser: null,
    setMuted: (m) => mic.getAudioTracks().forEach((t) => (t.enabled = !m)),
    setLanguage: () => {},
    close: () => {},
  };

  pc.ontrack = (e) => {
    audioEl.srcObject = e.streams[0];
    void audioEl.play().catch(() => {});
    try {
      const src = ctx.createMediaStreamSource(e.streams[0]);
      outAnalyser = ctx.createAnalyser();
      outAnalyser.fftSize = 1024;
      src.connect(outAnalyser); // analysis only — playback is via the <audio> element
      call.outAnalyser = outAnalyser;
    } catch {
      /* visualizer only */
    }
  };
  mic.getTracks().forEach((t) => pc.addTrack(t, mic));

  const dc = pc.createDataChannel("oai-events");
  const send = (msg: unknown) => dc.readyState === "open" && dc.send(JSON.stringify(msg));

  let closed = false;
  let assistantText = "";
  dc.onmessage = (m) => {
    let ev: { type?: string; transcript?: string; delta?: string; error?: { message?: string } };
    try {
      ev = JSON.parse(m.data);
    } catch {
      return;
    }
    switch (ev.type) {
      case "input_audio_buffer.speech_started":
        onEvent({ kind: "state", state: "user-speaking" });
        break;
      case "input_audio_buffer.speech_stopped":
        onEvent({ kind: "state", state: "thinking" });
        break;
      case "conversation.item.input_audio_transcription.completed":
        if (ev.transcript?.trim()) onEvent({ kind: "user", text: ev.transcript.trim() });
        break;
      case "output_audio_buffer.started":
      case "response.output_audio.delta":
      case "response.audio.delta":
        onEvent({ kind: "state", state: "speaking" });
        break;
      case "response.output_audio_transcript.delta":
      case "response.audio_transcript.delta":
        assistantText += ev.delta ?? "";
        break;
      case "response.output_audio_transcript.done":
      case "response.audio_transcript.done": {
        const text = (ev.transcript ?? assistantText).trim();
        assistantText = "";
        if (text) onEvent({ kind: "assistant", text });
        break;
      }
      case "output_audio_buffer.stopped":
      case "output_audio_buffer.cleared":
        onEvent({ kind: "state", state: "listening" });
        break;
      case "error":
        onEvent({ kind: "error", message: ev.error?.message ?? "Live voice error." });
        break;
    }
  };

  dc.onopen = () => {
    onEvent({ kind: "state", state: "listening" });
    // a short greeting gives instant feedback that the call is live
    send({
      type: "response.create",
      response: {
        instructions:
          language === "ur"
            ? "Greet the caller warmly in Urdu in one short sentence as Saru from SkillTek Institute and ask how you can help."
            : language === "sd"
              ? "Greet the caller warmly in Sindhi in one short sentence as Saru from SkillTek Institute and ask how you can help."
              : "Say 'Assalam o Alaikum! I'm Saru from SkillTek Institute. How can I help you?' warmly, in one short sentence.",
      },
    });
  };

  call.setLanguage = (lang) => {
    if (lang === "auto") return;
    send({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "system",
        content: [{ type: "input_text", text: `From now on, speak only ${LANG_NAME[lang]} unless the caller clearly switches language.` }],
      },
    });
  };

  const close = () => {
    if (closed) return;
    closed = true;
    try {
      dc.close();
    } catch {}
    pc.getSenders().forEach((s) => s.track?.stop());
    pc.close();
    mic.getTracks().forEach((t) => t.stop());
    micSource.disconnect();
    audioEl.srcObject = null;
  };
  call.close = close;

  pc.onconnectionstatechange = () => {
    if (!closed && (pc.connectionState === "failed" || pc.connectionState === "disconnected")) {
      onEvent({ kind: "error", message: "The live call was disconnected." });
    }
  };

  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const sdp = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      body: offer.sdp,
      headers: { Authorization: `Bearer ${secret.clientSecret}`, "Content-Type": "application/sdp" },
    });
    if (!sdp.ok) throw new LiveUnavailable(`Live voice could not connect (${sdp.status}).`);
    await pc.setRemoteDescription({ type: "answer", sdp: await sdp.text() });
  } catch (e) {
    close();
    throw e instanceof LiveUnavailable ? e : new LiveUnavailable("Live voice could not connect.");
  }
  return call;
}
