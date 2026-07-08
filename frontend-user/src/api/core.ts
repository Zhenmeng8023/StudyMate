import { createAuthHeaders, createSessionRequest, requestApi } from "@studymate/api-client";
import type { ApiRequestInit } from "@studymate/api-client";
import { persistSession, readSession, recordSessionInvalidation } from "../app/sessionStore";
import type { AuthSession } from "./types";

export function withAuth(session: AuthSession | null) {
  return createAuthHeaders((readSession() ?? session)?.accessToken ?? null);
}

const requestWithSession = createSessionRequest<AuthSession>({
  getSession: readSession,
  persistSession,
  onSessionInvalidated: recordSessionInvalidation,
  refreshSession: async (session) =>
    requestApi<AuthSession>("/api/v1/auth/refresh", {
      method: "POST",
      body: {
        refreshToken: session.refreshToken
      }
    })
});

export async function request<T>(path: string, init?: ApiRequestInit): Promise<T> {
  return requestWithSession<T>(`/api/v1${path}`, init);
}
