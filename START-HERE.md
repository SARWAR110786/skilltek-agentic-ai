# SkillTek Agentic AI website: start here

**Live site:** https://skilltek-agentic-ai.vercel.app
**GitHub:** https://github.com/SARWAR110786/skilltek-agentic-ai (every push to `main` auto-deploys on Vercel)

## What's inside
| Path | What it is |
|---|---|
| `src/` | The website (Next.js): hero, sections, apply form, Saru assistant (`src/components/saru`, `src/lib/saru`, `src/app/api/saru`) |
| `src/lib/content.ts` | All website text: modules, tools, projects, FAQ |
| `public/brand/` | Skilltek logo |
| `SARU_SETUP.md` | How Saru works (chat, standard voice, live streaming voice), settings, privacy |
| `n8n-workflows/` | n8n workflows overview, credentials, Google Sheet, Saru's knowledge base (`saru-knowledge-base.csv`) |
| `google-sheet/apps-script.gs` | Optional alternative way to save applications to a Google Sheet without n8n |
| `.env.example` | The settings the website needs (no secret values) |

## Run it on a computer
```
npm install
npm run dev        # then open http://localhost:3000
```
Create `.env.local` from `.env.example` and fill in the values (they are in Vercel → Project →
Settings → Environment Variables). Secret keys are intentionally **not** included in this zip.

## Deploy
Push to the GitHub repo and Vercel deploys automatically.
