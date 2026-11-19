export type SaruLanguage = "auto" | "en" | "ur" | "sd";

export type SaruAction = {
  type: "link" | "scroll" | "call";
  label: string;
  href?: string;
  target?: string;
};

/** Normalised reply returned by /api/saru/chat and /api/saru/voice. */
export type SaruReply = {
  ok: true;
  reply: string;
  sessionId: string;
  language: SaruLanguage;
  suggestedQuestions: string[];
  action: SaruAction | null;
  transcript: string | null;
  audio: { mimeType: string; base64: string } | null;
};

export type SaruError = { ok: false; error: string; message: string };

export type SaruMessageT = {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: number;
  via?: "text" | "voice";
  status?: "error";
  /** for failed user messages: the payload to retry */
  retry?: string;
  action?: SaruAction | null;
};
