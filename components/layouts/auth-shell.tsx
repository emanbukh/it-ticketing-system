import type { ReactNode } from "react";
import { AppLogo } from "@/components/shared/app-logo";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  panelTitle: string;
  panelDescription: string;
};

export function AuthShell({
  title,
  description,
  children,
  panelTitle,
  panelDescription,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-hero-grid px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[32px] border border-white/50 bg-gradient-to-br from-navy via-[#10304d] to-blue-700 p-8 text-white shadow-soft lg:p-12">
          <AppLogo />
          <div className="my-10 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">
              Internal IT Workspace
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-5 text-base text-blue-50/90 sm:text-lg">{description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold">Faster issue handling</p>
              <p className="mt-2 text-sm text-blue-50/80">
                Keep complaints, requests, updates, and ticket history in one place.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold">Clear role separation</p>
              <p className="mt-2 text-sm text-blue-50/80">
                Staff get a simple portal, while IT admins manage the full workflow.
              </p>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[32px] border border-white/60 bg-white/95 p-8 shadow-soft backdrop-blur lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">{panelTitle}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{panelDescription}</h2>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
