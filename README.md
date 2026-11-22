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

## Apply buttons
There is no application form on this site. Every "Apply" button opens the official SkillTek
admissions page: https://skilltek-one.vercel.app/admissions (set in `SITE.applyUrl`, `src/lib/content.ts`).
