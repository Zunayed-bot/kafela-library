import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { bn } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateBn(date: Date | string): string {
  const d = new Date(date);
  return format(d, "d MMMM yyyy", { locale: bn });
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function getDaysOverdue(dueDate: Date | string): number {
  const due = new Date(dueDate);
  if (!isPast(due) || isToday(due)) return 0;
  return differenceInDays(new Date(), due);
}

export function getDaysRemaining(dueDate: Date | string): number {
  const due = new Date(dueDate);
  if (isPast(due)) return 0;
  return differenceInDays(due, new Date());
}

export function isOverdue(dueDate: Date | string): boolean {
  return isPast(new Date(dueDate)) && !isToday(new Date(dueDate));
}

export function getBorrowStatusColor(status: string, dueDate?: Date | string): string {
  if (status === "RETURNED") return "text-green-600 bg-green-50";
  if (status === "OVERDUE" || (dueDate && isOverdue(dueDate))) return "text-red-600 bg-red-50";
  return "text-blue-600 bg-blue-50";
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "…";
}

export function generateOTP(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function calculateDueDate(days: number = 14): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function banglaNumber(n: number): string {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n.toString().replace(/\d/g, (d) => bn[parseInt(d)]);
}

export function membershipTierLabel(tier: string): string {
  const map: Record<string, string> = {
    SILVER: "আল ফিদ্দাহ (সিলভার)",
    GOLDEN: "আয যাহাব (গোল্ডেন)",
    PLATINUM: "আল মারজান (প্লাটিনাম)",
  };
  return map[tier] || tier;
}

export function membershipTierColor(tier: string): string {
  const map: Record<string, string> = {
    SILVER: "text-slate-600 bg-slate-100",
    GOLDEN: "text-amber-700 bg-amber-50",
    PLATINUM: "text-teal-700 bg-teal-50",
  };
  return map[tier] || "text-gray-600 bg-gray-100";
}

export function apiResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return Response.json({ success: true, data, message }, { status });
}

export function apiError(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}
