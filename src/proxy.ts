import { NextResponse, type NextRequest } from "next/server";
import { createRateLimiter, clientIpFromHeaders } from "@/lib/rate-limit";

const MAX_REQUESTS_PER_MINUTE = 30;

const limiter = createRateLimiter(MAX_REQUESTS_PER_MINUTE);

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!limiter.check(clientIpFromHeaders(request.headers))) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
