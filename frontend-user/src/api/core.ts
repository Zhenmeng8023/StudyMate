import type { ApiErrorPayload, ApiSuccessPayload, AuthSession } from "./types";

export function withAuth(session: AuthSession | null) {
  const headers: Record<string, string> = {};
  if (session) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return headers;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {})
    }
  });

  const payload = (await response.json()) as ApiSuccessPayload<T> | ApiErrorPayload;
  if (!response.ok || !payload.success) {
    const message = "error" in payload ? payload.error.message : "请求失败";
    throw new Error(message);
  }

  return payload.data;
}
