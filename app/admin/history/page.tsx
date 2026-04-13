import { HistoryAction } from "@prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTicketHistory } from "@/lib/tickets";
import { formatDate } from "@/lib/utils";

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: HistoryAction | "ALL" }>;
}) {
  const params = await searchParams;
  const history = await getTicketHistory(params.q, params.action);

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Ticket Tracking History"
        description="Audit replies, status transitions, and key actions across the full service desk."
      />
      <Card>
        <form className="grid gap-4 md:grid-cols-[1.5fr_1fr_auto]">
          <input
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search ticket number, subject, or actor"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
          <select
            name="action"
            defaultValue={params.action || "ALL"}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="ALL">All actions</option>
            {Object.values(HistoryAction).map((action) => (
              <option key={action} value={action}>
                {action.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-soft"
          >
            Filter
          </button>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Ticket</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Changed By</th>
                <th className="pb-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-100">
                  <td className="py-4 text-slate-600">{formatDate(entry.createdAt)}</td>
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">{entry.ticket.ticketNumber}</p>
                    <p className="mt-1 text-slate-500">{entry.ticket.subject}</p>
                  </td>
                  <td className="py-4">
                    <Badge className="bg-slate-100 text-slate-700 ring-slate-200">
                      {entry.action.replaceAll("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-4 text-slate-600">{entry.changedByLabel}</td>
                  <td className="py-4 text-slate-600">{entry.details || "No details provided."}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!history.length ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No history records matched the current search.
            </p>
          ) : null}
        </div>
      </Card>
    </>
  );
}
