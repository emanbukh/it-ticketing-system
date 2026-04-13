import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { requireSession } from "@/lib/auth";
import { getUserDashboard } from "@/lib/tickets";
import {
  categoryLabels,
  categoryTone,
  formatShortDate,
  statusLabels,
  statusTone,
} from "@/lib/utils";

export default async function UserDashboardPage() {
  const session = await requireSession("USER");
  const data = await getUserDashboard(session.userId);

  return (
    <>
      <PageHeader
        eyebrow="User Dashboard"
        title={`Welcome back, ${session.name}`}
        description="Track submitted tickets, review the latest IT replies, and create new support requests from one place."
        actions={
          <Link
            href="/user/tickets/new"
            className="rounded-2xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
          >
            Create Ticket
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Submitted Tickets" value={data.total} helper="All requests you have raised" />
        <StatCard label="Pending Tickets" value={data.pending} helper="Still waiting for closure" />
        <StatCard label="Solved Tickets" value={data.solved} helper="Completed by the IT team" />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Recent tickets</CardTitle>
            <CardDescription>Your most recent requests and their current statuses.</CardDescription>
          </div>
          <Link href="/user/tickets" className="text-sm font-semibold text-blue-700">
            View all
          </Link>
        </div>
        {data.recentTickets.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">Ticket</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Latest Reply</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-slate-100">
                    <td className="py-4">
                      <Link href={`/user/tickets/${ticket.id}`} className="font-semibold text-slate-900">
                        {ticket.ticketNumber}
                      </Link>
                      <p className="mt-1 text-slate-500">{ticket.subject}</p>
                    </td>
                    <td className="py-4">
                      <Badge className={categoryTone(ticket.category)}>{categoryLabels[ticket.category]}</Badge>
                    </td>
                    <td className="py-4 text-slate-600">{formatShortDate(ticket.createdAt)}</td>
                    <td className="py-4">
                      <Badge className={statusTone(ticket.status)}>{statusLabels[ticket.status]}</Badge>
                    </td>
                    <td className="py-4 text-slate-600">
                      {ticket.replies[0]?.message?.slice(0, 60) || "No replies yet"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No tickets submitted yet"
              description="Start by creating your first IT request."
              ctaHref="/user/tickets/new"
              ctaLabel="Create Ticket"
            />
          </div>
        )}
      </Card>
    </>
  );
}
