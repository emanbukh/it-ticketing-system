import { PageHeader } from "@/components/shared/page-header";
import { AdminUserForm } from "@/components/forms/admin-user-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "./users-table";

const USERS_PER_PAGE = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; edit?: string }>;
}) {
  const { page: pageParam, edit: editId } = await searchParams;
  const currentPage = Number(pageParam) || 1;
  const skip = (currentPage - 1) * USERS_PER_PAGE;

  // Get total count
  const totalCount = await prisma.user.count({
    where: { role: "USER" },
  });

  // Get paginated users
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      staffId: true,
      email: true,
      role: true,
      googleId: true,
      createdAt: true,
    },
    skip,
    take: USERS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

  return (
    <>
      <PageHeader
        eyebrow="User Management"
        title="Manage Staff Users"
        description="Add new staff accounts, update staff IDs, and manage user access."
      />
      
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        {/* Add/Edit User Form */}
        <Card className={editId ? "ring-2 ring-blue-500" : ""}>
          <CardTitle>{editId ? "Edit User" : "Add New User"}</CardTitle>
          <CardDescription className="mt-1">
            {editId 
              ? "Update staff information or optionally reset the user's password."
              : "Create a new staff user record for the internal portal."
            }
          </CardDescription>
          <div className="mt-6">
            <AdminUserForm
              key={editId || "new"}
              title={editId ? "Edit Staff User" : "New Staff User"}
              description=""
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <CardTitle>Existing Staff Users</CardTitle>
          <CardDescription className="mt-1">
            {totalCount} user{totalCount !== 1 ? "s" : ""} found. Edit or manage access.
          </CardDescription>
          <div className="mt-6">
            <UsersTable
              users={users}
              currentPage={currentPage}
              totalPages={totalPages}
              editId={editId || null}
              basePath="/admin/users"
            />
          </div>
        </Card>
      </div>
    </>
  );
}
