import type { AuthSession } from "../api/types";

const sessionStorageKey = "studymate.session";
const listeners = new Set<() => void>();

function readStoredSession(): AuthSession | null {
  const raw = window.localStorage.getItem(sessionStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

let currentSession = readStoredSession();

function notifyListeners() {
  listeners.forEach((listener) => {
    listener();
  });
}

export function readSession(): AuthSession | null {
  return currentSession;
}

export function persistSession(session: AuthSession | null) {
  currentSession = session;

  if (session) {
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(sessionStorageKey);
  }

  notifyListeners();
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
