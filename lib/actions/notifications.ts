"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { markAllRead } from "@/lib/notifications";

export async function markAllNotificationsReadAction() {
  const session = await requireSession();
  await markAllRead(session.userId);
  revalidatePath("/user", "layout");
}
