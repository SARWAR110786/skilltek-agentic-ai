# Saru Assistant: setup & operations

Saru is the SkillTek AI chat + voice assistant. It appears on every page (bottom-right, "Ask Saru").

## How it works
```
Browser widget ──► /api/saru/chat   ─┐  (Next.js server: validates input, rate-limits,
               ──► /api/saru/voice  ─┤   adds the secret key; keys never reach the browser)
                                     ▼
          n8n workflow "Saru Assistant - SkillTek AI Chat & Voice"
            Chat In / Voice In (only runs with the x-saru-key header)
            Voice: OpenAI speech-to-text (gpt-4o-mini-transcribe)
            Saru Agent (gpt-4.1-mini) + Postgres memory (Supabase, table saru_chat_histories)
              tools → n8n data table "Saru Knowledge Base" (courses, admissions, institute,
                      services, verification, contact)
            Voice: OpenAI text-to-speech (gpt-4o-mini-tts) → mp3 back to the browser
```
**Voice has two modes:**
- **Live call (default, streaming):** the browser connects over WebRTC to OpenAI Realtime (`gpt-realtime`,
  speech-in → speech-out, ~1 s replies, callers can interrupt). n8n workflow **"Saru Assistant - Realtime Voice Session"**
  loads the Saru Knowledge Base and issues a short-lived (10 min) client secret; the OpenAI key never leaves n8n.
  Change model/voice in that workflow's "Build Voice Session" node (`MODEL`, `VOICE`). Live-call transcripts are added
  to the on-page chat history but are not stored in n8n memory.
- **Standard voice (fallback):** turn-based speech-to-text → Saru agent → text-to-speech through the main workflow,
  used automatically if live voice can't start on a device.
Languages: English, Urdu and Sindhi in text. Speech recognition handles all three; spoken Sindhi output quality depends on OpenAI TTS and may sound accented.

## Environment variables (server-only, never NEXT_PUBLIC_)
| Name | Value |
|---|---|
| `N8N_TEXT_CHAT_WEBHOOK` | `https://hahoiu.app.n8n.cloud/webhook/saru-chat` |
| `N8N_VOICE_WEBHOOK` | `https://hahoiu.app.n8n.cloud/webhook/saru-voice` |
| `N8N_REALTIME_WEBHOOK` | `https://hahoiu.app.n8n.cloud/webhook/saru-realtime` |
| `SARU_N8N_SECRET` | same value as in the n8n webhooks' "Only run if" option (already in `.env.local`) |

On Vercel: Project → Settings → Environment Variables → add all three → redeploy.

## Update what Saru knows (no rebuild needed)
n8n → Overview → Data tables → **Saru Knowledge Base**. Edit `content`, or add rows with `category` =
`courses` | `admissions` | `institute` | `services` | `verification` | `contact`. Changes apply to the next question.

## Hosting
Saru needs the Next.js server (API routes), so deploy as a normal Next.js app (Vercel recommended):
`npm run build && npm start`. `npm run build:static` makes a static preview **without** Saru's backend.

## Privacy & security
- Execution data is not saved in n8n (workflow settings), so recordings and messages are not stored there.
  Conversation text is kept in Supabase table `saru_chat_histories` for memory; delete rows to purge.
- Rate limits: 20 chat / 10 voice requests per minute per IP (per server instance).
- Only same-site requests are accepted; payloads are length-limited and whitelisted; the agent is instructed
  never to invent fees/dates or reveal student records, and to treat knowledge-base text as data, not instructions.
- Rotate the key: change it in both `.env` (SARU_N8N_SECRET) and the two webhook nodes' "Only run if" expression.
