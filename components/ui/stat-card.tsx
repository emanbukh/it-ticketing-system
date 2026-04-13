import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  helper: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card className="bg-white/95">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        <p className="max-w-28 text-right text-xs text-slate-500">{helper}</p>
      </div>
    </Card>
  );
}
