"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, Phone } from "lucide-react";
import { SITE } from "@/lib/content";
import BrandLogo from "@/components/ui/BrandLogo";
import { useReveal } from "@/components/ui/Reveal";

type Status = "idle" | "sending" | "done" | "error";

const BACKGROUNDS = ["Student / graduate", "Business owner", "Freelancer", "Working professional", "Other"];
const LEVELS = ["Complete beginner", "Used ChatGPT / AI tools", "Built automations before"];

const field =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[15px] text-ink placeholder:text-muted/70 outline-none transition-[border-color,box-shadow,background-color] duration-300 focus:border-violet/70 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)]";

export default function Apply() {
  const ref = useReveal<HTMLElement>();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data.company) return; // honeypot
    delete data.company;
    const payload = { ...data, program: SITE.program, submittedAt: new Date().toISOString(), source: "website" };

    setStatus("sending");
    setError("");
    try {
      if (SITE.applyWebhook.includes("script.google.com")) {
        // Google Sheets via Apps Script: a "simple" request avoids the CORS preflight
        // Apps Script can't answer; the response is opaque, so a network success = sent.
        await fetch(SITE.applyWebhook, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
        setStatus("done");
        form.reset();
      } else if (SITE.applyWebhook) {
        // form-encoded = a "simple" CORS request (no preflight), which n8n webhooks accept directly
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 20000);
        const res = await fetch(SITE.applyWebhook, {
          method: "POST",
          body: new URLSearchParams(payload as Record<string, string>),
          signal: ctrl.signal,
        }).finally(() => clearTimeout(timer));
        if (!res.ok) {
          const info = await res.json().catch(() => null);
          throw new Error(info?.error ?? `Could not send your application (error ${res.status}). Please try again.`);
        }
        setStatus("done");
        form.reset();
      } else if (SITE.email) {
        const body = Object.entries(payload).map(([k, v]) => `${k}: ${v}`).join("\n");
        window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
          `Application: ${SITE.program} — ${data.name}`
        )}&body=${encodeURIComponent(body)}`;
        setStatus("done");
      } else {
        throw new Error("Online applications are being set up. Please reach us through our social channels.");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const wa = SITE.whatsapp
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi Skilltek, I'm interested in the ${SITE.program} course.`)}`
    : "";

  return (
    <section id="contact" ref={ref} aria-labelledby="contact-title" className="relative overflow-hidden px-4 py-28 sm:px-8 md:py-40">
      <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
      <div className="glow-blob left-[10%] top-[20%] h-[50vh] w-[50vh] bg-violet/20" aria-hidden />
      <div className="glow-blob right-[5%] bottom-[10%] h-[40vh] w-[40vh] bg-cyan/10" aria-hidden />

      <div className="relative mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <p data-reveal className="kicker mb-5">Apply now · {SITE.duration}</p>
          <h2 id="contact-title" data-reveal className="display text-[clamp(2.6rem,6.5vw,6rem)]">
            YOUR FIRST AGENT <span className="text-gradient">IS WAITING.</span>
          </h2>
          <p data-reveal className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
            Tell us a little about yourself. Our admissions team will reach out with batch dates, schedule and fees.
          </p>

          <ol data-reveal className="mt-10 space-y-5 border-l border-white/10 pl-6">
            {[
              ["Apply online", "Takes about two minutes."],
              ["Talk to admissions", "We confirm your goals, batch timing and fees."],
              ["Start building", "Your first working automation lands in week one."],
            ].map(([t, d], i) => (
              <li key={t} className="relative">
                <span className="absolute -left-[31px] top-1 grid h-[14px] w-[14px] place-items-center rounded-full border border-cyan/60 bg-bg">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">Step {i + 1}</p>
                <p className="mt-1 font-display text-lg font-semibold tracking-tight">{t}</p>
                <p className="text-[14.5px] text-muted">{d}</p>
              </li>
            ))}
          </ol>

          <ul data-reveal className="mt-10 space-y-3">
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="glass group flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-[#25D366]/50">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#25D366]/15">
                    <BrandLogo brand="whatsapp" size={22} title={false} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display font-semibold">Chat on WhatsApp</span>
                    <span className="block text-[13.5px] text-muted">Fastest way to reach admissions</span>
                  </span>
                  <ArrowRight size={18} className="text-muted transition-transform group-hover:translate-x-1" aria-hidden />
                </a>
              </li>
            )}
            {SITE.email && (
              <li>
                <a href={`mailto:${SITE.email}`} className="glass flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-violet/50">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet/15 text-violet"><Mail size={20} aria-hidden /></span>
                  <span className="text-[15px]">{SITE.email}</span>
                </a>
              </li>
            )}
            {SITE.phone && (
              <li>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="glass flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-blue/50">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue/15 text-blue"><Phone size={20} aria-hidden /></span>
                  <span className="text-[15px]">{SITE.phone}</span>
                </a>
              </li>
            )}
          </ul>
        </div>

        <div data-reveal className="glass-strong relative rounded-[32px] p-6 shadow-[0_40px_120px_-40px_rgba(139,92,246,0.5)] sm:p-9">
          {status === "done" ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center text-center" role="status">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet to-cyan">
                <CheckCircle2 size={30} aria-hidden />
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">Application received.</h3>
              <p className="mt-2 max-w-sm text-muted">Thank you. Our admissions team will contact you shortly.</p>
              <button type="button" onClick={() => setStatus("idle")} className="btn btn-ghost btn-sm mt-8">
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate={false} className="space-y-4" aria-describedby={error ? "form-error" : undefined}>
              <h3 className="font-display text-xl font-semibold tracking-tight">Application form</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[13px] text-muted">Full name *</span>
                  <input name="name" required autoComplete="name" className={field} placeholder="Your name" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[13px] text-muted">Phone / WhatsApp *</span>
                  <input name="phone" required type="tel" autoComplete="tel" inputMode="tel" pattern="[+0-9 ()\-]{7,}" className={field} placeholder="+92 300 0000000" />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-[13px] text-muted">Email *</span>
                <input name="email" required type="email" autoComplete="email" className={field} placeholder="you@example.com" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[13px] text-muted">You are a…</span>
                  <select name="background" className={`${field} appearance-none`} defaultValue={BACKGROUNDS[0]}>
                    {BACKGROUNDS.map((b) => (
                      <option key={b} className="bg-surface">{b}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[13px] text-muted">AI experience</span>
                  <select name="experience" className={`${field} appearance-none`} defaultValue={LEVELS[0]}>
                    {LEVELS.map((b) => (
                      <option key={b} className="bg-surface">{b}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-[13px] text-muted">What would you like to automate?</span>
                <textarea name="message" rows={4} className={`${field} resize-none`} placeholder="e.g. WhatsApp support for my store, lead follow-ups, a PDF assistant…" />
              </label>
              {/* honeypot */}
              <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              {status === "error" && (
                <p id="form-error" role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-[14px] text-red-200">
                  {error}
                </p>
              )}

              <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full disabled:opacity-70">
                {status === "sending" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden /> Sending…
                  </>
                ) : (
                  <>
                    Submit application <ArrowRight size={18} aria-hidden />
                  </>
                )}
              </button>
              <p className="text-center text-[12.5px] text-muted">We only use your details to contact you about this program.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
