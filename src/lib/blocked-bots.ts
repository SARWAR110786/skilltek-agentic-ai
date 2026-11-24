/**
 * AI crawlers and scraping tools that may not read or copy theskilltek.com.
 *
 * Search engines (Googlebot, Bingbot) and link-preview bots (WhatsApp,
 * facebookexternalhit, LinkedInBot, Twitterbot) are deliberately NOT listed,
 * so Google ranking and share previews keep working.
 */
export const AI_BOTS = [
  // AI model training / AI answer engines
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "claude-web",
  "anthropic-ai",
  "Google-Extended",
  "GoogleOther",
  "Google-CloudVertexBot",
  "Applebot-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "FacebookBot",
  "Bytespider",
  "Amazonbot",
  "Diffbot",
  "YouBot",
  "DuckAssistBot",
  "MistralAI-User",
  "AI2Bot",
  "Ai2Bot-Dolma",
  "Timpibot",
  "ImagesiftBot",
  "omgili",
  "omgilibot",
  "PetalBot",
  "Kangaroo Bot",
  "Scrapy",
];

/** Generic scraping / site-copying tools (blocked on the server only). */
const SCRAPER_TOOLS = [
  "HTTrack",
  "Wget",
  "curl/",
  "python-requests",
  "python-urllib",
  "aiohttp",
  "httpx",
  "Go-http-client",
  "node-fetch",
  "axios/",
  "okhttp",
  "Java/",
  "libwww-perl",
  "SiteSucker",
  "WebCopier",
  "WebZIP",
  "Offline Explorer",
  "Teleport",
  "HeadlessChrome",
  "PhantomJS",
  "Puppeteer",
  "Playwright",
  "Selenium",
];

const PATTERN = new RegExp(
  [...AI_BOTS, ...SCRAPER_TOOLS]
    .map((s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"))
    .join("|"),
  "i",
);

export function isBlockedAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return PATTERN.test(userAgent);
}
