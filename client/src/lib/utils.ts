import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves the target API URL for backend calls across local dev and deployed environments.
 * Cleans and sanitizes any malformed environment variables (such as markdown links or trailing slashes)
 * so that both local UI and deployed UI reliably reach the live AWS Lambda Function URL.
 */
export function getApiEndpoint(endpoint: string): string {
  const liveLambdaBase = 'https://52dp2vnbdlsogsjjqgm6oxsvgy0ladtt.lambda-url.ap-southeast-2.on.aws';

  // Support explicit local override via ?api=local query param
  const isExplicitLocal =
    typeof window !== 'undefined' && window.location.search.includes('api=local');

  if (isExplicitLocal) {
    return `http://localhost:4000${endpoint}`;
  }

  let raw = (process.env.NEXT_PUBLIC_API_URL || liveLambdaBase).trim();

  // If a markdown link was pasted like [url](url), extract the clean URL inside () or []
  const markdownMatch = raw.match(/\((https?:\/\/[^\s)]+)\)/);
  if (markdownMatch) {
    raw = markdownMatch[1];
  } else {
    const urlMatch = raw.match(/https?:\/\/[a-zA-Z0-9.-]+\.on\.aws/) || raw.match(/https?:\/\/[^\s[\]]+/);
    if (urlMatch) {
      raw = urlMatch[0];
    }
  }

  const cleanBase = raw.replace(/\/+$/, '') || liveLambdaBase;
  return `${cleanBase}${endpoint}`;
}
