"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Cog, Sparkles, Bot } from "lucide-react";
import { EVOLUTION } from "@/lib/content";
import { useReveal } from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

const META = {
  traditional: { icon: Cog, autonomy: 18, accent: "#94A3B8", label: "Rule-based" },
  ai: { icon: Sparkles, autonomy: 55, accent: "#3B82F6", label: "AI-assisted" },
  agentic: { icon: Bot, autonomy: 92, accent: "#8B5CF6", label: "Autonomous" },
} as const;

function Diagram({ kind, active }: { kind: keyof typeof META; active: boolean }) {
  const stroke = active ? META[kind].accent : "#475569";
  if (kind === "traditional")
    return (
      <svg viewBox="0 0 280 110" className="h-full w-full" aria-hidden>
        {[20, 110, 200].map((x, i) => (
          <g key={x}>
            <rect x={x} y={38} width={60} height={34} rx={8} fill="#101020" stroke={stroke} strokeWidth={1.5} />
            <text x={x + 30} y={60} textAnchor="middle" fontSize="11" fill="#94A3B8" fontFamily="var(--font-jbmono)">
              {["IF", "THEN", "END"][i]}
            </text>
          </g>
        ))}
        <path d="M80 55H110M170 55H200" stroke={stroke} strokeWidth={1.5} />
      </svg>
    );
  if (kind === "ai")
    return (
      <svg viewBox="0 0 280 110" className="h-full w-full" aria-hidden>
        <rect x={14} y={38} width={60} height={34} rx={8} fill="#101020" stroke="#475569" strokeWidth={1.5} />
        <rect x={206} y={38} width={60} height={34} rx={8} fill="#101020" stroke="#475569" strokeWidth={1.5} />
        <path d="M74 55H112M168 55H206" stroke={stroke} strokeWidth={1.5} className={active ? "flow-dash" : ""} />
        <circle cx={140} cy={55} r={28} fill={active ? "rgba(59,130,246,0.15)" : "#101020"} stroke={stroke} strokeWidth={1.5} />
        {active && <circle cx={140} cy={55} r={28} fill="none" stroke={stroke} className="pulse-ring" style={{ transformOrigin: "140px 55px" }} />}
        <text x={140} y={60} textAnchor="middle" fontSize="13" fill="#F8FAFC" fontFamily="var(--font-jbmono)">AI</text>
      </svg>
    );
  const tools = [
    [50, 22], [230, 22], [50, 88], [230, 88],
  ];
  return (
    <svg viewBox="0 0 280 110" className="h-full w-full" aria-hidden>
      {tools.map(([x, y], i) => (
        <g key={i}>
          <path d={`M140 55L${x} ${y}`} stroke={stroke} strokeWidth={1.2} className={active ? "flow-dash" : ""} style={{ animationDelay: `${i * -0.35}s` }} />
          <rect x={x - 22} y={y - 12} width={44} height={24} rx={7} fill="#101020" stroke={active ? "#22D3EE" : "#475569"} strokeWidth={1.2} />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill="#94A3B8" fontFamily="var(--font-jbmono)">
            {["tool", "memory", "plan", "agent"][i]}
          </text>
        </g>
      ))}
      <circle cx={140} cy={55} r={24} fill={active ? "rgba(139,92,246,0.22)" : "#101020"} stroke={stroke} strokeWidth={1.5} />
      {active && <circle cx={140} cy={55} r={24} fill="none" stroke={stroke} className="pulse-ring" style={{ transformOrigin: "140px 55px" }} />}
      <text x={140} y={59} textAnchor="middle" fontSize="10" fill="#F8FAFC" fontFamily="var(--font-jbmono)">AGENT</text>
    </svg>
  );
}

