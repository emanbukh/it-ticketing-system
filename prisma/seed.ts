import bcrypt from "bcryptjs";
import { PrismaClient, Role, TicketCategory, TicketStatus, HistoryAction } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function main() {
  await prisma.ticketHistory.deleteMany();
  await prisma.ticketReply.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const [adminPassword, supportPassword, staffPassword] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("support123", 10),
    bcrypt.hash("welcome123", 10),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: "Aina Rahman",
      username: "itadmin",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const supportLead = await prisma.user.create({
    data: {
      name: "Faizal Support",
      username: "helpdesk",
      passwordHash: supportPassword,
      role: Role.ADMIN,
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Nurul Huda",
        staffId: "STF1001",
        passwordHash: staffPassword,
        role: Role.USER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Jason Lim",
        staffId: "STF1002",
        passwordHash: staffPassword,
        role: Role.USER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Siti Balqis",
        staffId: "STF1003",
        passwordHash: staffPassword,
        role: Role.USER,
      },
    }),
  ]);

  const [nurul, jason, siti] = users;

  const ticketOne = await prisma.ticket.create({
    data: {
      ticketNumber: "IT-2026-0001",
      userId: nurul.id,
      category: TicketCategory.NETWORKING,
      subject: "Office Wi-Fi disconnects every 10 minutes",
      description:
        "The finance department wireless access point keeps disconnecting throughout the morning, especially during Teams calls.",
      status: TicketStatus.PENDING,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
    },
  });

  const ticketTwo = await prisma.ticket.create({
    data: {
      ticketNumber: "IT-2026-0002",
      userId: jason.id,
      category: TicketCategory.EMAIL,
      subject: "Unable to send emails outside organization",
      description:
        "Outbound emails stay in the outbox and eventually fail with a relay restriction message.",
      status: TicketStatus.SOLVED,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(4),
    },
  });

  const ticketThree = await prisma.ticket.create({
    data: {
      ticketNumber: "IT-2026-0003",
      userId: siti.id,
      category: TicketCategory.ASSET,
      subject: "Request for replacement laptop charger",
      description:
        "Current charger is overheating and disconnecting from the device. Requesting a replacement unit.",
      status: TicketStatus.PENDING,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
  });

  const ticketFour = await prisma.ticket.create({
    data: {
      ticketNumber: "IT-2026-0004",
      userId: nurul.id,
      category: TicketCategory.REQUEST,
      subject: "Need access to shared procurement folder",
      description:
        "Please grant read/write access to the procurement shared folder for monthly reporting.",
      status: TicketStatus.SOLVED,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(7),
    },
  });

  await prisma.ticketReply.createMany({
    data: [
      {
        ticketId: ticketOne.id,
        senderId: admin.id,
        senderRole: Role.ADMIN,
        message: "We are checking the access point logs and will update you shortly.",
        createdAt: daysAgo(2),
      },
      {
        ticketId: ticketOne.id,
        senderId: nurul.id,
        senderRole: Role.USER,
        message: "The issue still happens after lunch and affects two colleagues nearby.",
        createdAt: daysAgo(1),
      },
      {
        ticketId: ticketTwo.id,
        senderId: supportLead.id,
        senderRole: Role.ADMIN,
        message: "SMTP policy was updated. Please retry now and confirm.",
        createdAt: daysAgo(5),
      },
      {
        ticketId: ticketTwo.id,
        senderId: jason.id,
        senderRole: Role.USER,
        message: "Confirmed. External emails are sending correctly now.",
        createdAt: daysAgo(4),
      },
      {
        ticketId: ticketFour.id,
        senderId: admin.id,
        senderRole: Role.ADMIN,
        message: "Access has been granted to your account. You may need to sign out and in again.",
        createdAt: daysAgo(7),
      },
    ],
  });

  await prisma.ticketHistory.createMany({
    data: [
      {
        ticketId: ticketOne.id,
        action: HistoryAction.CREATED,
        newStatus: TicketStatus.PENDING,
        changedById: nurul.id,
        changedByLabel: nurul.name,
        details: "Ticket created by staff user.",
        createdAt: daysAgo(3),
      },
      {
        ticketId: ticketOne.id,
        action: HistoryAction.ADMIN_REPLY,
        oldStatus: TicketStatus.PENDING,
        newStatus: TicketStatus.PENDING,
        changedById: admin.id,
        changedByLabel: admin.name,
        details: "Initial diagnostic update posted.",
        createdAt: daysAgo(2),
      },
      {
        ticketId: ticketOne.id,
        action: HistoryAction.USER_REPLY,
        oldStatus: TicketStatus.PENDING,
        newStatus: TicketStatus.PENDING,
        changedById: nurul.id,
        changedByLabel: nurul.name,
        details: "User shared additional impact details.",
        createdAt: daysAgo(1),
      },
      {
        ticketId: ticketTwo.id,
        action: HistoryAction.CREATED,
        newStatus: TicketStatus.PENDING,
        changedById: jason.id,
        changedByLabel: jason.name,
        details: "Ticket created by staff user.",
        createdAt: daysAgo(6),
      },
      {
        ticketId: ticketTwo.id,
        action: HistoryAction.ADMIN_REPLY,
        oldStatus: TicketStatus.PENDING,
        newStatus: TicketStatus.PENDING,
        changedById: supportLead.id,
        changedByLabel: supportLead.name,
        details: "Admin requested retest after policy change.",
        createdAt: daysAgo(5),
      },
      {
        ticketId: ticketTwo.id,
        action: HistoryAction.STATUS_CHANGED,
        oldStatus: TicketStatus.PENDING,
        newStatus: TicketStatus.SOLVED,
        changedById: supportLead.id,
        changedByLabel: supportLead.name,
        details: "Ticket marked solved after user confirmation.",
        createdAt: daysAgo(4),
      },
      {
        ticketId: ticketThree.id,
        action: HistoryAction.CREATED,
        newStatus: TicketStatus.PENDING,
        changedById: siti.id,
        changedByLabel: siti.name,
        details: "Asset request submitted.",
        createdAt: daysAgo(2),
      },
      {
        ticketId: ticketFour.id,
        action: HistoryAction.CREATED,
        newStatus: TicketStatus.PENDING,
        changedById: nurul.id,
        changedByLabel: nurul.name,
        details: "Shared folder access request created.",
        createdAt: daysAgo(10),
      },
      {
        ticketId: ticketFour.id,
        action: HistoryAction.STATUS_CHANGED,
        oldStatus: TicketStatus.PENDING,
        newStatus: TicketStatus.SOLVED,
        changedById: admin.id,
        changedByLabel: admin.name,
        details: "Access granted and ticket resolved.",
        createdAt: daysAgo(7),
      },
    ],
  });

  console.log("Seed completed successfully.");
  console.log("Admin login: itadmin / admin123");
  console.log("Admin login: helpdesk / support123");
  console.log("User login examples: Nurul Huda / STF1001");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
