import Link from "next/link";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function EmptyState({ title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-slate-200 text-center">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex rounded-2xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-soft"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </Card>
  );
}
