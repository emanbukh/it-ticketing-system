import Link from "next/link";
import { TicketCategory, TicketStatus } from "@prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminTickets } from "@/lib/tickets";
import {
  categoryLabels,
  categoryTone,
  formatShortDate,
  statusLabels,
  statusTone,
} from "@/lib/utils";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: TicketCategory | "ALL";
    status?: TicketStatus | "ALL";
    date?: "ALL" | "TODAY" | "7D" | "30D";
    sort?: "latest" | "oldest";
  }>;
}) {
  const filters = await searchParams;
  const tickets = await getAdminTickets({
    query: filters.q,
    category: filters.category,
    status: filters.status,
    date: filters.date,
    sort: filters.sort,
  });

  return (
    <>
      <PageHeader
        eyebrow="Ticket Management"
        title="All Tickets"
        description="Search by ticket number, subject, or user name, then filter by status, category, and recent date windows."
      />

      <Card>
        <form className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          <input
            name="q"
            defaultValue={filters.q || ""}
            placeholder="Search ticket ID, subject, or user"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
          <select
            name="category"
            defaultValue={filters.category || "ALL"}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="ALL">All categories</option>
            {Object.values(TicketCategory).map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={filters.status || "ALL"}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="ALL">All statuses</option>
            {Object.values(TicketStatus).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          <select
            name="date"
            defaultValue={filters.date || "ALL"}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="ALL">All dates</option>
            <option value="TODAY">Today</option>
            <option value="7D">Last 7 days</option>
            <option value="30D">Last 30 days</option>
          </select>
          <div className="flex gap-3">
            <select
              name="sort"
              defaultValue={filters.sort || "latest"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
            <button
              type="submit"
              className="rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-soft"
            >
              Apply
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Ticket ID</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium">Created</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Latest Reply</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-slate-100">
                  <td className="py-4 font-semibold text-slate-900">{ticket.ticketNumber}</td>
                  <td className="py-4 text-slate-600">{ticket.user.name}</td>
                  <td className="py-4">
                    <Badge className={categoryTone(ticket.category)}>{categoryLabels[ticket.category]}</Badge>
                  </td>
                  <td className="py-4 text-slate-600">{ticket.subject}</td>
                  <td className="py-4 text-slate-600">{formatShortDate(ticket.createdAt)}</td>
                  <td className="py-4">
                    <Badge className={statusTone(ticket.status)}>{statusLabels[ticket.status]}</Badge>
                  </td>
                  <td className="py-4 text-slate-600">
                    {ticket.replies[0]?.message?.slice(0, 60) || "No replies yet"}
                  </td>
                  <td className="py-4">
                    <Link href={`/admin/tickets/${ticket.id}`} className="font-semibold text-blue-700">
                      Open ticket
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!tickets.length ? (
            <p className="py-8 text-center text-sm text-slate-500">No tickets matched the current filters.</p>
          ) : null}
        </div>
      </Card>
    </>
  );
}
