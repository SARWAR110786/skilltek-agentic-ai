# Skilltek: Agentic AI & Automation course website

Single-page, cinematic course site for **The Skilltek Institute & Media Solution**.
Built with the `scroll-site-generator` skill's GSAP/Next.js hybrid architecture
(Lenis on the GSAP ticker, pinned scrub sections, brand-page reveals). The hero film is a
real-time Three.js scene instead of AI video, so it needs no generation credits.

**Stack:** Next.js 15 (App Router, static export) · TypeScript · Tailwind v4 · GSAP + ScrollTrigger · Lenis ·
React Three Fiber / Three.js · Lucide · official brand marks (Simple Icons / LobeHub).

## Run
```bash
npm install
cp .env.example .env.local   # fill in contact details + form webhook
npm run dev                  # http://localhost:3000
npm run build                # static site in ./out — upload anywhere
```

## Where things live
- `src/lib/content.ts` – all copy: modules, tools, projects, FAQ, contact config
- `src/lib/brands.ts` – official logo paths + brand colours
- `src/components/hero/` – 3D scene (`HeroScene.tsx`), canvas textures, scroll story
- `src/components/sections/` – About, Ecosystem, Curriculum, Projects, Program, Apply, Footer
- `public/brand/` – Skilltek logo

## Apply form
Set `NEXT_PUBLIC_APPLY_WEBHOOK_URL` to an n8n Webhook (or any JSON endpoint). Without it, the form
falls back to an email to `NEXT_PUBLIC_CONTACT_EMAIL`. With neither set, the form shows a notice.
