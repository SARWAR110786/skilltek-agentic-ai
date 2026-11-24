import type { Metadata, Viewport } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import { SITE } from "@/lib/content";
import SaruWidget from "@/components/saru/SaruWidget";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"], display: "swap" });

const title = "Agentic AI & Automation Course in Thatta | The Skilltek Institute & Media Solutions";
const description =
  "A 2-month, hands-on program in no-code & low-code Agentic AI. Build AI agents, WhatsApp automation, RAG assistants, MCP integrations and multi-agent systems with n8n, OpenAI, Gemini and Claude.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description,
  keywords: [
    "agentic AI course", "AI automation course", "n8n course", "no-code AI", "low-code automation",
    "AI agents", "WhatsApp automation", "RAG", "MCP", "multi-agent systems", "Skilltek",
  ],
  openGraph: {
    title: "Build the Future with AI — Skilltek Agentic AI & Automation",
    description,
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    locale: "en_PK",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Agentic AI & Automation — 2-month hands-on course at Skilltek, Thatta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build the Future with AI — Skilltek",
    description,
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#070710",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: SITE.program,
  description,
  timeRequired: "P2M",
  educationalLevel: "Beginner to Intermediate",
  url: SITE.url,
  provider: {
    "@type": "EducationalOrganization",
    name: SITE.name,
    url: "https://theskilltek.com",
    sameAs: ["https://www.facebook.com/TheSkillTek", "https://www.instagram.com/theskilltek/"],
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Blended",
    courseWorkload: "P2M",
    location: {
      "@type": "Place",
      name: SITE.name,
      address: { "@type": "PostalAddress", streetAddress: SITE.address, addressLocality: "Thatta", addressCountry: "PK" },
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${mono.variable}`}>
      <body className="antialiased">
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        <SaruWidget />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
