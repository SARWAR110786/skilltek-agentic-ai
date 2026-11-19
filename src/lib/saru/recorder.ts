/**
 * Microphone capture with simple voice-activity detection: recording starts
 * immediately, stops automatically after the speaker goes quiet, and exposes
 * an AnalyserNode for the waveform visualizer. Audio stays in memory only.
 */
export type RecorderHandle = {
  analyser: AnalyserNode;
  /** resolves with the recorded clip, or null if nothing was said */
  result: Promise<Blob | null>;
  stop: () => void;
  cancel: () => void;
};

export class MicError extends Error {
  constructor(message: string, public code: "unsupported" | "denied" | "no_device" | "failed") {
    super(message);
  }
}

function pickMime() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
}

let sharedCtx: AudioContext | null = null;
export function audioContext() {
  if (!sharedCtx) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedCtx = new Ctx();
  }
  if (sharedCtx.state === "suspended") void sharedCtx.resume();
  return sharedCtx;
}

export async function startRecording(opts: {
  maxMs?: number;
  silenceMs?: number;
  noSpeechMs?: number;
  onSpeech?: () => void;
} = {}): Promise<RecorderHandle> {
  const { maxMs = 30_000, silenceMs = 1300, noSpeechMs = 8000, onSpeech } = opts;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined")
    throw new MicError("This browser can't record audio. Please use text chat.", "unsupported");

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (e) {
    const name = e instanceof DOMException ? e.name : "";
    if (name === "NotAllowedError" || name === "SecurityError")
      throw new MicError("Microphone permission was denied. Allow it in your browser settings, or type your question.", "denied");
    if (name === "NotFoundError") throw new MicError("No microphone was found on this device.", "no_device");
    throw new MicError("Couldn't start the microphone. Please type your question instead.", "failed");
  }

  const ctx = audioContext();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.6;
  source.connect(analyser);

  const mime = pickMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32_000 } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  let spoke = false;
  let cancelled = false;
  let raf = 0;
  const started = performance.now();
  let lastLoud = started;

  const cleanup = () => {
    cancelAnimationFrame(raf);
    source.disconnect();
    stream.getTracks().forEach((t) => t.stop());
  };

  const result = new Promise<Blob | null>((resolve) => {
    rec.onstop = () => {
      cleanup();
      if (cancelled || !spoke) return resolve(null);
      resolve(new Blob(chunks, { type: (rec.mimeType || mime || "audio/webm").split(";")[0] }));
    };
  });

  const stop = () => rec.state !== "inactive" && rec.stop();
  const cancel = () => {
    cancelled = true;
    stop();
  };

  // voice-activity detection loop
  const buf = new Float32Array(analyser.fftSize);
  const tick = () => {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    const now = performance.now();
    if (rms > 0.02) {
      if (!spoke) onSpeech?.();
      spoke = true;
      lastLoud = now;
    }
    if (now - started > maxMs) return stop();
    if (spoke && now - lastLoud > silenceMs) return stop();
    if (!spoke && now - started > noSpeechMs) return stop();
    raf = requestAnimationFrame(tick);
  };

  rec.start(250);
  raf = requestAnimationFrame(tick);
  return { analyser, result, stop, cancel };
}

/** Plays base64 audio and exposes an analyser for the visualizer. */
export function playAudio(base64: string, mimeType: string) {
  const ctx = audioContext();
  const el = new Audio(`data:${mimeType};base64,${base64}`);
  const src = ctx.createMediaElementSource(el);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  src.connect(analyser);
  analyser.connect(ctx.destination);
  const ended = new Promise<void>((resolve) => {
    el.onended = () => resolve();
    el.onerror = () => resolve();
  });
  const started = el.play().catch(() => undefined);
  return {
    analyser,
    ended,
    started,
    stop: () => {
      el.pause();
      el.src = "";
    },
  };
}
