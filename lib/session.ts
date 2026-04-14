import { jwtVerify, SignJWT } from "jose";
import type { SessionData } from "@/types";

export const SESSION_COOKIE = "it-ticket-session";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET env var is required and must be at least 32 characters.");
  }
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
