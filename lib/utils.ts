import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy, p");
}

export function formatShortDate(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy");
}

export function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export const TICKET_CATEGORIES = ["NETWORKING", "SKY", "EMAIL", "ASSET", "REQUEST"] as const;
export const TICKET_STATUSES = ["PENDING", "SOLVED"] as const;

export type TicketCategoryValue = (typeof TICKET_CATEGORIES)[number];
export type TicketStatusValue = (typeof TICKET_STATUSES)[number];

export const categoryLabels: Record<TicketCategoryValue, string> = {
  NETWORKING: "Networking",
  SKY: "Sky",
  EMAIL: "Email",
  ASSET: "Asset",
  REQUEST: "Request",
};

export const statusLabels: Record<TicketStatusValue, string> = {
  PENDING: "Pending",
  SOLVED: "Solved",
};

export function statusTone(status: TicketStatusValue) {
  return status === "SOLVED"
    ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
    : "bg-amber-100 text-amber-700 ring-amber-200";
}

export function categoryTone(category: TicketCategoryValue) {
  const tones: Record<TicketCategoryValue, string> = {
    NETWORKING: "bg-sky-100 text-sky-700 ring-sky-200",
    SKY: "bg-violet-100 text-violet-700 ring-violet-200",
    EMAIL: "bg-cyan-100 text-cyan-700 ring-cyan-200",
    ASSET: "bg-slate-100 text-slate-700 ring-slate-200",
    REQUEST: "bg-blue-100 text-blue-700 ring-blue-200",
  };

  return tones[category];
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
