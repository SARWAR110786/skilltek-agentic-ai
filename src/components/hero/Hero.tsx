"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { scrollToId } from "@/lib/scroll";
import { SITE } from "@/lib/content";
import type { BrandKey } from "@/lib/brands";
import { heroState } from "./heroState";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => null });

const LINE1 = "BUILD THE FUTURE";
const LINE2 = "WITH AI.";
const STACK: BrandKey[] = ["n8n", "openai", "gemini", "claude", "whatsapp", "supabase", "telegram", "make", "zapier"];

const CAPTIONS = [
  { k: "01 · Think", t: "Agents that understand the task." },
  { k: "02 · Act", t: "Workflows that use real tools." },
  { k: "03 · Ship", t: "Built visually. Deployed for real." },
];

function Chars({ text, gradient }: { text: string; gradient?: boolean }) {
  const n = text.replace(/ /g, "").length;
  let k = 0;
  return (
    <span className="block overflow-hidden pb-[0.06em]" aria-hidden>
      {text.split(" ").map((word, wi) => (
        // words stay unbroken; each glyph animates on its own
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((c) => {
            const i = k++;
            return (
              <span
                key={i}
                data-char
                className={`inline-block will-change-transform ${gradient ? "text-gradient" : ""}`}
                // each glyph shows its own slice of one continuous gradient (background-clip:
                // text does not survive per-character transforms on a shared parent)
                style={gradient ? { backgroundSize: `${n * 100}% 100%`, backgroundPosition: `${(i / (n - 1)) * 100}% 0` } : undefined}
              >
                {c}
              </span>
            );
          })}
          {wi < text.split(" ").length - 1 && <span className="inline-block">{"\u00A0"}</span>}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);

  // pointer parallax + layout flags
  useEffect(() => {
    heroState.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setWide = () => (heroState.wide = window.innerWidth >= 1024);
    setWide();
    const onMove = (e: PointerEvent) => {
      heroState.mx = (e.clientX / window.innerWidth) * 2 - 1;
      heroState.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", setWide);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", setWide);
    };
  }, []);

  // pause the WebGL loop once the hero is off-screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = heroState.reduced;
    const ctx = gsap.context(() => {
      // ── load-in
      if (!reduce) {
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .from("[data-char]", { yPercent: 115, rotateX: -70, opacity: 0, duration: 1.3, stagger: 0.028 }, 0.2)
          .from("[data-hero-fade]", { y: 26, opacity: 0, duration: 1.1, stagger: 0.09 }, 0.75);
      }

      // ── scroll story (pinned via sticky; scrubbed timeline)
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: reduce ? true : 0.7,
          onUpdate: (self) => (heroState.progress = self.progress),
        },
      });
      tl.to("[data-hero-copy]", { opacity: 0, y: -90, filter: "blur(8px)", duration: 0.2 }, 0.1)
        .to("[data-scroll-cue]", { opacity: 0, duration: 0.05 }, 0.02);
      CAPTIONS.forEach((_, i) => {
        const at = 0.33 + i * 0.19;
        tl.fromTo(
          `[data-caption="${i}"]`,
          { opacity: 0, y: 40, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.07 },
          at
        ).to(`[data-caption="${i}"]`, { opacity: 0, y: -40, filter: "blur(10px)", duration: 0.07 }, at + 0.12);
      });
      tl.to("[data-hero-fadeout]", { opacity: 1, duration: 0.12 }, 0.88);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={root}
      aria-labelledby="hero-title"
      className="relative h-[300vh] motion-reduce:h-[180vh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* atmosphere */}
        <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
        <div className="glow-blob left-[55%] top-[20%] h-[50vh] w-[50vh] bg-violet/25" aria-hidden />
        <div className="glow-blob left-[70%] top-[45%] h-[40vh] w-[40vh] bg-cyan/15" aria-hidden />

        {/* 3D world */}
        <div className="absolute inset-0">
          <HeroScene active={visible} />
        </div>

        {/* legibility vignettes */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,16,0.92)_0%,rgba(7,7,16,0.55)_38%,transparent_62%)] max-lg:bg-[linear-gradient(0deg,rgba(7,7,16,0.97)_0%,rgba(7,7,16,0.75)_45%,transparent_75%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" aria-hidden />

        {/* copy */}
        <div
          data-hero-copy
          className="relative z-10 mx-auto flex h-full max-w-[1400px] items-end px-4 pb-[max(4.5rem,9vh)] pt-28 sm:px-8 lg:items-stretch lg:pb-10"
        >
          <div className="max-w-[640px] lg:my-auto">
            <p data-hero-fade className="glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] text-ink/85">
              <Sparkles size={14} className="text-cyan" aria-hidden />
              {SITE.duration} professional program · No-code &amp; Low-code
            </p>

            <h1 id="hero-title" aria-label="Build the future with AI." className="display text-[clamp(2.9rem,min(8.2vw,13vh),7.4rem)] [perspective:600px]">
              <Chars text={LINE1} />
              <Chars text={LINE2} gradient />
            </h1>

            <p data-hero-fade className="mt-6 font-display text-[clamp(1.1rem,1.9vw,1.55rem)] font-semibold leading-snug tracking-tight text-ink">
              Master Agentic AI &amp; Intelligent Automation Without Traditional Coding.
            </p>

            <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                onClick={(e) => (e.preventDefault(), scrollToId("contact"))}
                className="btn btn-primary"
              >
                Apply Now <ArrowRight size={18} aria-hidden />
              </a>
              <a
                href="#curriculum"
                onClick={(e) => (e.preventDefault(), scrollToId("curriculum"))}
                className="btn btn-ghost"
              >
                Explore Curriculum
              </a>
            </div>

            <div data-hero-fade className="mt-10 hidden items-center gap-4 sm:flex [@media(max-height:760px)]:!hidden">
              <span className="kicker !text-muted !tracking-[0.25em]">Hands-on with</span>
              <ul className="flex items-center gap-3.5 text-ink/55">
                {STACK.map((b) => (
                  <li key={b} className="transition-colors hover:text-ink">
                    <BrandLogo brand={b} size={18} mono />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* scroll captions (cinematic interludes) */}
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-6" aria-hidden>
          {CAPTIONS.map((c, i) => (
            <div key={i} data-caption={i} className="absolute text-center opacity-0">
              <p className="kicker mb-4">{c.k}</p>
              <p className="display mx-auto max-w-[14ch] text-[clamp(2.4rem,6.5vw,6rem)] drop-shadow-[0_4px_40px_rgba(7,7,16,0.9)]">
                {c.t}
              </p>
            </div>
          ))}
        </div>

        {/* scroll cue */}
        <div
          data-scroll-cue
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted lg:flex"
          aria-hidden
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.35em]">Scroll to explore</span>
          <ChevronDown size={18} className="float-y" />
        </div>

        {/* hand-off to next section */}
        <div data-hero-fadeout className="pointer-events-none absolute inset-0 z-20 bg-bg opacity-0" aria-hidden />
      </div>
    </section>
  );
}
