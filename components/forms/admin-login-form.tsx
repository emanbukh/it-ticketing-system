"use client";

import { useActionState } from "react";
import { loginAdminAction } from "@/lib/actions/auth";
import { Alert } from "@/components/shared/alert";
import { HcaptchaWidget } from "@/components/forms/hcaptcha-widget";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/types";

const initialState: ActionState = {};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(loginAdminAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? <Alert variant="error" message={state.message} /> : null}
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-slate-700">
          Username
        </label>
        <Input id="username" name="username" placeholder="itadmin" />
        {state.errors?.username ? (
          <p className="text-sm text-rose-600">{state.errors.username[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Password
        </label>
        <Input id="password" name="password" type="password" placeholder="Enter password" />
        {state.errors?.password ? (
          <p className="text-sm text-rose-600">{state.errors.password[0]}</p>
        ) : null}
      </div>
      <HcaptchaWidget />
      <SubmitButton label="Access Admin Console" pendingLabel="Signing in..." className="w-full" />
      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
        Demo admin: <span className="font-semibold text-slate-900">itadmin / admin123</span>
      </div>
    </form>
  );
}
