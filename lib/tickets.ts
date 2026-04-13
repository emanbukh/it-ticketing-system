import { HistoryAction, Prisma, Role, TicketCategory, TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { percentage } from "@/lib/utils";

export async function generateTicketNumber(tx: Prisma.TransactionClient) {
  const year = new Date().getFullYear();
  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);
  const count = await tx.ticket.count({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return `IT-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function getUserDashboard(userId: string) {
  const [total, pending, solved, recentTickets] = await Promise.all([
    prisma.ticket.count({ where: { userId } }),
    prisma.ticket.count({ where: { userId, status: TicketStatus.PENDING } }),
    prisma.ticket.count({ where: { userId, status: TicketStatus.SOLVED } }),
    prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        replies: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  return { total, pending, solved, recentTickets };
}

export async function getUserTickets(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: true,
        },
      },
    },
  });
}

export async function getUserTicketDetail(userId: string, ticketId: string) {
  return prisma.ticket.findFirst({
    where: { id: ticketId, userId },
    include: {
      user: true,
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: true,
        },
      },
      history: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAdminDashboard() {
  const [total, pending, solved, responded, recentTickets, categories] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: TicketStatus.PENDING } }),
    prisma.ticket.count({ where: { status: TicketStatus.SOLVED } }),
    prisma.ticket.count({
      where: {
        replies: {
          some: {
            senderRole: Role.ADMIN,
          },
        },
      },
    }),
    prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: true,
      },
    }),
    prisma.ticket.groupBy({
      by: ["category"],
      _count: {
        _all: true,
      },
    }),
  ]);

  return {
    total,
    pending,
    solved,
    responded,
    recentTickets,
    categoryBreakdown: categories.map((entry) => ({
      category: entry.category,
      total: entry._count._all,
      percentage: percentage(entry._count._all, total),
    })),
    responseRate: percentage(responded, total),
    solveRate: percentage(solved, total),
    pendingRate: percentage(pending, total),
  };
}

export type AdminTicketFilters = {
  query?: string;
  category?: TicketCategory | "ALL";
  status?: TicketStatus | "ALL";
  sort?: "latest" | "oldest";
  date?: "ALL" | "TODAY" | "7D" | "30D";
};

export async function getAdminTickets(filters: AdminTicketFilters) {
  const query = filters.query?.trim();
  const now = new Date();
  const dateMap = {
    TODAY: 1,
    "7D": 7,
    "30D": 30,
  } as const;

  const days = filters.date && filters.date !== "ALL" ? dateMap[filters.date] : undefined;
  const startDate = days
    ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    : undefined;

  return prisma.ticket.findMany({
    where: {
      ...(filters.category && filters.category !== "ALL" ? { category: filters.category } : {}),
      ...(filters.status && filters.status !== "ALL" ? { status: filters.status } : {}),
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
      ...(query
        ? {
            OR: [
              { ticketNumber: { contains: query } },
              { subject: { contains: query } },
              { user: { is: { name: { contains: query } } } },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: filters.sort === "oldest" ? "asc" : "desc",
    },
    include: {
      user: true,
      replies: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: true,
        },
      },
    },
  });
}

export async function getAdminTicketDetail(ticketId: string) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      user: true,
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: true,
        },
      },
      history: {
        orderBy: { createdAt: "desc" },
        include: {
          changedBy: true,
        },
      },
    },
  });
}

export async function getTicketHistory(search?: string, action?: HistoryAction | "ALL") {
  const query = search?.trim();

  return prisma.ticketHistory.findMany({
    where: {
      ...(action && action !== "ALL" ? { action } : {}),
      ...(query
        ? {
            OR: [
              { ticket: { is: { ticketNumber: { contains: query } } } },
              { ticket: { is: { subject: { contains: query } } } },
              { changedByLabel: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      ticket: {
        include: {
          user: true,
        },
      },
      changedBy: true,
    },
  });
}

export async function getUsers() {
  return prisma.user.findMany({
    where: {
      role: Role.USER,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    where: {
      role: Role.ADMIN,
    },
    orderBy: { name: "asc" },
  });
}

export async function addTicketHistory(params: {
  ticketId: string;
  action: HistoryAction;
  oldStatus?: TicketStatus;
  newStatus?: TicketStatus;
  changedById?: string;
  changedByLabel: string;
  details?: string;
}) {
  return prisma.ticketHistory.create({
    data: params,
  });
}
