import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { AppLogo } from "@/components/shared/app-logo";
import { SidebarNav } from "@/components/layouts/sidebar-nav";
import { SubmitButton } from "@/components/forms/submit-button";

type UserShellProps = {
  userName: string;
  children: ReactNode;
};

const userNav = [
  { label: "Dashboard", href: "/user/dashboard" },
  { label: "My Tickets", href: "/user/tickets" },
  { label: "Create Ticket", href: "/user/tickets/new" },
  { label: "Profile", href: "/user/profile" },
];

export function UserShell({ userName, children }: UserShellProps) {
  return (
    <div className="min-h-screen bg-hero-grid px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[260px_1fr]">
        <aside className="rounded-[30px] border border-white/60 bg-slate-50/85 p-5 shadow-soft backdrop-blur">
          <AppLogo />
          <div className="mt-8 rounded-3xl bg-gradient-to-br from-navy to-blue-700 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-blue-100">Staff Portal</p>
            <p className="mt-3 text-xl font-semibold">{userName}</p>
            <p className="mt-1 text-sm text-blue-100/85">Track requests, replies, and ticket progress.</p>
          </div>
          <div className="mt-6">
            <SidebarNav items={userNav} />
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/user/tickets/new"
              className="rounded-2xl bg-navy px-4 py-3 text-center text-sm font-semibold text-white shadow-soft"
            >
              Create Ticket
            </Link>
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
