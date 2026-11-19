"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { PROJECTS } from "@/lib/content";
import { BRANDS } from "@/lib/brands";
import BrandLogo from "@/components/ui/BrandLogo";
import { useReveal } from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const ref = useReveal<HTMLElement>();
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    // horizontal pinned gallery on desktop; a normal vertical stack elsewhere
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth + 64;
      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (s) => bar.current && (bar.current.style.transform = `scaleX(${s.progress})`),
        },
      });
      return () => tween.scrollTrigger?.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="projects" ref={ref} aria-labelledby="projects-title" className="relative">
      <div ref={pin} className="relative overflow-hidden py-28 md:py-36 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0">
        <div className="glow-blob left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 bg-violet/10" aria-hidden />
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <header className="max-w-3xl">
              <p data-reveal className="kicker mb-5">Portfolio projects</p>
              <h2 id="projects-title" data-reveal className="display text-[clamp(2.3rem,5.5vw,4.8rem)]">
                BUILD SYSTEMS <span className="text-gradient">THAT ACTUALLY RUN.</span>
              </h2>
            </header>
            <p data-reveal className="max-w-sm text-[15px] leading-relaxed text-muted">
              Every module ends in something that works. These are the kinds of systems students build and keep for
              their portfolio.
            </p>
          </div>
          <div className="mt-8 hidden h-px w-full bg-line lg:block" aria-hidden>
            <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-violet via-blue to-cyan" />
          </div>
        </div>

        <div
          ref={track}
          className="mx-auto mt-12 grid max-w-[1400px] gap-5 px-4 sm:grid-cols-2 sm:px-8 lg:mx-0 lg:mt-14 lg:flex lg:w-max lg:max-w-none lg:gap-6 lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]"
        >
          {PROJECTS.map((p, i) => (
            <article
              key={p.title}
              data-reveal
              className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-7 transition-colors duration-500 hover:border-white/20 lg:h-[440px] lg:w-[460px] lg:shrink-0"
            >
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
                style={{ background: BRANDS[p.flow[0]].color }}
                aria-hidden
              />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">Project {String(i + 1).padStart(2, "0")}</span>
                <ArrowRight size={18} className="text-muted transition-transform duration-500 group-hover:-rotate-45 group-hover:text-cyan" aria-hidden />
              </div>

              {/* workflow chain */}
              <div className="mt-8 flex items-center rounded-2xl border border-white/[0.06] bg-black/25 p-4" aria-label={`Built with ${p.flow.map((f) => BRANDS[f].name).join(", ")}`}>
                {p.flow.map((b, bi) => (
                  <Fragment key={b + bi}>
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-[#0c0c1a] transition-transform duration-500 ease-out-expo group-hover:-translate-y-1"
                      style={{ borderColor: `${BRANDS[b].color}55`, transitionDelay: `${bi * 60}ms` }}
                      title={BRANDS[b].name}
                    >
                      <BrandLogo brand={b} size={22} title={false} />
                    </span>
                    {bi < p.flow.length - 1 && (
                      <svg className="h-3 min-w-4 flex-1" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden>
                        <line x1="0" y1="6" x2="100" y2="6" stroke="url(#pg)" strokeWidth="2" className="flow-dash" />
                        <defs>
                          <linearGradient id="pg">
                            <stop offset="0" stopColor="#8B5CF6" />
                            <stop offset="1" stopColor="#22D3EE" />
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                  </Fragment>
                ))}
              </div>

              <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.summary}</p>
              <ul className="mt-auto flex flex-wrap gap-2 pt-6">
                {p.tags.map((t) => (
                  <li key={t} className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-ink/80">
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
