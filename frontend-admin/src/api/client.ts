import { buildApiPath, createAuthHeaders, requestApi } from "@studymate/api-client";
import type { ApiRequestInit } from "@studymate/api-client";

export interface AdminAuthSession {
  accessToken?: string | null;
}

type AdminQueryValue = string | number | boolean | Array<string | number | boolean> | null | undefined;

export async function adminGet<T>(path: string, session?: AdminAuthSession | null, query?: Record<string, AdminQueryValue>) {
  return requestApi<T>(buildApiPath(path, query), {
    headers: createAuthHeaders(session?.accessToken ?? null)
  });
}

export async function adminPost<T>(path: string, body: ApiRequestInit["body"], session?: AdminAuthSession | null) {
  return requestApi<T>(path, {
    method: "POST",
    headers: createAuthHeaders(session?.accessToken ?? null),
    body
  });
}
