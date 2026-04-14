"use client";

import { useActionState } from "react";
import type { ActionState } from "@/types";
import { Alert } from "@/components/shared/alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { RichTextEditor } from "@/components/forms/rich-text-editor";

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
        <RichTextEditor name="message" placeholder="Share your update, attach screenshots, or upload a PDF." minHeight={220} />
        {state.errors?.message ? (
          <p className="text-sm text-rose-600">{state.errors.message[0]}</p>
        ) : null}
      </div>
      <SubmitButton label={buttonLabel} pendingLabel={pendingLabel} />
    </form>
  );
}
