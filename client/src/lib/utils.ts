import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function getAverageRating(ratings: number[]): number {
  if (!ratings.length) return 0;
  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export function generateStarRating(rating: number, maxStars = 5): string {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);
  
  let stars = '';
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }
  
  // Add half star if needed
  if (halfStar) {
    stars += '★';
  }
  
  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆';
  }
  
  return stars;
}

export function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
