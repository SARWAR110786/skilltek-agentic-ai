"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Brain, MessageSquareCode, Workflow, Webhook, Bot, Database, FileSearch, Plug,
  Network, MessageCircle, Briefcase, ShieldCheck, Server, Rocket, Plus, type LucideIcon,
} from "lucide-react";
import { MODULES, PHASES, type ModuleIcon } from "@/lib/content";
import SectionHeading from "@/components/ui/SectionHeading";
import { useReveal } from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

const ICONS: Record<ModuleIcon, LucideIcon> = {
  brain: Brain, prompt: MessageSquareCode, workflow: Workflow, webhook: Webhook, bot: Bot,
  database: Database, search: FileSearch, plug: Plug, network: Network, chat: MessageCircle,
  briefcase: Briefcase, shield: ShieldCheck, server: Server, rocket: Rocket,
};

const pad = (n: number) => String(n).padStart(2, "0");
const phaseOf = (i: number) => PHASES.findIndex((p) => i >= p.from && i <= p.to);

export default function Curriculum() {
  const ref = useReveal<HTMLElement>();
  const list = useRef<HTMLOListElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const [active, setActive] = useState(0);

  const total = MODULES.length;
  const progress = (active + 1) / total;
  const R = 70;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const ctx = gsap.context(() => {
      // which module is being read: the one crossing the viewport centre
      ol.querySelectorAll<HTMLElement>("[data-module]").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
      // rail fill
      gsap.fromTo(
        rail.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: ol, start: "top 55%", end: "bottom 55%", scrub: 0.4 } }
      );
    }, ol);
    return () => ctx.revert();
  }, []);

  // accordion height changes move everything below — keep triggers accurate
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(t);
  }, [open]);

  const toggle = (i: number) => {
    setActive(i);
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const allOpen = open.size === total;
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(MODULES.map((_, i) => i)));

  const ph = phaseOf(active);

  return (
    <section id="curriculum" ref={ref} aria-labelledby="curriculum-title" className="relative px-4 py-28 sm:px-8 md:py-36">
      <div className="glow-blob left-1/4 top-40 h-[50vh] w-[50vh] bg-violet/10" aria-hidden />
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          id="curriculum-title"
          kicker={`Curriculum · ${total} modules`}
          title={
            <>
              FROM AI BEGINNER TO <span className="text-gradient">AUTOMATION BUILDER</span>
            </>
          }
          sub="A practical learning journey designed to turn AI concepts into working automation solutions."
        />

        {/* compact progress bar for small screens */}
        <div className="glass-strong sticky top-[80px] z-20 mt-12 rounded-2xl px-4 py-3 lg:hidden" aria-hidden>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="truncate">
              <span className="font-mono text-cyan">{pad(active + 1)}</span>
              <span className="text-muted"> / {total} · </span>
              {MODULES[active].title}
            </span>
            <span className="shrink-0 font-mono text-[11px] text-muted">{PHASES[ph].name}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet via-blue to-cyan transition-[width] duration-700 ease-out-expo"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-10 lg:mt-16 lg:grid-cols-[360px_1fr] lg:gap-16">
          {/* sticky progress panel */}
          <aside className="hidden lg:block" aria-label="Curriculum progress">
            <div className="glass sticky top-28 rounded-[28px] p-8">
              <div className="relative mx-auto h-[180px] w-[180px]">
                <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" aria-hidden>
                  <defs>
                    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="60%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                  <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                  <circle
                    cx="90" cy="90" r={R} fill="none" stroke="url(#ring)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
                    style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)", filter: "drop-shadow(0 0 8px rgba(139,92,246,0.7))" }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center" aria-live="polite">
                  <div>
                    <div className="display text-6xl">{pad(active + 1)}</div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">of {total}</div>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-center font-display text-lg font-semibold tracking-tight">{MODULES[active].title}</p>

              <ol className="mt-8 space-y-1.5">
                {PHASES.map((p, i) => {
                  const on = i === ph;
                  const done = i < ph;
                  return (
                    <li
                      key={p.name}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors duration-500 ${on ? "bg-white/[0.06] text-ink" : done ? "text-ink/70" : "text-muted"}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full transition-all duration-500 ${on ? "scale-125 bg-cyan shadow-[0_0_12px_#22d3ee]" : done ? "bg-violet" : "bg-white/20"}`}
                      />
                      <span className="flex-1">{p.name}</span>
                      <span className="font-mono text-[11px] text-muted">
                        {pad(p.from + 1)}–{pad(p.to + 1)}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <button type="button" onClick={toggleAll} className="btn btn-ghost btn-sm mt-8 w-full">
                {allOpen ? "Collapse all modules" : "Expand all modules"}
              </button>
            </div>
          </aside>

          {/* accordion */}
          <div className="relative">
            <div className="absolute bottom-0 left-[27px] top-0 hidden w-px bg-line md:block" aria-hidden>
              <div ref={rail} className="h-full w-full origin-top bg-gradient-to-b from-violet via-blue to-cyan" />
            </div>
            <div className="mb-4 flex justify-end lg:hidden">
              <button type="button" onClick={toggleAll} className="btn btn-ghost btn-sm">
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            </div>
            <ol ref={list} className="space-y-3">
              {MODULES.map((m, i) => {
                const isOpen = open.has(i);
                const isActive = active === i;
                const Icon = ICONS[m.icon];
                const firstOfPhase = PHASES.find((p) => p.from === i);
                return (
                  <li key={m.title} data-module>
                    {firstOfPhase && (
                      <p className={`kicker !text-muted md:pl-[72px] ${i === 0 ? "mb-3" : "mb-3 mt-10"}`}>
                        Phase {PHASES.indexOf(firstOfPhase) + 1} · {firstOfPhase.name}
                      </p>
                    )}
                    <div
                      className={`relative rounded-[22px] border transition-[background-color,border-color,box-shadow] duration-500 md:ml-[72px] ${
                        isOpen
                          ? "border-white/15 bg-white/[0.045] shadow-[0_24px_70px_-35px_rgba(139,92,246,0.6)]"
                          : "border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.035]"
                      }`}
                    >
                      {/* rail node */}
                      <span
                        className={`absolute -left-[52px] top-[26px] hidden h-3 w-3 rounded-full border-2 transition-all duration-500 md:block ${
                          isActive ? "scale-125 border-cyan bg-cyan shadow-[0_0_14px_#22d3ee]" : "border-white/25 bg-bg"
                        }`}
                        aria-hidden
                      />
                      <h3>
                        <button
                          type="button"
                          id={`mod-h-${i}`}
                          aria-expanded={isOpen}
                          aria-controls={`mod-p-${i}`}
                          onClick={() => toggle(i)}
                          className="flex w-full items-center gap-4 rounded-[22px] p-4 text-left md:gap-5 md:p-5"
                        >
                          <span
                            className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-all duration-700 ease-out-expo ${
                              isOpen
                                ? "rotate-[-8deg] scale-105 border-violet/60 bg-gradient-to-br from-violet/40 to-blue/25 text-white shadow-[0_0_30px_-4px_rgba(139,92,246,0.8)]"
                                : "border-white/10 bg-white/[0.04] text-muted"
                            }`}
                          >
                            <Icon size={21} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-mono text-[11px] uppercase tracking-[0.25em] text-cyan">
                              Module {pad(i + 1)}
                            </span>
                            <span className="mt-1 block font-display text-[clamp(1.05rem,1.8vw,1.4rem)] font-semibold leading-tight tracking-tight">
                              {m.title}
                            </span>
                          </span>
                          <span className="hidden font-mono text-[11px] text-muted sm:block">{m.topics.length} topics</span>
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo ${
                              isOpen ? "rotate-45 border-cyan/50 text-cyan" : "border-white/10 text-muted"
                            }`}
                            aria-hidden
                          >
                            <Plus size={16} />
                          </span>
                        </button>
                      </h3>
                      <div
                        id={`mod-p-${i}`}
                        role="region"
                        aria-labelledby={`mod-h-${i}`}
                        className="acc-body"
                        data-open={isOpen}
                        inert={!isOpen}
                      >
                        <div>
                          <ul className="grid gap-2 px-4 pb-5 sm:grid-cols-2 md:px-5 md:pl-[84px]">
                            {m.topics.map((t, ti) => (
                              <li
                                key={t}
                                className={`flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-2.5 text-[14px] transition-all duration-500 ease-out-expo ${
                                  isOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                                }`}
                                style={{ transitionDelay: isOpen ? `${120 + ti * 55}ms` : "0ms" }}
                              >
                                <span className="font-mono text-[10.5px] text-violet">{pad(i + 1)}.{ti + 1}</span>
                                <span className="text-ink/90">{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
