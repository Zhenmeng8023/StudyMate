import { createAuthHeaders, requestApi } from "@studymate/api-client";
import type { AuthSession } from "./types";

export function withAuth(session: AuthSession | null) {
  return createAuthHeaders(session?.accessToken ?? null);
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return requestApi<T>(`/api/v1${path}`, init);
}
