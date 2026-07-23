/**
 * Resolves the base API URL from the Vite environment variable.
 *
 * - Local dev:  VITE_API_URL=http://localhost:8000  (set in .env)
 * - Production: VITE_API_URL=""  → demo / offline mode (set in .env.production)
 */
const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:8000';

export const API = {
  url: (path: string) => `${API_BASE}${path}`,

  get: (path: string) =>
    fetch(`${API_BASE}${path}`).catch(() => null),

  post: (path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null),
};

export const isOffline = !API_BASE || API_BASE === '';
