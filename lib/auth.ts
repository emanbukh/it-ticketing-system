import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import type { SessionData } from "@/types";

export async function setSessionCookie(session: SessionData) {
  const token = await createSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(role?: Role) {
  const session = await getSession();

  if (!session) {
    redirect(role === "ADMIN" ? "/login/admin" : "/login/user");
  }

  if (role && session.role !== role) {
    redirect(session.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard");
  }

  return session;
}

export async function hashPassword(value: string) {
  return bcrypt.hash(value, 12);
}

export async function comparePassword(value: string, hash?: string | null) {
  if (!hash) return false;
  return bcrypt.compare(value, hash);
}
