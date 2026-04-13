import Link from "next/link";
import { redirect } from "next/navigation";
import { AppLogo } from "@/components/shared/app-logo";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  if (session?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (session?.role === "USER") {
    redirect("/user/dashboard");
  }

  return (
    <main className="min-h-screen bg-hero-grid px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-between">
        <div className="flex items-center justify-between">
          <AppLogo />
        </div>
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-700">
              Internal IT Service Desk
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Modern ticket management for staff requests and IT operations.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              Staff can submit and track complaints in a simple portal, while administrators get a
              focused workspace for response management, ticket history, and user administration.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login/user"
                className="rounded-2xl bg-navy px-6 py-3 text-sm font-semibold text-white shadow-soft"
              >
                Open User Portal
              </Link>
              <Link
                href="/login/admin"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
              >
                Open Admin Console
              </Link>
            </div>
          </section>
          <Card className="overflow-hidden bg-white/95 p-0">
            <div className="bg-gradient-to-r from-navy to-blue-700 px-6 py-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                Platform Snapshot
              </p>
              <p className="mt-2 text-2xl font-semibold">One workflow, two focused experiences.</p>
            </div>
            <div className="grid gap-4 p-6">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">User Site</p>
                <p className="mt-2 text-sm text-slate-600">
                  Quick login with name and staff ID, ticket submission, status tracking, and
                  conversation follow-up.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Admin Site</p>
                <p className="mt-2 text-sm text-slate-600">
                  Dashboard metrics, filters, threaded replies, history audit trail, and staff user
                  management.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
