import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminDashboard } from "@/lib/tickets";
import {
  categoryLabels,
  categoryTone,
  formatShortDate,
  statusLabels,
  statusTone,
} from "@/lib/utils";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();

  return (
    <>
      <PageHeader
        eyebrow="Admin Dashboard"
        title="IT Ticket Overview"
        description="Watch ticket volume, response coverage, and resolution progress while keeping an eye on the latest incoming issues."
        actions={
          <Link
            href="/admin/tickets"
            className="rounded-2xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
          >
            Manage Tickets
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Tickets" value={data.total} helper="All requests across the system" />
        <StatCard label="Pending" value={data.pending} helper="Still in progress" />
        <StatCard label="Solved" value={data.solved} helper="Closed successfully" />
        <StatCard label="Response Rate" value={`${data.responseRate}%`} helper="Tickets with at least one admin reply" />
        <StatCard label="Solve Rate" value={`${data.solveRate}%`} helper="Tickets completed by IT" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Recent incoming tickets</CardTitle>
              <CardDescription className="mt-1">
                The latest requests submitted by staff users.
              </CardDescription>
            </div>
            <Link href="/admin/tickets" className="text-sm font-semibold text-blue-700">
              Open queue
            </Link>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 font-medium">Ticket</th>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-slate-100">
                    <td className="py-4">
                      <Link href={`/admin/tickets/${ticket.id}`} className="font-semibold text-slate-900">
                        {ticket.ticketNumber}
                      </Link>
                      <p className="mt-1 text-slate-500">{ticket.subject}</p>
                    </td>
                    <td className="py-4 text-slate-600">{ticket.user.name}</td>
                    <td className="py-4">
                      <Badge className={categoryTone(ticket.category)}>{categoryLabels[ticket.category]}</Badge>
                    </td>
                    <td className="py-4">
                      <Badge className={statusTone(ticket.status)}>{statusLabels[ticket.status]}</Badge>
                    </td>
                    <td className="py-4 text-slate-600">{formatShortDate(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle>Performance Snapshot</CardTitle>
            <CardDescription className="mt-1">Rates update directly from ticket and reply data.</CardDescription>
            <div className="mt-6 space-y-5">
              {[
                { label: "Response Rate", value: data.responseRate, tone: "bg-blue-500" },
                { label: "Solve Rate", value: data.solveRate, tone: "bg-emerald-500" },
                { label: "Pending Rate", value: data.pendingRate, tone: "bg-amber-500" },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{metric.label}</span>
                    <span className="text-slate-500">{metric.value}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className={`h-3 rounded-full ${metric.tone}`} style={{ width: `${metric.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>Tickets by Category</CardTitle>
            <CardDescription className="mt-1">Breakdown of requests by issue area.</CardDescription>
            <div className="mt-5 space-y-4">
              {data.categoryBreakdown.map((entry) => (
                <div key={entry.category}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Badge className={categoryTone(entry.category)}>{categoryLabels[entry.category]}</Badge>
                    <span className="text-sm text-slate-500">
                      {entry.total} ticket{entry.total === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-navy" style={{ width: `${entry.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
