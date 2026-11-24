import { NextResponse, type NextRequest } from "next/server";
import { isBlockedAgent } from "@/lib/blocked-bots";

// AI crawlers and scraping tools may not copy the site. robots.txt stays
// readable so well-behaved bots can see they are not allowed.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/robots.txt" && isBlockedAgent(req.headers.get("user-agent"))) {
    return new NextResponse("Automated access to this website is not permitted.", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