export default function Intro() {
  const ref = useReveal<HTMLElement>();
  const beam = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<keyof typeof META>("agentic");

  useEffect(() => {
    if (!beam.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        beam.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: beam.current, start: "top 85%", end: "top 35%", scrub: 0.6 },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={ref} aria-labelledby="about-title" className="relative px-4 py-28 sm:px-8 md:py-40">
      <div className="glow-blob -left-40 top-20 h-[40vh] w-[40vh] bg-violet/15" aria-hidden />
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <SectionHeading
            id="about-title"
            kicker="About the course"
            title={
              <>
                THE NEXT GENERATION <span className="text-gradient">OF AUTOMATION</span>
              </>
            }
          />
          <div className="space-y-5 text-[15.5px] leading-relaxed text-muted lg:pb-3">
            <p data-reveal>
              <span className="text-ink">Artificial Intelligence is moving beyond simple chatbots.</span> Modern AI
              agents can understand tasks, use tools, access information, make decisions, and execute complex workflows.
            </p>
            <p data-reveal>
              Our Agentic AI &amp; Automation program introduces students to the practical world of intelligent
              automation through visual workflow builders and low-code tools.
            </p>
            <p data-reveal>
              Students learn to create real-world automation solutions without needing advanced programming skills.
            </p>
          </div>
        </div>

        {/* evolution */}
        <div className="mt-20 md:mt-28">
          <div className="mb-6 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            <span>Evolution of automation</span>
            <span className="hidden sm:inline">Autonomy →</span>
          </div>
          <div className="relative mb-8 h-px bg-line" aria-hidden>
            <div ref={beam} className="absolute inset-0 origin-left bg-gradient-to-r from-slate-500 via-blue to-violet shadow-[0_0_18px_rgba(139,92,246,0.8)]" />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row" role="list">
            {EVOLUTION.map((e) => {
              const m = META[e.key];
              const isActive = active === e.key;
              const Icon = m.icon;
              return (
                <article
                  key={e.key}
                  role="listitem"
                  data-reveal
                  tabIndex={0}
                  onMouseEnter={() => setActive(e.key)}
                  onFocus={() => setActive(e.key)}
                  onClick={() => setActive(e.key)}
                  aria-label={`${e.title}: ${e.points.join(", ")}`}
                  className={`group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-3xl border p-7 transition-[flex-grow,border-color,background-color,box-shadow] duration-700 ease-out-expo md:p-8 ${
                    isActive
                      ? "border-white/15 bg-white/[0.045] shadow-[0_30px_80px_-30px_rgba(139,92,246,0.45)] lg:flex-[1.55]"
                      : "border-white/[0.07] bg-white/[0.02] lg:flex-1"
                  }`}
                >
                  {e.key === "agentic" && (
                    <div
                      className={`pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet/25 blur-3xl transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`}
                      aria-hidden
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">{e.stage}</span>
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl border transition-colors duration-500"
                      style={{ borderColor: isActive ? m.accent : "rgba(255,255,255,0.1)", color: isActive ? m.accent : "#94A3B8" }}
                    >
                      <Icon size={18} aria-hidden />
                    </span>
                  </div>

                  <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight md:text-[1.7rem]">{e.title}</h3>
                  <p className="mt-2 text-[14.5px] text-muted">{e.tagline}</p>

                  <div className="my-7 h-[110px] rounded-2xl border border-white/[0.06] bg-black/20 p-2">
                    <Diagram kind={e.key} active={isActive} />
                  </div>

                  <ul className="space-y-2.5">
                    {e.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-3 text-[14.5px]">
                        <span
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                          style={{ background: `${m.accent}22`, color: m.accent }}
                        >
                          <Check size={12} strokeWidth={3} aria-hidden />
                        </span>
                        <span className={isActive ? "text-ink" : "text-ink/75"}>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <div className="mb-2 flex justify-between font-mono text-[10.5px] uppercase tracking-[0.25em] text-muted">
                      <span>{m.label}</span>
                      <span>{m.autonomy}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-[width] duration-1000 ease-out-expo"
                        style={{
                          width: isActive ? `${m.autonomy}%` : `${m.autonomy * 0.6}%`,
                          background: `linear-gradient(90deg, ${m.accent}88, ${m.accent})`,
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
