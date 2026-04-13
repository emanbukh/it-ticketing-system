import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireSession } from "@/lib/auth";
import { getUserTickets } from "@/lib/tickets";
import {
  categoryLabels,
  categoryTone,
  formatShortDate,
  statusLabels,
  statusTone,
} from "@/lib/utils";

export default async function UserTicketsPage() {
  const session = await requireSession("USER");
  const tickets = await getUserTickets(session.userId);

  return (
    <>
      <PageHeader
        eyebrow="Ticket Tracking"
        title="My Tickets"
        description="Review every submitted issue, the current status, and the most recent admin response."
        actions={
          <Link
            href="/user/tickets/new"
            className="rounded-2xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
          >
            Create Ticket
          </Link>
        }
      />

      <Card>
        {tickets.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">Ticket ID</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium">Created Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Latest Reply</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-slate-100">
                    <td className="py-4 font-semibold text-slate-900">{ticket.ticketNumber}</td>
                    <td className="py-4">
                      <Badge className={categoryTone(ticket.category)}>{categoryLabels[ticket.category]}</Badge>
                    </td>
                    <td className="py-4 text-slate-600">{ticket.subject}</td>
                    <td className="py-4 text-slate-600">{formatShortDate(ticket.createdAt)}</td>
                    <td className="py-4">
                      <Badge className={statusTone(ticket.status)}>{statusLabels[ticket.status]}</Badge>
                    </td>
                    <td className="py-4 text-slate-600">
                      {ticket.replies[0]?.message?.slice(0, 70) || "No replies yet"}
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/user/tickets/${ticket.id}`}
                        className="text-sm font-semibold text-blue-700"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No tickets available"
            description="Create a ticket to start tracking your requests."
            ctaHref="/user/tickets/new"
            ctaLabel="Create Ticket"
          />
        )}
      </Card>
    </>
  );
}
