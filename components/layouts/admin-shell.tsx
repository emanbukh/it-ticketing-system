import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { SidebarNav } from "@/components/layouts/sidebar-nav";
import { AppLogo } from "@/components/shared/app-logo";
import { SubmitButton } from "@/components/forms/submit-button";

type AdminShellProps = {
  adminName: string;
  children: ReactNode;
};

const adminNav = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Tickets", href: "/admin/tickets" },
  { label: "History", href: "/admin/history" },
  { label: "Users", href: "/admin/users" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminShell({ adminName, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-hero-grid px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[280px_1fr]">
        <aside className="rounded-[30px] border border-white/60 bg-slate-50/90 p-5 shadow-soft backdrop-blur">
          <AppLogo />
          <div className="mt-8 rounded-3xl bg-gradient-to-br from-slate-950 to-navy p-5 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-blue-100">Admin Console</p>
            <p className="mt-3 text-xl font-semibold">{adminName}</p>
            <p className="mt-1 text-sm text-blue-100/85">
              Manage live tickets, response quality, and user access.
            </p>
          </div>
          <div className="mt-6">
            <SidebarNav items={adminNav} />
          </div>
          <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">Operations tip</p>
            <p className="mt-2">Use the history page to review every reply and every status change in one audit trail.</p>
          </div>
          <div className="mt-6">
            <form action={logoutAction}>
              <SubmitButton label="Logout" pendingLabel="Logging out..." variant="secondary" className="w-full" />
            </form>
          </div>
        </aside>
        <section className="space-y-6">{children}</section>
      </div>
    </div>
  );
}
