import { buildApiPath } from "@studymate/api-client";
import { request, withAuth } from "./core";
import type { AuthSession, SearchResponsePayload } from "./types";

export async function searchAll(
  session: AuthSession | null,
  input: { query: string; types?: string[]; limit?: number; offset?: number }
) {
  return request<SearchResponsePayload>(buildApiPath("/search", {
    q: input.query,
    types: input.types,
    limit: input.limit,
    offset: input.offset
  }), {
    headers: withAuth(session)
  });
}
