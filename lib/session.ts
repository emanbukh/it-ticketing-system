import { jwtVerify, SignJWT } from "jose";
import type { SessionData } from "@/types";

export const SESSION_COOKIE = "it-ticket-session";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET || "development-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: SessionData) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}
