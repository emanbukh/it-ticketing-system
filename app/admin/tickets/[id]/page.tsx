import { notFound } from "next/navigation";
import { replyAsAdminAction } from "@/lib/actions/admin";
import { AdminStatusForm } from "@/components/forms/admin-status-form";
import { TicketReplyForm } from "@/components/forms/ticket-reply-form";
import { ConversationThread } from "@/components/shared/conversation-thread";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getAdminTicketDetail } from "@/lib/tickets";
import {
  categoryLabels,
  categoryTone,
  formatDate,
  statusLabels,
  statusTone,
} from "@/lib/utils";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getAdminTicketDetail(id);

  if (!ticket) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin Ticket Detail"
        title={ticket.ticketNumber}
        description="Review the complete ticket thread, respond to the user, and update the ticket status from one screen."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>{ticket.subject}</CardTitle>
                <CardDescription className="mt-2">
                  Submitted by {ticket.user.name} on {formatDate(ticket.createdAt)}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={categoryTone(ticket.category)}>{categoryLabels[ticket.category]}</Badge>
                <Badge className={statusTone(ticket.status)}>{statusLabels[ticket.status]}</Badge>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">User Information</p>
                <p className="mt-3 text-sm text-slate-600">Name: {ticket.user.name}</p>
                <p className="mt-1 text-sm text-slate-600">Staff ID: {ticket.user.staffId || "-"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Ticket Description</p>
                <div
                  className="prose prose-sm mt-3 max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: ticket.description }}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Conversation Thread</CardTitle>
            <CardDescription className="mt-1">
              Full conversation between staff and the IT department.
            </CardDescription>
            <div className="mt-6">
              <ConversationThread replies={ticket.replies} />
            </div>
          </Card>

          <Card>
            <CardTitle>Ticket History</CardTitle>
            <CardDescription className="mt-1">
              Full audit trail for replies and status updates.
            </CardDescription>
            <div className="mt-5 space-y-4">
              {ticket.history.map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{entry.action.replaceAll("_", " ")}</p>
                    <p className="text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{entry.details || "No extra details provided."}</p>
                  <p className="mt-2 text-xs text-slate-500">Changed by {entry.changedByLabel}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Reply to User</CardTitle>
            <CardDescription className="mt-1">
              Continue the conversation directly from the admin panel.
            </CardDescription>
            <div className="mt-5">
              <TicketReplyForm
                action={replyAsAdminAction.bind(null, ticket.id)}
                buttonLabel="Send Admin Reply"
                pendingLabel="Sending..."
              />
            </div>
          </Card>

          <Card>
            <CardTitle>Update Ticket Status</CardTitle>
            <CardDescription className="mt-1">
              Keep the status aligned with the latest support progress.
            </CardDescription>
            <div className="mt-5">
              <AdminStatusForm ticketId={ticket.id} currentStatus={ticket.status} />
            </div>
          </Card>

          <Card>
            <CardTitle>Timing</CardTitle>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-900">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Updated</span>
                <span className="font-medium text-slate-900">{formatDate(ticket.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Replies</span>
                <span className="font-medium text-slate-900">{ticket.replies.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
