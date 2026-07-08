export interface AdminAuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
}

export interface AdminSessionPayload {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: AdminAuthUser;
}

const sessionStorageKey = "studymate.admin.session";
const listeners = new Set<() => void>();
let currentSession: AdminSessionPayload | null = null;

function readStoredSession(): AdminSessionPayload | null {
  const raw = window.localStorage.getItem(sessionStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSessionPayload;
  } catch {
    return null;
  }
}

function notifyListeners() {
  listeners.forEach((listener) => {
    listener();
  });
}

export function readSession(): AdminSessionPayload | null {
  currentSession = readStoredSession();
  return currentSession;
}

export function persistSession(session: AdminSessionPayload | null) {
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
