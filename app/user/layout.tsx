import type { ReactNode } from "react";
import { UserShell } from "@/components/layouts/user-shell";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UserLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("USER");

  return <UserShell userName={session.name}>{children}</UserShell>;
}
