import { notFound } from "next/navigation";
import { AdminSettingsForm } from "@/components/forms/admin-settings-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminUsers } from "@/lib/tickets";
import { formatDate } from "@/lib/utils";

export default async function AdminSettingsPage() {
  const session = await requireSession("ADMIN");
  const [admin, adminUsers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
    }),
    getAdminUsers(),
  ]);

  if (!admin || !admin.username) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Admin Settings"
        description="Update your admin profile and review other administrator accounts in the system."
      />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardTitle>Your Admin Profile</CardTitle>
          <CardDescription className="mt-1">
            Change your display name, username, or password from here.
          </CardDescription>
          <div className="mt-6">
            <AdminSettingsForm id={admin.id} name={admin.name} username={admin.username} />
          </div>
        </Card>

        <Card>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription className="mt-1">
            Current admin users with access to the service desk console.
          </CardDescription>
          <div className="mt-6 space-y-4">
            {adminUsers.map((entry) => (
              <div key={entry.id} className="rounded-3xl bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{entry.name}</p>
                    <p className="mt-1 text-sm text-slate-500">@{entry.username}</p>
                  </div>
                  <p className="text-sm text-slate-500">Created {formatDate(entry.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
