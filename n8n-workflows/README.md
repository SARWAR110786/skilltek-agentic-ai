# n8n setup: workflows, tables and credentials

Everything the website talks to lives in your n8n Cloud instance: https://hahoiu.app.n8n.cloud

## Workflows

| Workflow | What it does | Webhook (production URL) |
|---|---|---|
| **Saru Assistant - SkillTek AI Chat & Voice** | Text chat + standard voice: speech-to-text → Saru agent (gpt-4.1-mini, Postgres memory, knowledge base in the prompt) → text-to-speech | `/webhook/saru-chat`, `/webhook/saru-voice` |
| **Saru Assistant - Realtime Voice Session** | Live streaming calls: loads the knowledge base and creates a 10-minute OpenAI Realtime session (`gpt-realtime`, voice `marin`) | `/webhook/saru-realtime` |
| **Skilltek - Course Applications** | **Switched off (unpublished).** The website no longer has an apply form; students apply on https://theskilltek.com/admissions | — |

The three Saru webhooks only run when the request carries the secret header `x-saru-key`
(value = `SARU_N8N_SECRET` in Vercel; it is also visible in each webhook node's *Options → Only run if*).

### Download exact copies (backup / move to another n8n)
In n8n open each workflow → **⋯ (top right) → Download**. You get a `.json` file you can later
import with **Create → Import from file**. After importing, re-select the credentials below on the
OpenAI and Postgres nodes, and publish.

## Data tables
- **Saru Knowledge Base**: everything Saru knows. Columns `category` (courses / admissions / institute /
  services / verification / contact), `topic`, `content`. Edit here; changes apply on the next question.
  A copy is in `saru-knowledge-base.csv`.
- **Skilltek Applications**: old applications from the earlier form (no new rows are added).

## Credentials used
- **OpenAI account**: chat model, speech-to-text, text-to-speech, realtime sessions
- **Supabase Postgres**: Saru conversation memory (table `saru_chat_histories`)

## Google Sheet (old applications only)
https://docs.google.com/spreadsheets/d/1NonvLbg_cvagF-ZXO5aRjTe6-_8S9S7Sq6bTEaLPA3c/edit
Columns: Date, Name, Phone, Email, Background, Experience, Message, Program, Status.
