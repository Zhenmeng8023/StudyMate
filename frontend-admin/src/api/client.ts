import { buildApiPath, createAuthHeaders, createSessionRequest, requestApi } from "@studymate/api-client";
import type { ApiRequestInit } from "@studymate/api-client";
import { persistSession, readSession, recordSessionInvalidation } from "./sessionStore";
import type { AdminSessionPayload } from "./sessionStore";

type AdminQueryValue = string | number | boolean | Array<string | number | boolean> | null | undefined;

const requestWithSession = createSessionRequest<AdminSessionPayload>({
  getSession: readSession,
  persistSession,
  onSessionInvalidated: recordSessionInvalidation,
  refreshSession: async (session) =>
    requestApi<AdminSessionPayload>("/api/v1/auth/refresh", {
      method: "POST",
      body: {
        refreshToken: session.refreshToken
      }
    })
});

export async function adminGet<T>(path: string, session?: AdminSessionPayload | null, query?: Record<string, AdminQueryValue>) {
  return requestWithSession<T>(
    buildApiPath(path, query),
    {
      headers: createAuthHeaders((readSession() ?? session)?.accessToken ?? null)
    },
    session ?? null
  );
}

export async function adminPost<T>(path: string, body: ApiRequestInit["body"], session?: AdminSessionPayload | null) {
  return requestWithSession<T>(
    path,
    {
      method: "POST",
      headers: createAuthHeaders((readSession() ?? session)?.accessToken ?? null),
      body
    },
    session ?? null
  );
}
