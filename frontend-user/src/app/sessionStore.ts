import type { SessionInvalidationState } from "@studymate/api-client";
import type { AuthSession } from "../api/types";

const sessionStorageKey = "studymate.session";
const sessionInvalidationStorageKey = "studymate.session.invalidation";
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

let currentSession = readStoredSession();
let currentSessionInvalidation = readStoredSessionInvalidation();

function notifyListeners() {
  listeners.forEach((listener) => {
    listener();
  });
}

export function readSession(): AuthSession | null {
  return currentSession;
}

export function readSessionInvalidation(): SessionInvalidationState | null {
  return currentSessionInvalidation;
}

export function persistSession(session: AuthSession | null) {
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
