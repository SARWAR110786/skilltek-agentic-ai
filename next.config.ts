import type { NextConfig } from "next";

/**
 * Default: a normal Next.js server build (needed for the Saru assistant's
 * secure API proxy in src/app/api/saru). Deploy to Vercel or any Node host.
 *
 * STATIC_EXPORT=1 produces a static ./out folder without the assistant backend
 * (used for quick previews). RELATIVE_ASSETS=1 emits relative asset URLs.
 */
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStatic ? { output: "export" as const, images: { unoptimized: true }, trailingSlash: true } : {}),
  ...(process.env.RELATIVE_ASSETS === "1" ? { assetPrefix: "./" } : {}),
};

export default nextConfig;
