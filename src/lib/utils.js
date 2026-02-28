/**
 * utils.js — Shared utility functions used everywhere in the app.
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — A helper to merge Tailwind CSS classes safely.
 * shadcn/ui uses this in every component.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * extractSubdomain() — THE MOST IMPORTANT FUNCTION IN THE APP.
 *
 * Reads the current browser URL and figures out which university
 * (tenant) the user is trying to access.
 *
 * Examples:
 *   URL: nust.intelliversity.com  → returns "nust"
 *   URL: fast.intelliversity.com  → returns "fast"
 *   URL: intelliversity.com       → returns null (Super Admin portal)
 *   URL: nust.localhost           → returns "nust" (local development)
 *   URL: localhost                → returns null
 */
export function extractSubdomain() {
  const hostname = window.location.hostname;

  // For local development: handle "nust.localhost" format
  if (hostname.endsWith(".localhost") || hostname.endsWith(".127.0.0.1")) {
    const parts = hostname.split(".");
    if (parts.length > 1 && parts[0] !== "www") {
      return parts[0];
    }
    return null;
  }

  // For production: handle "nust.intelliversity.com" format
  const parts = hostname.split(".");
  if (parts.length > 2 && parts[0] !== "www" && parts[0] !== "app") {
    return parts[0];
  }

  return null;
}

/**
 * getInitials() — Get first letters of a name for avatars.
 * Example: "Saad Abdullah" → "SA"
 */
export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
