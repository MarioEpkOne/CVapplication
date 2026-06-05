// Client-only: a stable per-browser session id for the Ask-the-Agent demo.
// Stored in localStorage so the agent's conversation history persists across reloads (D6). Uses the
// browser-native crypto.randomUUID() — no extra dependency.

const STORAGE_KEY = "agent-session-id";

export function getSessionId(): string {
  // SSR / no-storage guard: return a throwaway id if localStorage is unavailable.
  if (typeof window === "undefined" || !window.localStorage) {
    return crypto.randomUUID();
  }
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
