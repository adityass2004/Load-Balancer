import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildHealthUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl);
    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    if (cleanPath === '' || cleanPath === '/') {
      parsed.pathname = '/api/health';
    } else {
      parsed.pathname = cleanPath;
    }
    return parsed.toString();
  } catch {
    const trimmed = baseUrl.replace(/\/+$/, '');
    const hasPath = trimmed.includes('/', trimmed.indexOf('://') + 3);
    return hasPath ? trimmed : `${trimmed}/api/health`;
  }
}
