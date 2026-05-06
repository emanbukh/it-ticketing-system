"use server";

import { generateCSRFToken, getCSRFTokenValue } from "@/lib/csrf";

/**
 * Server action to ensure CSRF token exists
 * Call this on page load to generate token if needed
 */
export async function ensureCSRFToken(): Promise<void> {
  await generateCSRFToken();
}

/**
 * Hidden input field containing CSRF token
 * Include this in all forms that submit to server actions
 * 
 * Usage:
 * ```tsx
 * <form action={myAction}>
 *   <CSRFTokenInput />
 *   {/* other fields *\/}
 * </form>
 * ```
 */
export async function CSRFTokenInput() {
  let token = await getCSRFTokenValue();
  
  if (!token) {
    // Generate token if not exists
    await generateCSRFToken();
    token = await getCSRFTokenValue();
  }
  
  if (!token) {
    return null;
  }
  
  return <input type="hidden" name="csrf_token" value={token} />;
}
