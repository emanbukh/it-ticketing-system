"use client";

import { useActionState } from "react";
import { updateTicketStatusAction } from "@/lib/actions/admin";
import { Alert } from "@/components/shared/alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Select } from "@/components/ui/select";
import { statusLabels, TICKET_STATUSES, type TicketStatusValue } from "@/lib/utils";
import type { ActionState } from "@/types";

type AdminStatusFormProps = {
  ticketId: string;
  currentStatus: TicketStatusValue;
};

const initialState: ActionState = {};

export function AdminStatusForm({ ticketId, currentStatus }: AdminStatusFormProps) {
  const [state, formAction] = useActionState(updateTicketStatusAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      {state.message ? (
        <Alert variant={state.success ? "success" : "error"} message={state.message} />
      ) : null}
      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium text-slate-700">
          Ticket Status
        </label>
        <Select id="status" name="status" defaultValue={currentStatus}>
          {TICKET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </Select>
      </div>
      <SubmitButton label="Save Status" pendingLabel="Saving..." variant="success" />
    </form>
  );
}
