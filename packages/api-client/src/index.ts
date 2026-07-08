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

type ApiQueryPrimitive = string | number | boolean;
type ApiQueryValue = ApiQueryPrimitive | ApiQueryPrimitive[] | null | undefined;
export type ApiJsonBody = Record<string, unknown> | unknown[];
type ApiRawBody = Exclude<NonNullable<BodyInit>, string>;

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  body?: BodyInit | ApiJsonBody | null;
}

interface NormalizedApiRequestBody {
  body?: BodyInit;
  usesJsonContentType: boolean;
}

export function createAuthHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function buildApiPath(path: string, query?: Record<string, ApiQueryValue>): string {
  if (!query) return path;

  const isAbsolute = /^https?:\/\//.test(path);
  const url = new URL(path, isAbsolute ? undefined : "http://localhost");

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      if (!value.length) return;
      url.searchParams.set(key, value.join(","));
      return;
    }
    url.searchParams.set(key, String(value));
  });

  if (isAbsolute) {
    return url.toString();
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiSuccessPayload<T> | ApiErrorPayload;

  if (!response.ok || !payload.success) {
    const message = "error" in payload ? payload.error.message : "请求失败";
    throw new Error(message);
  }

  return payload.data;
}

function isBinaryBody(body: unknown): body is ApiRawBody {
  return (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)
  );
}

function normalizeRequestBody(body: ApiRequestInit["body"]): NormalizedApiRequestBody {
  if (body === null || body === undefined) {
    return { body: undefined, usesJsonContentType: false };
  }

  if (typeof body === "string") {
    return { body, usesJsonContentType: true };
  }

  if (isBinaryBody(body)) {
    return { body, usesJsonContentType: false };
  }

  return { body: JSON.stringify(body), usesJsonContentType: true };
}

export async function requestApi<T>(input: string, init?: ApiRequestInit): Promise<T> {
  const normalizedBody = normalizeRequestBody(init?.body);
  const response = await fetch(input, {
    ...init,
    body: normalizedBody.body,
    headers: {
      ...(normalizedBody.usesJsonContentType ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {})
    }
  });

  return readApiResponse<T>(response);
}

export async function getHealth(baseUrl = ""): Promise<ApiHealthResponse> {
  return requestApi<ApiHealthResponse>(`${baseUrl}/api/v1/health`);
}
