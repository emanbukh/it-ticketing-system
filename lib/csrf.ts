import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const CSRF_FORM_FIELD = "csrf_token";

/**
 * Generate a secure CSRF token and store it in cookie
 * Call this in your page component to set the token
 */
export async function generateCSRFToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  return token;
}

/**
 * Get CSRF token from cookie
 * Use this in forms to include as hidden input
 */
export async function getCSRFTokenValue(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE)?.value;
}

/**
 * Validate CSRF token from form data or header
 * Works with both server actions (formData) and API routes (headers)
 */
export async function validateCSRFToken(formData?: FormData, headers?: Headers): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE)?.value;

  if (!storedToken) {
    return false;
  }

  // Try to get token from formData first (server actions)
  let submittedToken: string | null | undefined;
  if (formData) {
    submittedToken = formData.get(CSRF_COOKIE)?.toString();
  }

  // Fall back to header (API routes)
  if (!submittedToken && headers) {
    submittedToken = headers.get(CSRF_HEADER);
  }

  if (!submittedToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  try {
    const storedBuffer = Buffer.from(storedToken, "hex");
    const submittedBuffer = Buffer.from(submittedToken, "hex");

    if (storedBuffer.length !== submittedBuffer.length) {
      return false;
    }

    return timingSafeEqual(storedBuffer, submittedBuffer);
  } catch {
    return false;
  }
}

/**
 * Clear CSRF token cookie
 */
export async function clearCSRFToken() {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
