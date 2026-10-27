import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves the target API URL for backend calls across local dev and deployed environments.
 * Points to the live AWS Lambda Function URL by default so that both local UI and deployed UI
 * reliably persist to DynamoDB and dispatch emails.
 */
export function getApiEndpoint(endpoint: string): string {
  const liveLambdaBase = 'https://52dp2vnbdlsogsjjqgm6oxsvgy0ladtt.lambda-url.ap-southeast-2.on.aws';

  // Support explicit local override via ?api=local query param or env
  const isExplicitLocal =
    (typeof window !== 'undefined' && window.location.search.includes('api=local')) ||
    process.env.NEXT_PUBLIC_API_URL === 'local';

  if (isExplicitLocal) {
    return `http://localhost:4000${endpoint}`;
  }

  const rawBase = process.env.NEXT_PUBLIC_API_URL || liveLambdaBase;
  const cleanBase = rawBase.replace(/\/+$/, '');
  return cleanBase ? `${cleanBase}${endpoint}` : endpoint;
}
