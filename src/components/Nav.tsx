"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV } from "@/lib/content";
import { scrollToId, scrollState } from "@/lib/scroll";

type Id = (typeof NAV)[number]["id"];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<Id>("home");
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // glass background once the page has moved
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // active-section indicator: whichever section crosses the upper-middle of the viewport
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id as Id));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // mobile drawer: lock scroll, Escape to close, manage focus
  useEffect(() => {
    if (!open) return;
    scrollState.lenis?.stop();
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const trigger = menuBtn.current;
    return () => {
      scrollState.lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // let the drawer release the scroll lock before scrolling
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[#070710]/70 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-8"
        >
          <a href="#" onClick={go("home")} className="flex shrink-0 items-center" aria-label="Skilltek home">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, relative path */}
            <img
              src="brand/skilltek-logo-480.webp"
              alt="Skilltek Institute & Media Solutions"
              width={480}
              height={98}
              fetchPriority="high"
              className="h-7 w-auto sm:h-8"
            />
          </a>

          <ul className="hidden items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] p-1 backdrop-blur-md lg:flex">
            {NAV.map((n) => {
              const isActive = active === n.id;
              return (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={go(n.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative block rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors duration-300 ${
                      isActive ? "text-white" : "text-muted hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet/35 to-blue/30 ring-1 ring-white/10"
                      />
                    )}
                    {n.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a href="#contact" onClick={go("contact")} className="btn btn-primary btn-sm hidden sm:inline-flex">
              Apply Now <ArrowUpRight size={16} aria-hidden />
            </a>
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-drawer"
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`glass-strong absolute inset-y-0 right-0 flex w-[min(86vw,380px)] flex-col p-6 transition-transform duration-500 ease-out-expo ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="kicker">Menu</span>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10"
              aria-label="Close menu"
              tabIndex={open ? 0 : -1}
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          <ul className="mt-10 space-y-1">
            {NAV.map((n, i) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={go(n.id)}
                  tabIndex={open ? 0 : -1}
                  className={`flex items-baseline gap-4 rounded-2xl px-3 py-3 font-display text-2xl font-semibold tracking-tight transition-colors ${
                    active === n.id ? "text-white" : "text-muted"
                  }`}
                >
                  <span className="font-mono text-xs text-cyan">0{i + 1}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            onClick={go("contact")}
            tabIndex={open ? 0 : -1}
            className="btn btn-primary mt-auto w-full"
          >
            Apply Now <ArrowUpRight size={18} aria-hidden />
          </a>
        </div>
      </div>
    </>
  );
}
