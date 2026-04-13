"use client";

import { useActionState } from "react";
import { upsertUserAction } from "@/lib/actions/admin";
import { Alert } from "@/components/shared/alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/types";

type AdminUserFormProps = {
  title: string;
  description: string;
  id?: string;
  name?: string;
  staffId?: string;
};

const initialState: ActionState = {};

export function AdminUserForm({ title, description, id, name, staffId }: AdminUserFormProps) {
  const [state, formAction] = useActionState(upsertUserAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <div>
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {state.message ? (
        <Alert variant={state.success ? "success" : "error"} message={state.message} />
      ) : null}
      <div className="space-y-2">
        <label htmlFor={`name-${id || "new"}`} className="text-sm font-medium text-slate-700">
          Name
        </label>
        <Input id={`name-${id || "new"}`} name="name" defaultValue={name} />
        {state.errors?.name ? <p className="text-sm text-rose-600">{state.errors.name[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <label htmlFor={`staffId-${id || "new"}`} className="text-sm font-medium text-slate-700">
          Staff ID
        </label>
        <Input id={`staffId-${id || "new"}`} name="staffId" defaultValue={staffId} />
        {state.errors?.staffId ? (
          <p className="text-sm text-rose-600">{state.errors.staffId[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor={`password-${id || "new"}`} className="text-sm font-medium text-slate-700">
          Password <span className="text-slate-400">(optional)</span>
        </label>
        <Input
          id={`password-${id || "new"}`}
          name="password"
          type="password"
          placeholder={id ? "Leave blank to keep existing password" : "Optional starter password"}
        />
        {state.errors?.password ? (
          <p className="text-sm text-rose-600">{state.errors.password[0]}</p>
        ) : null}
      </div>
      <SubmitButton
        label={id ? "Update User" : "Add User"}
        pendingLabel={id ? "Updating..." : "Adding..."}
      />
    </form>
  );
}
