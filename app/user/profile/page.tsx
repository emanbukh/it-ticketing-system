import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function UserProfilePage() {
  const session = await requireSession("USER");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Your Profile"
        description="Keep your staff information up to date for smoother ticket handling."
      />
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardTitle>Account Snapshot</CardTitle>
          <CardDescription className="mt-1">Profile information used across the staff portal.</CardDescription>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-900">{user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Staff ID</span>
              <span className="font-medium text-slate-900">{user.staffId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Joined</span>
              <span className="font-medium text-slate-900">{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription className="mt-1">
            Changes are reflected in your user portal session immediately after saving.
            {!user.staffId && (
              <p className="mt-2 text-amber-600">
                ⚠️ You haven't added a Staff ID yet. Adding one helps us identify you faster.
              </p>
            )}
          </CardDescription>
          <div className="mt-6">
            <ProfileForm id={user.id} name={user.name} staffId={user.staffId || ""} />
          </div>
        </Card>
      </div>
    </>
  );
}
