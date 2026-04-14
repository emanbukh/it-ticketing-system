"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, comparePassword, requireSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyHcaptcha } from "@/lib/hcaptcha";
import { rateLimit } from "@/lib/rate-limit";
import { adminLoginSchema, userLoginSchema, zodErrors } from "@/lib/validations";
import type { ActionState } from "@/types";

export async function loginUserAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const rl = await rateLimit("login-user", { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return { success: false, message: `Too many attempts. Try again in ${rl.retryAfterSec}s.` };
  }

  const values = {
    name: String(formData.get("name") || ""),
    staffId: String(formData.get("staffId") || ""),
  };

  const parsed = userLoginSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      errors: zodErrors(parsed.error),
      message: "Please complete both fields.",
    };
  }

  const captchaOk = await verifyHcaptcha(String(formData.get("h-captcha-response") || ""));
  if (!captchaOk) {
    return { success: false, message: "Captcha verification failed. Please try again." };
  }

  const user = await prisma.user.findUnique({
    where: { staffId: parsed.data.staffId },
  });

  if (!user || user.role !== Role.USER || user.name.toLowerCase() !== parsed.data.name.toLowerCase()) {
    return {
      success: false,
      message: "Invalid credentials.",
    };
  }

  await setSessionCookie({
    userId: user.id,
    name: user.name,
    role: user.role,
    staffId: user.staffId,
  });

  revalidatePath("/");
  redirect("/user/dashboard");
}

export async function loginAdminAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const rl = await rateLimit("login-admin", { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return { success: false, message: `Too many attempts. Try again in ${rl.retryAfterSec}s.` };
  }

  const values = {
    username: String(formData.get("username") || ""),
    password: String(formData.get("password") || ""),
  };

  const parsed = adminLoginSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      errors: zodErrors(parsed.error),
      message: "Username and password are required.",
    };
  }

  const captchaOk = await verifyHcaptcha(String(formData.get("h-captcha-response") || ""));
  if (!captchaOk) {
    return { success: false, message: "Captcha verification failed. Please try again." };
  }

  const admin = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });

  if (!admin || admin.role !== Role.ADMIN) {
    await comparePassword(parsed.data.password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    return {
      success: false,
      message: "Invalid credentials.",
    };
  }

  const passwordMatches = await comparePassword(parsed.data.password, admin.passwordHash);
  if (!passwordMatches) {
    return {
      success: false,
      message: "Invalid credentials.",
    };
  }

  await setSessionCookie({
    userId: admin.id,
    name: admin.name,
    role: admin.role,
    username: admin.username,
  });

  revalidatePath("/");
  redirect("/admin/dashboard");
}

export async function logoutAction() {
  const session = await requireSession();
  await clearSessionCookie();
  redirect(session.role === "ADMIN" ? "/login/admin" : "/login/user");
}
