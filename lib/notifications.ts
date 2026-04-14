import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { htmlLayout, sendMail } from "@/lib/email";

export async function createNotification(opts: {
  userId: string;
  title: string;
  body: string;
  link?: string;
}) {
  await prisma.notification.create({
    data: { userId: opts.userId, title: opts.title, body: opts.body, link: opts.link },
  });
}

export async function getAdminEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, email: { not: null } },
    select: { email: true },
  });
  return admins.map((a) => a.email).filter((e): e is string => !!e);
}

export async function notifyTicketCreated(ticket: {
  id: string;
  ticketNumber: string;
  subject: string;
  userName: string;
  category: string;
}) {
  const emails = await getAdminEmails();
  if (emails.length === 0) return;
  await sendMail({
    to: emails,
    subject: `[New Ticket] ${ticket.ticketNumber} — ${ticket.subject}`,
    html: htmlLayout(
      "New Ticket Submitted",
      `<p><strong>${ticket.userName}</strong> created ticket <strong>${ticket.ticketNumber}</strong>.</p>
       <p><strong>Category:</strong> ${ticket.category}<br/>
       <strong>Subject:</strong> ${ticket.subject}</p>
       <p>Please review it in the admin portal.</p>`,
    ),
  });
}

export async function notifyTicketClosed(opts: {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  ownerUserId: string;
  closedBy: string;
}) {
  // In-app for ticket owner (user)
  await createNotification({
    userId: opts.ownerUserId,
    title: `Ticket ${opts.ticketNumber} closed`,
    body: `Your ticket "${opts.subject}" was marked solved by ${opts.closedBy}.`,
    link: `/user/tickets/${opts.ticketId}`,
  });

  // Email admins
  const emails = await getAdminEmails();
  if (emails.length > 0) {
    await sendMail({
      to: emails,
      subject: `[Ticket Closed] ${opts.ticketNumber} — ${opts.subject}`,
      html: htmlLayout(
        "Ticket Marked Solved",
        `<p>Ticket <strong>${opts.ticketNumber}</strong> was closed by <strong>${opts.closedBy}</strong>.</p>
         <p><strong>Subject:</strong> ${opts.subject}</p>`,
      ),
    });
  }
}

export async function getUserNotifications(userId: string, limit = 10) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
