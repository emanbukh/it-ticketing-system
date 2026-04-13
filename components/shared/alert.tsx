import { cn } from "@/lib/utils";

type AlertProps = {
  variant?: "error" | "success" | "info";
  message: string;
};

export function Alert({ variant = "info", message }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-sm",
        variant === "error" && "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
        variant === "success" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
        variant === "info" && "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      )}
    >
      {message}
    </div>
  );
}
