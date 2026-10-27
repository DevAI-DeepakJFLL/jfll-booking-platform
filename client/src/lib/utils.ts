import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves the target API URL for backend calls across local dev and deployed environments.
 * Automatically strips trailing slashes to prevent route mismatch errors (e.g. //api/bookings).
 */
export function getApiEndpoint(endpoint: string): string {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port !== '4000';

  if (isLocal) {
    return `http://localhost:4000${endpoint}`;
  }

  const cleanBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  return cleanBase ? `${cleanBase}${endpoint}` : endpoint;
}
