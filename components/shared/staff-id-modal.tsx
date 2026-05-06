"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { updateUserProfileAction } from "@/lib/actions/user";
import { Alert } from "@/components/shared/alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/types";

type StaffIdModalProps = {
  userId: string;
  currentName: string;
};

export function StaffIdModal({ userId, currentName }: StaffIdModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(updateUserProfileAction, {} as ActionState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if modal was already dismissed for this session
    const dismissed = sessionStorage.getItem("staffIdModalDismissed");
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("staffIdModalDismissed", "true");
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await formAction(formData);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Complete Your Profile</h2>
        <p className="mt-2 text-sm text-slate-600">
          Welcome, <span className="font-medium text-slate-900">{currentName}</span>!
        </p>
        <p className="mt-2 text-sm text-slate-600">
          To help us identify you better, you can optionally add your Staff ID. This is not required, but it will make
          ticket handling smoother.
        </p>

        <form action={handleSubmit} className="mt-6 space-y-5">
          <input type="hidden" name="id" value={userId} />
          <input type="hidden" name="name" value={currentName} />
          
          {state.message ? (
            <Alert variant={state.success ? "success" : "error"} message={state.message} />
          ) : null}
          
          <div className="space-y-2">
            <label htmlFor="staffId" className="text-sm font-medium text-slate-700">
              Staff ID (optional)
            </label>
            <Input 
              id="staffId" 
              name="staffId" 
              placeholder="e.g., STF1001"
              autoComplete="off"
            />
            {state.errors?.staffId ? (
              <p className="text-sm text-rose-600">{state.errors.staffId[0]}</p>
            ) : null}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Skip for Now
            </button>
            <SubmitButton 
              label="Save Staff ID" 
              pendingLabel="Saving..." 
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
