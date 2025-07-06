import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomOrderNumber(): string {
  const prefix = "KT";
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

export function getRandomDateInFuture(minHours = 24, maxHours = 48): Date {
  const future = new Date();
  const randomHours = minHours + Math.floor(Math.random() * (maxHours - minHours));
  future.setHours(future.getHours() + randomHours);
  return future;
}
