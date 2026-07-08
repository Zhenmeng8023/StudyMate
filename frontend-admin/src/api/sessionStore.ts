import type { SessionInvalidationState } from "@studymate/api-client";

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
const sessionInvalidationStorageKey = "studymate.admin.session.invalidation";
const listeners = new Set<() => void>();
let currentSession: AdminSessionPayload | null = null;
let currentSessionInvalidation: SessionInvalidationState | null = null;

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

function readStoredSessionInvalidation(): SessionInvalidationState | null {
  const raw = window.localStorage.getItem(sessionInvalidationStorageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionInvalidationState;
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

export function readSessionInvalidation(): SessionInvalidationState | null {
  currentSessionInvalidation = readStoredSessionInvalidation();
  return currentSessionInvalidation;
}

export function persistSession(session: AdminSessionPayload | null) {
  currentSession = session;

  if (session) {
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    currentSessionInvalidation = null;
    window.localStorage.removeItem(sessionInvalidationStorageKey);
  } else {
    window.localStorage.removeItem(sessionStorageKey);
  }

  notifyListeners();
}

export function recordSessionInvalidation(reason: SessionInvalidationState) {
  currentSessionInvalidation = reason;
  window.localStorage.setItem(sessionInvalidationStorageKey, JSON.stringify(reason));
  notifyListeners();
}

export function clearSessionInvalidation() {
  currentSessionInvalidation = null;
  window.localStorage.removeItem(sessionInvalidationStorageKey);
  notifyListeners();
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const subscribeSessionInvalidation = subscribeSession;
