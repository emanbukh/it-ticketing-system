import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

function applySecurityHeaders(res: NextResponse) {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com https://cdnjs.cloudflare.com",
    "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
    "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith("/user")) {
    if (!session || session.role !== "USER") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/login/user", request.url)));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "ADMIN") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/login/admin", request.url)));
    }
  }

  if (pathname.startsWith("/login")) {
    if (session?.role === "USER") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/user/dashboard", request.url)));
    }

    if (session?.role === "ADMIN") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin/dashboard", request.url)));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
