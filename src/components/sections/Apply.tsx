import { ArrowUpRight, FileText, Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/content";

const STEPS = [
  ["Submit the admission enquiry", "Fill in the short form on the SkillTek admissions page."],
  ["Talk to admissions", "Our team calls you to discuss the course and details."],
  ["Complete enrollment", "Visit the institute with your documents."],
  ["Start learning", "Get your student portal login and begin."],
];

const DOCS = ["CNIC / B-Form copy", "Recent photographs", "Last qualification certificate"];

/**
 * "Apply" section: no form here. Applications are handled on the official
 * SkillTek admissions page (SITE.applyUrl).
 */
export default function Apply() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden px-4 py-28 sm:px-8 md:py-40">
      <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
      <div className="glow-blob left-[10%] top-[20%] h-[50vh] w-[50vh] bg-violet/20" aria-hidden />
      <div className="glow-blob bottom-[10%] right-[5%] h-[40vh] w-[40vh] bg-cyan/10" aria-hidden />

      <div className="relative mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <p className="kicker mb-5">Admissions open · {SITE.duration}</p>
          <h2 id="contact-title" className="display text-[clamp(2.6rem,6.5vw,6rem)]">
            YOUR FIRST AGENT <span className="text-gradient">IS WAITING.</span>
          </h2>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
            Applications are handled on the official SkillTek Institute admissions page. It takes about two minutes.
          </p>
          <a href={SITE.applyUrl} className="btn btn-primary mt-9">
            Apply on SkillTek Admissions <ArrowUpRight size={18} aria-hidden />
          </a>

          <ul className="mt-12 space-y-3 text-[15px]">
            <li className="flex items-start gap-3 text-ink/85">
              <MapPin size={18} className="mt-0.5 shrink-0 text-cyan" aria-hidden /> {SITE.address}
            </li>
            <li>
              <a href={`tel:${SITE.phoneIntl}`} className="flex items-center gap-3 text-ink/85 hover:text-white">
                <Phone size={18} className="shrink-0 text-cyan" aria-hidden /> {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 text-ink/85 hover:text-white">
                <Mail size={18} className="shrink-0 text-cyan" aria-hidden /> {SITE.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="glass-strong relative rounded-[32px] p-6 shadow-[0_40px_120px_-40px_rgba(139,92,246,0.5)] sm:p-9">
          <h3 className="font-display text-xl font-semibold tracking-tight">How admission works</h3>
          <ol className="mt-6 space-y-5 border-l border-white/10 pl-6">
            {STEPS.map(([t, d], i) => (
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

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 font-display text-[15px] font-semibold">
              <FileText size={17} className="text-cyan" aria-hidden /> Documents you&apos;ll need
            </p>
            <ul className="mt-3 space-y-1.5 text-[14.5px] text-ink/85">
              {DOCS.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </div>

          <a href={SITE.applyUrl} className="btn btn-primary mt-8 w-full">
            Apply Now <ArrowUpRight size={18} aria-hidden />
          </a>
          <p className="mt-3 text-center text-[12.5px] text-muted">Opens the official SkillTek admissions page.</p>
        </div>
      </div>
    </section>
  );
}
