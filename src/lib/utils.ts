import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateForDisplay(date?: string | Date | null): string {
  if (!date) return "";

  const formatParts = (year: string, month: string, day: string) => `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;

  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) return "";
    return formatParts(`${date.getFullYear()}`, `${date.getMonth() + 1}`, `${date.getDate()}`);
  }

  const trimmed = date.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return formatParts(match[1], match[2], match[3]);
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return formatParts(`${parsed.getFullYear()}`, `${parsed.getMonth() + 1}`, `${parsed.getDate()}`);
  }

  return trimmed;
}

export function toTitleCase(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
