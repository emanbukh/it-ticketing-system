"use client";

import { useActionState } from "react";
import { createTicketAction } from "@/lib/actions/user";
import { Alert } from "@/components/shared/alert";
import { HcaptchaWidget } from "@/components/forms/hcaptcha-widget";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/forms/rich-text-editor";
import { Select } from "@/components/ui/select";
import { categoryLabels, TICKET_CATEGORIES } from "@/lib/utils";
import type { ActionState } from "@/types";

const initialState: ActionState = {};

export function TicketCreateForm() {
  const [state, formAction] = useActionState(createTicketAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? <Alert variant="error" message={state.message} /> : null}
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium text-slate-700">
          Issue Category
        </label>
        <Select id="category" name="category" defaultValue="">
          <option value="" disabled>
            Select a category
          </option>
          {TICKET_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </Select>
        {state.errors?.category ? (
          <p className="text-sm text-rose-600">{state.errors.category[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-slate-700">
          Subject
        </label>
        <Input id="subject" name="subject" placeholder="Summarize the issue clearly" />
        {state.errors?.subject ? (
          <p className="text-sm text-rose-600">{state.errors.subject[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Issue Description
        </label>
        <RichTextEditor
          name="description"
          placeholder="Describe the issue, impact, location, and any troubleshooting already attempted. Attach screenshots or PDFs as evidence."
        />
        {state.errors?.description ? (
          <p className="text-sm text-rose-600">{state.errors.description[0]}</p>
        ) : null}
      </div>
      <HcaptchaWidget />
      <SubmitButton label="Submit Ticket" pendingLabel="Submitting..." />
    </form>
  );
}
