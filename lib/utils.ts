import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HEALTH_PATH = '/api/health';

export function buildHealthUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl);
    if (parsed.pathname === '/' || parsed.pathname === '') {
      parsed.pathname = HEALTH_PATH;
    } else {
      const clean = parsed.pathname.replace(/\/+$/, '');
      if (!clean.endsWith(HEALTH_PATH)) {
        parsed.pathname = `${clean}${HEALTH_PATH}`;
      }
    }
    return parsed.toString();
  } catch {
    const trimmed = baseUrl.replace(/\/+$/, '');
    return `${trimmed}${HEALTH_PATH}`;
  }
}
