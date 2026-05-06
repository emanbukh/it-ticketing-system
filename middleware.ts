import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const CSRF_COOKIE = "csrf_token";

/**
 * Generate cryptographically secure random token for Edge runtime
 * Uses Web Crypto API instead of Node.js crypto module
 */
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function setCSRFToken(res: NextResponse) {
  // Only set if not already present
  if (!res.cookies.get(CSRF_COOKIE)) {
    const token = generateSecureToken();
    res.cookies.set(CSRF_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
  }
  return res;
}

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

  let response: NextResponse;

  if (pathname.startsWith("/user")) {
    if (!session || session.role !== "USER") {
      response = NextResponse.redirect(new URL("/login/user", request.url));
      return applySecurityHeaders(setCSRFToken(response));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "ADMIN") {
      response = NextResponse.redirect(new URL("/login/admin", request.url));
      return applySecurityHeaders(setCSRFToken(response));
    }
  }

  if (pathname.startsWith("/login")) {
    if (session?.role === "USER") {
      response = NextResponse.redirect(new URL("/user/dashboard", request.url));
      return applySecurityHeaders(setCSRFToken(response));
    }

    if (session?.role === "ADMIN") {
      response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
      return applySecurityHeaders(setCSRFToken(response));
    }
  }

  response = NextResponse.next();
  return applySecurityHeaders(setCSRFToken(response));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
