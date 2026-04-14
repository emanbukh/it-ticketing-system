import { PageHeader } from "@/components/shared/page-header";
import { AdminUserForm } from "@/components/forms/admin-user-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getUsers } from "@/lib/tickets";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <>
      <PageHeader
        eyebrow="User Management"
        title="Manage Staff Users"
        description="Add new staff accounts, update staff IDs, and reset passwords when required."
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardTitle>Add New User</CardTitle>
          <CardDescription className="mt-1">
            Create a new staff user record for the internal portal.
          </CardDescription>
          <div className="mt-6">
            <AdminUserForm
              title="New Staff User"
              description="Enter the staff details below to create a new user."
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Existing Staff Users</CardTitle>
          <CardDescription className="mt-1">
            Edit user details directly from the current list.
          </CardDescription>
          <div className="mt-6 space-y-4">
            {users.map((user) => (
              <div key={user.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Staff ID {user.staffId || "-"} • Added {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
                <AdminUserForm
                  id={user.id}
                  name={user.name}
                  staffId={user.staffId || ""}
                  email={user.email}
                  title="Edit User"
                  description="Update staff information or optionally reset the user's password."
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
