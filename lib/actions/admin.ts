"use server";

import { HistoryAction, Role, TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { comparePassword, hashPassword, requireSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyTicketClosed } from "@/lib/notifications";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  adminSettingsSchema,
  replySchema,
  statusUpdateSchema,
  userUpsertSchema,
  zodErrors,
} from "@/lib/validations";
import type { ActionState } from "@/types";

export async function replyAsAdminAction(
  ticketId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession("ADMIN");
  const parsed = replySchema.safeParse({
    message: String(formData.get("message") || ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: zodErrors(parsed.error),
      message: "Please enter a reply message.",
    };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return {
      success: false,
      message: "Ticket not found.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticketReply.create({
      data: {
        ticketId,
        senderId: session.userId,
        senderRole: Role.ADMIN,
        message: sanitizeHtml(parsed.data.message),
      },
    });

    await tx.ticketHistory.create({
      data: {
        ticketId,
        action: HistoryAction.ADMIN_REPLY,
        oldStatus: ticket.status,
        newStatus: ticket.status,
        changedById: session.userId,
        changedByLabel: session.name,
        details: "Admin replied from the service desk panel.",
      },
    });
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/history");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/user/tickets/${ticketId}`);
  revalidatePath("/user/tickets");

  return {
    success: true,
    message: "Reply posted successfully.",
  };
}

export async function updateTicketStatusAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession("ADMIN");
  const values = {
    ticketId: String(formData.get("ticketId") || ""),
    status: String(formData.get("status") || ""),
  };

  const parsed = statusUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      errors: zodErrors(parsed.error),
      message: "Please choose a valid ticket status.",
    };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: parsed.data.ticketId },
  });

  if (!ticket) {
    return {
      success: false,
      message: "Ticket not found.",
    };
  }

  if (ticket.status === parsed.data.status) {
    return {
      success: true,
      message: "Status is already up to date.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticket.id },
      data: {
        status: parsed.data.status,
      },
    });

    await tx.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: HistoryAction.STATUS_CHANGED,
        oldStatus: ticket.status,
        newStatus: parsed.data.status,
        changedById: session.userId,
        changedByLabel: session.name,
        details: `Ticket status updated from ${ticket.status} to ${parsed.data.status}.`,
      },
    });
  });

  if (parsed.data.status === TicketStatus.SOLVED && ticket.status !== TicketStatus.SOLVED) {
    await notifyTicketClosed({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      ownerUserId: ticket.userId,
      closedBy: session.name,
    });
  }

  revalidatePath(`/admin/tickets/${ticket.id}`);
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/history");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/user/tickets/${ticket.id}`);
  revalidatePath("/user/tickets");
  revalidatePath("/user/dashboard");

  return {
    success: true,
    message: "Ticket status updated.",
  };
}

export async function upsertUserAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession("ADMIN");
  const values = {
    id: String(formData.get("id") || "") || undefined,
    name: String(formData.get("name") || ""),
    staffId: String(formData.get("staffId") || ""),
    email: String(formData.get("email") || "") || undefined,
    password: String(formData.get("password") || "") || undefined,
  };

  const parsed = userUpsertSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      errors: zodErrors(parsed.error),
      message: "Please review the user details.",
    };
  }

  const duplicate = await prisma.user.findFirst({
    where: {
      staffId: parsed.data.staffId,
      ...(parsed.data.id ? { id: { not: parsed.data.id } } : {}),
    },
  });

  if (duplicate) {
    return {
      success: false,
      message: "That staff ID is already in use.",
    };
  }

  const passwordHash = parsed.data.password ? await hashPassword(parsed.data.password) : undefined;

  if (parsed.data.id) {
    await prisma.user.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        staffId: parsed.data.staffId,
        email: parsed.data.email ?? null,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });
  } else {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        staffId: parsed.data.staffId,
        email: parsed.data.email ?? null,
        passwordHash,
        role: Role.USER,
      },
    });
  }

  revalidatePath("/admin/users");

  return {
    success: true,
    message: parsed.data.id ? "User updated successfully." : "User added successfully.",
  };
}

export async function updateAdminSettingsAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession("ADMIN");
  const values = {
    id: String(formData.get("id") || ""),
    name: String(formData.get("name") || ""),
    username: String(formData.get("username") || ""),
    email: String(formData.get("email") || "") || undefined,
    currentPassword: String(formData.get("currentPassword") || ""),
    newPassword: String(formData.get("newPassword") || ""),
  };

  const parsed = adminSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      errors: zodErrors(parsed.error),
      message: "Please review the admin profile details.",
    };
  }

  if (parsed.data.id !== session.userId) {
    return {
      success: false,
      message: "You can only edit your own admin profile.",
    };
  }

  const duplicate = await prisma.user.findFirst({
    where: {
      username: parsed.data.username,
      id: { not: session.userId },
    },
  });

  if (duplicate) {
    return {
      success: false,
      message: "That username is already taken.",
    };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!admin) {
    return {
      success: false,
      message: "Admin account not found.",
    };
  }

  if (parsed.data.newPassword) {
    const validCurrent = await comparePassword(parsed.data.currentPassword || "", admin.passwordHash);
    if (!validCurrent) {
      return {
        success: false,
        message: "Current password is incorrect.",
      };
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      email: parsed.data.email ?? null,
      ...(parsed.data.newPassword ? { passwordHash: await hashPassword(parsed.data.newPassword) } : {}),
    },
  });

  if (parsed.data.newPassword) {
    console.info(
      JSON.stringify({
        event: "admin_password_changed",
        at: new Date().toISOString(),
        adminId: session.userId,
        adminUsername: updated.username,
      }),
    );
  }

  await setSessionCookie({
    userId: updated.id,
    name: updated.name,
    role: updated.role,
    username: updated.username,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    message: "Admin settings updated successfully.",
  };
}
