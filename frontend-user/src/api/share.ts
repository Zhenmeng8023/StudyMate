import { request, withAuth } from "./core";
import type { AuthSession, ShareLinkPayload, ShareResolvePayload } from "./types";

export async function listShareLinks(session: AuthSession) {
  return request<ShareLinkPayload[]>("/share-links", {
    headers: withAuth(session)
  });
}

export async function createShareLink(
  session: AuthSession,
  input: { targetType: string; targetId: string; mode: string; expiresAt?: string }
) {
  return request<ShareLinkPayload>("/share-links", {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function revokeShareLink(session: AuthSession, linkId: string) {
  return request<{ status: string }>(`/share-links/${linkId}`, {
    method: "DELETE",
    headers: withAuth(session)
  });
}

export async function resolveShareLink(token: string) {
  return request<ShareResolvePayload>(`/share/${encodeURIComponent(token)}`);
}
