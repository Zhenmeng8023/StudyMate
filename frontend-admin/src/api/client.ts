import { createAuthHeaders, requestApi } from "@studymate/api-client";

export interface AdminAuthSession {
  accessToken?: string | null;
}

export async function adminGet<T>(path: string, session?: AdminAuthSession | null) {
  return requestApi<T>(path, {
    headers: createAuthHeaders(session?.accessToken ?? null)
  });
}

export async function adminPost<T>(path: string, body: unknown, session?: AdminAuthSession | null) {
  return requestApi<T>(path, {
    method: "POST",
    headers: createAuthHeaders(session?.accessToken ?? null),
    body: JSON.stringify(body)
  });
}
