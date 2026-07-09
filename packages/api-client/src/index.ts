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

export interface ApiSession {
  accessToken: string;
  refreshToken: string;
}

export interface SessionInvalidationState {
  kind: "refresh_failed" | "session_rejected";
  code: string;
  message: string;
  status: number;
  occurredAt: string;
}

export interface SessionRequestOptions<TSession extends ApiSession> {
  getSession: () => TSession | null;
  persistSession: (session: TSession | null) => void;
  refreshSession: (session: TSession) => Promise<TSession>;
  onSessionInvalidated?: (reason: SessionInvalidationState) => void;
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

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

function createSessionInvalidationState(
  kind: SessionInvalidationState["kind"],
  error: unknown,
  fallbackCode: string,
  fallbackMessage: string,
  fallbackStatus: number
): SessionInvalidationState {
  if (error instanceof ApiRequestError) {
    return {
      kind,
      code: error.code,
      message: error.message,
      status: error.status,
      occurredAt: new Date().toISOString()
    };
  }

  return {
    kind,
    code: fallbackCode,
    message: error instanceof Error ? error.message : fallbackMessage,
    status: fallbackStatus,
    occurredAt: new Date().toISOString()
  };
}

function createRefreshFailureState(error: unknown): SessionInvalidationState {
  return createSessionInvalidationState(
    "refresh_failed",
    error,
    "session_refresh_failed",
    "Session refresh failed",
    401
  );
}

function createSessionRejectedState(error: unknown): SessionInvalidationState {
  return createSessionInvalidationState(
    "session_rejected",
    error,
    "session_rejected",
    "Session rejected",
    403
  );
}

function isSessionRejectedError(error: unknown) {
  return error instanceof ApiRequestError && error.status === 403 && error.code === "user_disabled";
}

export function getSessionInvalidationPrompt(reason: SessionInvalidationState | null, audience: "user" | "admin" = "user") {
  if (!reason) {
    return "";
  }

  if (reason.code === "user_disabled") {
    return audience === "admin"
      ? "当前账号已被禁用，请联系其他管理员后重新登录。"
      : "当前账号已被禁用，请联系管理员后重新登录。";
  }

  return audience === "admin"
    ? "后台会话已失效，请重新登录后继续治理工作。"
    : "当前登录状态已失效，请重新登录后继续学习。";
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
    const code = "error" in payload ? payload.error.code : "request_failed";
    const message = "error" in payload ? payload.error.message : "Request failed";
    throw new ApiRequestError(message, response.status, code);
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

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return { ...headers };
}

function createRequestHeaders(init: ApiRequestInit | undefined, accessToken?: string | null) {
  const normalizedBody = normalizeRequestBody(init?.body);
  const headers = {
    ...(normalizedBody.usesJsonContentType ? { "Content-Type": "application/json" } : {}),
    ...normalizeHeaders(init?.headers),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
  };

  return {
    body: normalizedBody.body,
    headers
  };
}

async function performRequest<T>(input: string, init?: ApiRequestInit, accessToken?: string | null): Promise<T> {
  const normalizedRequest = createRequestHeaders(init, accessToken);
  const response = await fetch(input, {
    ...init,
    body: normalizedRequest.body,
    headers: normalizedRequest.headers
  });

  return readApiResponse<T>(response);
}

export async function requestApi<T>(input: string, init?: ApiRequestInit): Promise<T> {
  return performRequest<T>(input, init);
}

export function createSessionRequest<TSession extends ApiSession>(options: SessionRequestOptions<TSession>) {
  let refreshPromise: Promise<TSession> | null = null;

  async function refreshOnce(session: TSession) {
    if (!refreshPromise) {
      refreshPromise = options.refreshSession(session)
        .then((nextSession) => {
          options.persistSession(nextSession);
          return nextSession;
        })
        .catch((error) => {
          options.onSessionInvalidated?.(createRefreshFailureState(error));
          options.persistSession(null);
          throw error;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  }

  return async function requestWithSession<T>(input: string, init?: ApiRequestInit, sessionOverride?: TSession | null): Promise<T> {
    const activeSession = sessionOverride ?? options.getSession();

    try {
      return await performRequest<T>(input, init, activeSession?.accessToken ?? null);
    } catch (error) {
      if (activeSession && isSessionRejectedError(error)) {
        options.onSessionInvalidated?.(createSessionRejectedState(error));
        options.persistSession(null);
        throw error;
      }

      if (!(error instanceof ApiRequestError) || error.status !== 401 || !activeSession) {
        throw error;
      }

      const nextSession = await refreshOnce(activeSession);
      return performRequest<T>(input, init, nextSession.accessToken);
    }
  };
}

export async function getHealth(baseUrl = ""): Promise<ApiHealthResponse> {
  return requestApi<ApiHealthResponse>(`${baseUrl}/api/v1/health`);
}
