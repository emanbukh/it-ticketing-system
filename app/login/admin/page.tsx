import Link from "next/link";
import { AuthShell } from "@/components/layouts/auth-shell";
import { AdminLoginForm } from "@/components/forms/admin-login-form";

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Manage support operations with a clear IT control panel."
      description="Authenticate as an administrator to manage ticket queues, reply to users, update statuses, review history, and administer staff accounts."
      panelTitle="Admin Login"
      panelDescription="Access the IT department console"
    >
      <AdminLoginForm />
      <p className="mt-6 text-sm text-slate-500">
        Looking for the staff portal?{" "}
        <Link href="/login/user" className="font-semibold text-blue-700">
          Go to user login
        </Link>
      </p>
    </AuthShell>
  );
}
