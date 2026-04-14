"use client";

import { useActionState } from "react";
import { loginUserAction } from "@/lib/actions/auth";
import { Alert } from "@/components/shared/alert";
import { HcaptchaWidget } from "@/components/forms/hcaptcha-widget";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/types";

const initialState: ActionState = {};

export function UserLoginForm() {
  const [state, formAction] = useActionState(loginUserAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? <Alert variant="error" message={state.message} /> : null}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Staff Name
        </label>
        <Input id="name" name="name" placeholder="Nurul Huda" />
        {state.errors?.name ? <p className="text-sm text-rose-600">{state.errors.name[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="staffId" className="text-sm font-medium text-slate-700">
          Staff ID
        </label>
        <Input id="staffId" name="staffId" placeholder="STF1001" />
        {state.errors?.staffId ? (
          <p className="text-sm text-rose-600">{state.errors.staffId[0]}</p>
        ) : null}
      </div>
      <HcaptchaWidget />
      <SubmitButton label="Access User Portal" pendingLabel="Signing in..." className="w-full" />
      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
        Demo account: <span className="font-semibold text-slate-900">Nurul Huda / STF1001</span>
      </div>
    </form>
  );
}
