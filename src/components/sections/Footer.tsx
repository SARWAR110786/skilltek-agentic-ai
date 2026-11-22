import { NAV, SITE } from "@/lib/content";
import BrandLogo from "@/components/ui/BrandLogo";
import type { BrandKey } from "@/lib/brands";

const STACK: BrandKey[] = ["n8n", "openai", "gemini", "claude", "whatsapp", "supabase", "telegram", "make", "zapier", "airtable", "sheets", "gmail"];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] px-4 pb-10 pt-20 sm:px-8">
      {/* tool marquee */}
      <div className="relative mx-auto mb-20 max-w-[1400px] overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]" aria-hidden>
        <div className="marquee flex w-max gap-14 text-ink/40">
          {[...STACK, ...STACK].map((b, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap font-display text-lg font-semibold">
              <BrandLogo brand={b} size={22} mono title={false} />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, relative path */}
          <img src="brand/skilltek-logo-480.webp" alt="Skilltek Institute & Media Solutions" width={480} height={98} className="h-9 w-auto" />
          <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-muted">
            {SITE.name}. Practical, career-focused training in AI, automation and digital media.
          </p>
        </div>
        <nav aria-label="Footer">
          <h3 className="kicker mb-5 !text-muted">Explore</h3>
          <ul className="space-y-3 text-[14.5px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id === "home" ? "" : n.id}`} className="text-ink/75 transition-colors hover:text-ink">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h3 className="kicker mb-5 !text-muted">Program</h3>
          <ul className="space-y-3 text-[14.5px] text-ink/75">
            <li>{SITE.program}</li>
            <li>Duration: {SITE.duration}</li>
            <li>14 modules · 6 portfolio projects</li>
            <li>
              <a href={SITE.applyUrl} className="text-cyan hover:underline">Apply now →</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-[1400px] flex-col gap-3 border-t border-white/[0.07] pt-8 text-[12.5px] text-muted md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p>Product names and logos are trademarks of their respective owners and are used to identify the tools taught.</p>
      </div>
    </footer>
  );
}
