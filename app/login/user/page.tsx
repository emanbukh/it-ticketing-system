import Link from "next/link";
import { AuthShell } from "@/components/layouts/auth-shell";
import { UserLoginForm } from "@/components/forms/user-login-form";

export default function UserLoginPage() {
  return (
    <AuthShell
      title="Staff support, without the clutter."
      description="Log in with your staff name and ID to submit new IT issues, review recent requests, and stay updated on every reply."
      panelTitle="User Login"
      panelDescription="Access the staff ticket portal"
    >
      <UserLoginForm />
      <p className="mt-6 text-sm text-slate-500">
        Need the IT management side instead?{" "}
        <Link href="/login/admin" className="font-semibold text-blue-700">
          Go to admin login
        </Link>
      </p>
    </AuthShell>
  );
}
