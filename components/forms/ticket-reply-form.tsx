"use client";

import { useActionState } from "react";
import type { ActionState } from "@/types";
import { Alert } from "@/components/shared/alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Textarea } from "@/components/ui/textarea";

type TicketReplyFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  buttonLabel: string;
  pendingLabel: string;
};

const initialState: ActionState = {};

export function TicketReplyForm({ action, buttonLabel, pendingLabel }: TicketReplyFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <Alert variant={state.success ? "success" : "error"} message={state.message} />
      ) : null}
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-700">
          Reply Message
        </label>
        <Textarea id="message" name="message" placeholder="Share your update or next action." />
        {state.errors?.message ? (
          <p className="text-sm text-rose-600">{state.errors.message[0]}</p>
        ) : null}
      </div>
      <SubmitButton label={buttonLabel} pendingLabel={pendingLabel} />
    </form>
  );
}
