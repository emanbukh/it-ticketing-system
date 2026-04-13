"use client";

import { useActionState } from "react";
import { updateUserProfileAction } from "@/lib/actions/user";
import { Alert } from "@/components/shared/alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/types";

type ProfileFormProps = {
  id: string;
  name: string;
  staffId: string;
};

const initialState: ActionState = {};

export function ProfileForm({ id, name, staffId }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateUserProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={id} />
      {state.message ? (
        <Alert variant={state.success ? "success" : "error"} message={state.message} />
      ) : null}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Name
        </label>
        <Input id="name" name="name" defaultValue={name} />
        {state.errors?.name ? <p className="text-sm text-rose-600">{state.errors.name[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="staffId" className="text-sm font-medium text-slate-700">
          Staff ID
        </label>
        <Input id="staffId" name="staffId" defaultValue={staffId} />
        {state.errors?.staffId ? (
          <p className="text-sm text-rose-600">{state.errors.staffId[0]}</p>
        ) : null}
      </div>
      <SubmitButton label="Update Profile" pendingLabel="Updating..." />
    </form>
  );
}
