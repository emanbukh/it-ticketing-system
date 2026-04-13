import Image from "next/image";
import Link from "next/link";

export function AppLogo() {
  return (
    <Link href="/" className="inline-flex flex-col items-start gap-3">
      <div className="rounded-3xl bg-white px-4 py-3 shadow-soft ring-1 ring-slate-200/70">
        <Image
          src="/iuc-logo.png"
          alt="Innovative University College logo"
          width={3508}
          height={1201}
          priority
          className="h-11 w-auto sm:h-12"
        />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
          IT Service Desk
        </p>
        <p className="text-sm font-semibold text-slate-950 sm:text-base">Ticketing Information System</p>
      </div>
    </Link>
  );
}
