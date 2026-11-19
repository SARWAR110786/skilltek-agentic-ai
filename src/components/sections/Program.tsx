"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GraduationCap, Store, Laptop, BriefcaseBusiness, Plus } from "lucide-react";
import { AUDIENCE, FAQ, MODULES, PROJECTS, TECH_GROUPS } from "@/lib/content";
import SectionHeading from "@/components/ui/SectionHeading";
import { useReveal } from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

const toolCount = TECH_GROUPS.reduce((n, g) => n + g.items.length, 0) + 1; // + n8n

const STATS = [
  { n: 2, suffix: "", label: "Months, start to portfolio" },
  { n: MODULES.length, suffix: "", label: "Hands-on modules" },
  { n: PROJECTS.length, suffix: "", label: "Portfolio projects" },
  { n: toolCount, suffix: "+", label: "Platforms you'll use" },
];

const AUD_ICONS = [GraduationCap, Store, Laptop, BriefcaseBusiness];

export default function Program() {
  const ref = useReveal<HTMLElement>();
  const nums = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = nums.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        if (reduce) return;
        const o = { v: 0 };
        el.textContent = "0";
        gsap.to(o, {
          v: end,
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => (el.textContent = String(Math.round(o.v)).padStart(2, "0")),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="program" ref={ref} aria-labelledby="program-title" className="relative px-4 py-28 sm:px-8 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        {/* stats */}
        <div
          ref={nums}
          className="grid grid-cols-2 overflow-hidden rounded-[28px] border border-white/[0.08] lg:grid-cols-4"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              className={`relative p-7 md:p-10 ${i % 2 ? "border-l border-white/[0.08]" : ""} ${i > 1 ? "border-t border-white/[0.08] lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
            >
              <div className="display text-[clamp(3rem,7vw,6rem)]">
                <span className="text-gradient" data-count={s.n}>
                  {String(s.n).padStart(2, "0")}
                </span>
                <span className="text-gradient">{s.suffix}</span>
              </div>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* audience */}
        <div className="mt-28 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            id="program-title"
            kicker="Who it's for"
            title={
              <>
                NO CODE? <span className="text-gradient">NO PROBLEM.</span>
              </>
            }
            sub="If you can describe a process, you can learn to automate it. The program meets you where you are."
          />
          <ul className="grid gap-4 sm:grid-cols-2">
            {AUDIENCE.map((a, i) => {
              const Icon = AUD_ICONS[i];
              return (
                <li
                  key={a.title}
                  data-reveal
                  className="group glass rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/20"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet/30 to-blue/20 text-cyan ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110">
                    <Icon size={20} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{a.title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{a.desc}</p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-28 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p data-reveal className="kicker mb-5">FAQ</p>
            <h2 data-reveal className="display text-[clamp(2rem,4vw,3.4rem)]">Questions, answered.</h2>
          </div>
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {FAQ.map((f) => (
              <details key={f.q} data-reveal className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-[17px] font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-muted transition-transform duration-500 group-open:rotate-45 group-open:text-cyan">
                    <Plus size={15} aria-hidden />
                  </span>
                </summary>
                <p className="max-w-[62ch] pb-6 text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
