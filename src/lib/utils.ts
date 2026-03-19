import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Format date with optional format pattern
 */
export function formatDate(
  date: string | Date,
  formatPattern?: string
): string {
  try {
    let dateObj: Date;

    if (typeof date === "string") {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) {
      return "Invalid date";
    }

    return format(dateObj, formatPattern || "MMM d, yyyy");
  } catch (error) {
    return "Invalid date";
  }
}

/**
 * Generate unique ID using UUID v4
 */
export function generateId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Truncate string to specified length with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "...";
}

/**
 * Convert string to URL-friendly slug
 */
export function slugify(str: string): string {
  if (!str) return "";

  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Get initials from a person's name
 */
export function getInitials(name: string): string {
  if (!name) return "";

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
