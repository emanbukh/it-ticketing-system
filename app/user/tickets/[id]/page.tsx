import { notFound } from "next/navigation";
import { replyToTicketAction } from "@/lib/actions/user";
import { TicketReplyForm } from "@/components/forms/ticket-reply-form";
import { ConversationThread } from "@/components/shared/conversation-thread";
import { PageHeader } from "@/components/shared/page-header";
import { Alert } from "@/components/shared/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { getUserTicketDetail } from "@/lib/tickets";
import {
  categoryLabels,
  categoryTone,
  formatDate,
  statusLabels,
  statusTone,
} from "@/lib/utils";

export default async function UserTicketDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, query, session] = await Promise.all([params, searchParams, requireSession("USER")]);
  const ticket = await getUserTicketDetail(session.userId, id);

  if (!ticket) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Ticket Detail"
        title={ticket.ticketNumber}
        description="Review the ticket details, monitor the admin conversation, and send follow-up information when the ticket is still pending."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {query.created === "1" ? (
            <Alert variant="success" message="Ticket submitted successfully." />
          ) : null}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>{ticket.subject}</CardTitle>
                <CardDescription className="mt-2">Created on {formatDate(ticket.createdAt)}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={categoryTone(ticket.category)}>{categoryLabels[ticket.category]}</Badge>
                <Badge className={statusTone(ticket.status)}>{statusLabels[ticket.status]}</Badge>
              </div>
            </div>
            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Issue Description</p>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{ticket.description}</p>
            </div>
          </Card>

          <Card>
            <CardTitle>Conversation Thread</CardTitle>
            <CardDescription className="mt-1">
              Messages exchanged between staff and the IT team.
            </CardDescription>
            <div className="mt-6">
              <ConversationThread replies={ticket.replies} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Ticket Summary</CardTitle>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-900">{categoryLabels[ticket.category]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-slate-900">{statusLabels[ticket.status]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-900">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Updated</span>
                <span className="font-medium text-slate-900">{formatDate(ticket.updatedAt)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Send Follow-up Reply</CardTitle>
            <CardDescription className="mt-1">
              Add more information if the ticket is still open.
            </CardDescription>
            <div className="mt-5">
              {ticket.status === "PENDING" ? (
                <TicketReplyForm
                  action={replyToTicketAction.bind(null, ticket.id)}
                  buttonLabel="Send Reply"
                  pendingLabel="Sending..."
                />
              ) : (
                <Alert
                  variant="info"
                  message="This ticket has been solved. Follow-up replies are disabled."
                />
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Recent History</CardTitle>
            <div className="mt-4 space-y-4">
              {ticket.history.slice(0, 5).map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{entry.action.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-slate-600">{entry.details || "Status updated."}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
