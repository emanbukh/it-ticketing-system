import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-grid px-4">
      <div className="max-w-xl rounded-[32px] border border-white/60 bg-white/95 p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          The page you were looking for is not available.
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          The ticket or route may have been removed, or you may not have access to it.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-soft"
          >
            Back to Home
          </Link>
          <Link
            href="/login/user"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            User Login
          </Link>
        </div>
      </div>
    </main>
  );
}
