"use client";

import { Database, GitFork, UserCheck, Wrench } from "lucide-react";
import { ADVANCED, TECH_GROUPS } from "@/lib/content";
import { BRANDS, type BrandKey } from "@/lib/brands";
import BrandLogo from "@/components/ui/BrandLogo";
import TiltCard from "@/components/ui/TiltCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { useReveal } from "@/components/ui/Reveal";

const ORBIT: BrandKey[] = ["openai", "gemini", "claude", "whatsapp", "supabase", "gmail"];

const ADV_ICON = {
  rag: Database,
  tools: Wrench,
  multi: GitFork,
  hitl: UserCheck,
} as const;

function N8nFeature() {
  return (
    <TiltCard max={6} glare="rgba(234,75,113,0.22)" className="rounded-[28px]" style={{ height: "100%" }}>
      <div className="relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-[28px] border border-[#EA4B71]/30 bg-[linear-gradient(160deg,rgba(234,75,113,0.12),rgba(16,16,32,0.9)_45%,rgba(139,92,246,0.12))] p-7 md:p-9">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-[#EA4B71]/40 bg-[#EA4B71]/10 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#ff8fab]">
            Primary platform
          </span>
          <span className="font-mono text-[11px] text-muted">core of the program</span>
        </div>

        {/* 3D orbit around the n8n mark */}
        <div className="relative mx-auto my-8 grid h-[250px] w-[250px] place-items-center [transform:translateZ(40px)] [transform-style:preserve-3d]">
          <div className="absolute inset-0 rounded-full border border-white/[0.07]" aria-hidden />
          <div className="absolute inset-8 rounded-full border border-dashed border-[#EA4B71]/25" aria-hidden />
          <div className="spin-slow absolute inset-0" aria-hidden>
            {ORBIT.map((b, i) => {
              const a = (i / ORBIT.length) * Math.PI * 2;
              return (
                <span
                  key={b}
                  className="absolute grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-[#101020]/95 shadow-lg"
                  style={{ left: `calc(50% + ${(Math.cos(a) * 125).toFixed(2)}px - 22px)`, top: `calc(50% + ${(Math.sin(a) * 125).toFixed(2)}px - 22px)` }}
                >
                  <span className="spin-slow block [animation-direction:reverse]">
                    <BrandLogo brand={b} size={20} title={false} />
                  </span>
                </span>
              );
            })}
          </div>
          <div className="relative grid h-28 w-28 place-items-center rounded-[28px] border border-[#EA4B71]/50 bg-[#1a0f1a] shadow-[0_0_80px_-10px_rgba(234,75,113,0.7)]">
            <span className="pulse-ring absolute inset-0 rounded-[28px] border border-[#EA4B71]/50" aria-hidden />
            <BrandLogo brand="n8n" size={62} />
          </div>
        </div>

        <div className="mt-auto [transform:translateZ(30px)]">
          <h3 className="font-display text-4xl font-bold tracking-tight">n8n</h3>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            The workflow engine you will use every week. Build AI agents, connect any API and run production
            automations visually, in the cloud or on your own server.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {["AI Agent node", "Webhooks", "Code when needed", "Self-hostable"].map((t) => (
              <li key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12.5px] text-ink/85">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </TiltCard>
  );
}

export default function Ecosystem() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="learn" ref={ref} aria-labelledby="learn-title" className="relative px-4 py-28 sm:px-8 md:py-36">
      <div className="glow-blob right-0 top-1/3 h-[50vh] w-[50vh] bg-blue/10" aria-hidden />
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          id="learn-title"
          kicker="What students will learn"
          title={
            <>
              ONE STACK. <span className="text-gradient">ENDLESS AGENTS.</span>
            </>
          }
          sub="The tools real automation agencies use, learned hands-on and wired together into working systems."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-5">
            <N8nFeature />
          </div>

          <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:col-span-7">
            {TECH_GROUPS.map((g) => (
              <div key={g.label} data-reveal>
                <h3 className="kicker mb-4 !text-muted">{g.label}</h3>
                <ul className="space-y-3">
                  {g.items.map((t) => (
                    <li key={t.name}>
                      <TiltCard max={8} glare={`${BRANDS[t.brand].color}30`} className="rounded-2xl">
                        <div className="glass flex items-start gap-4 rounded-2xl p-4 transition-colors duration-300 group-hover/tilt:border-white/20">
                          <span
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#0c0c1a] transition-[transform,box-shadow] duration-500 ease-out-expo [transform:translateZ(0)] group-hover/tilt:[transform:translateZ(30px)_scale(1.08)]"
                            style={{ boxShadow: `0 0 0 0 ${BRANDS[t.brand].color}` }}
                          >
                            <BrandLogo brand={t.brand} size={24} />
                          </span>
                          <span className="min-w-0 [transform:translateZ(18px)]">
                            <span className="block font-display text-[15.5px] font-semibold tracking-tight">{t.name}</span>
                            <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{t.desc}</span>
                          </span>
                        </div>
                      </TiltCard>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* advanced agentic technologies */}
        <div className="mt-24">
          <div data-reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Advanced agentic technologies
            </h3>
            <p className="max-w-md text-[14.5px] text-muted">The concepts that separate an automation from an agent.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ADVANCED.map((a, i) => {
              const Icon = a.key === "mcp" ? null : ADV_ICON[a.key];
              return (
                <li key={a.key} data-reveal>
                  <TiltCard max={10} glare="rgba(34,211,238,0.18)" className="rounded-2xl" style={{ height: "100%" }}>
                    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
                      <span className="font-mono text-[10.5px] text-muted">0{i + 1}</span>
                      <span className="mt-6 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet/30 to-cyan/20 text-cyan ring-1 ring-white/10 transition-transform duration-500 ease-out-expo group-hover/tilt:[transform:translateZ(30px)_rotate(-6deg)]">
                        {Icon ? <Icon size={22} aria-hidden /> : <BrandLogo brand="mcp" size={24} />}
                      </span>
                      <span className="mt-5 font-display text-lg font-semibold tracking-tight">{a.name}</span>
                      <span className="mt-1.5 text-[13.5px] leading-snug text-muted">{a.desc}</span>
                    </div>
                  </TiltCard>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
