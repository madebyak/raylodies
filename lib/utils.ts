import { type ClassValue, clsx } from "clsx";

// Combine class names utility (simplified version without tailwind-merge for now)
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// Format price with currency
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Get current time formatted
export function getCurrentTime(timezone: string = "Asia/Dubai"): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date());
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate stagger delay for animations
export function getStaggerDelay(index: number, baseDelay: number = 0.1): number {
  return index * baseDelay;
}

