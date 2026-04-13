"use server";

import { HistoryAction, Role, TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTicketNumber } from "@/lib/tickets";
import {
  replySchema,
  ticketSchema,
  userProfileSchema,
  zodErrors,
} from "@/lib/validations";
import type { ActionState } from "@/types";

export async function createTicketAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession("USER");
  const values = {
    category: String(formData.get("category") || ""),
    subject: String(formData.get("subject") || ""),
    description: String(formData.get("description") || ""),
  };

  const parsed = ticketSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      errors: zodErrors(parsed.error),
      message: "Please complete all ticket details.",
    };
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const ticketNumber = await generateTicketNumber(tx);

    const createdTicket = await tx.ticket.create({
      data: {
        ticketNumber,
        userId: session.userId,
        category: parsed.data.category,
        subject: parsed.data.subject,
        description: parsed.data.description,
        status: TicketStatus.PENDING,
      },
    });

    await tx.ticketHistory.create({
      data: {
        ticketId: createdTicket.id,
        action: HistoryAction.CREATED,
        newStatus: TicketStatus.PENDING,
        changedById: session.userId,
        changedByLabel: session.name,
        details: "Ticket submitted from the staff portal.",
      },
    });

    return createdTicket;
  });

  revalidatePath("/user/dashboard");
  revalidatePath("/user/tickets");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/tickets");
  redirect(`/user/tickets/${ticket.id}?created=1`);
}

export async function replyToTicketAction(
  ticketId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession("USER");
  const parsed = replySchema.safeParse({
    message: String(formData.get("message") || ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: zodErrors(parsed.error),
      message: "Please add a reply before sending.",
    };
  }

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, userId: session.userId },
  });

  if (!ticket) {
    return {
      success: false,
      message: "Ticket not found.",
    };
  }

  if (ticket.status === TicketStatus.SOLVED) {
    return {
      success: false,
      message: "Solved tickets are closed for follow-up replies.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticketReply.create({
      data: {
        ticketId,
        senderId: session.userId,
        senderRole: Role.USER,
        message: parsed.data.message,
      },
    });

    await tx.ticketHistory.create({
      data: {
        ticketId,
        action: HistoryAction.USER_REPLY,
        oldStatus: ticket.status,
        newStatus: ticket.status,
        changedById: session.userId,
        changedByLabel: session.name,
        details: "Staff user posted a follow-up reply.",
      },
    });
  });

  revalidatePath(`/user/tickets/${ticketId}`);
  revalidatePath("/user/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/history");

  return {
    success: true,
    message: "Reply sent successfully.",
  };
}

export async function updateUserProfileAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession("USER");
  const values = {
    id: String(formData.get("id") || ""),
    name: String(formData.get("name") || ""),
    staffId: String(formData.get("staffId") || ""),
  };

  const parsed = userProfileSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      errors: zodErrors(parsed.error),
      message: "Please review your profile details.",
    };
  }

  if (parsed.data.id !== session.userId) {
    return {
      success: false,
      message: "You can only update your own profile.",
    };
  }

  const duplicate = await prisma.user.findFirst({
    where: {
      staffId: parsed.data.staffId,
      id: { not: session.userId },
    },
  });

  if (duplicate) {
    return {
      success: false,
      message: "That staff ID is already assigned to another user.",
    };
  }

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: parsed.data.name,
      staffId: parsed.data.staffId,
    },
  });

  await setSessionCookie({
    userId: updated.id,
    name: updated.name,
    role: updated.role,
    staffId: updated.staffId,
  });

  revalidatePath("/user/profile");
  revalidatePath("/user/dashboard");

  return {
    success: true,
    message: "Profile updated successfully.",
  };
}
