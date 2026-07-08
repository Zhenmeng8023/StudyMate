export interface ApiHealthResponse {
  status: string;
  app?: string;
  env?: string;
  scope?: string;
}

export interface ApiErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface ApiSuccessPayload<T> {
  success: true;
  data: T;
}

export function createAuthHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiSuccessPayload<T> | ApiErrorPayload;

  if (!response.ok || !payload.success) {
    const message = "error" in payload ? payload.error.message : "请求失败";
    throw new Error(message);
  }

  return payload.data;
}

export async function requestApi<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {})
    }
  });

  return readApiResponse<T>(response);
}

export async function getHealth(baseUrl = ""): Promise<ApiHealthResponse> {
  return requestApi<ApiHealthResponse>(`${baseUrl}/api/v1/health`);
}
