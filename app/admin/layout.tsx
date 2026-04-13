import type { ReactNode } from "react";
import { AdminShell } from "@/components/layouts/admin-shell";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("ADMIN");

  return <AdminShell adminName={session.name}>{children}</AdminShell>;
}
