import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith("/user")) {
    if (!session || session.role !== "USER") {
      return NextResponse.redirect(new URL("/login/user", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login/admin", request.url));
    }
  }

  if (pathname.startsWith("/login")) {
    if (session?.role === "USER") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }

    if (session?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/login/:path*"],
};
