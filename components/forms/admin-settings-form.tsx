"use client";

import { useActionState } from "react";
import { updateAdminSettingsAction } from "@/lib/actions/admin";
import { Alert } from "@/components/shared/alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/types";

type AdminSettingsFormProps = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
};

const initialState: ActionState = {};

export function AdminSettingsForm({ id, name, username, email }: AdminSettingsFormProps) {
  const [state, formAction] = useActionState(updateAdminSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={id} />
      {state.message ? (
        <Alert variant={state.success ? "success" : "error"} message={state.message} />
      ) : null}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Display Name
        </label>
        <Input id="name" name="name" defaultValue={name} />
        {state.errors?.name ? <p className="text-sm text-rose-600">{state.errors.name[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-slate-700">
          Username
        </label>
        <Input id="username" name="username" defaultValue={username} />
        {state.errors?.username ? (
          <p className="text-sm text-rose-600">{state.errors.username[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email <span className="text-slate-400">(for notifications)</span>
        </label>
        <Input id="email" name="email" type="email" defaultValue={email ?? ""} placeholder="it-admin@company.com" />
        {state.errors?.email ? <p className="text-sm text-rose-600">{state.errors.email[0]}</p> : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">
            Current Password
          </label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="Required only for password change"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
            New Password
          </label>
          <Input id="newPassword" name="newPassword" type="password" placeholder="Leave blank to keep existing" />
          {state.errors?.newPassword ? (
            <p className="text-sm text-rose-600">{state.errors.newPassword[0]}</p>
          ) : null}
        </div>
      </div>
      <SubmitButton label="Save Changes" pendingLabel="Saving..." />
    </form>
  );
}
