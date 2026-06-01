import { request, withAuth } from "./core";
import type { AuthSession, SearchResponsePayload } from "./types";

export async function searchAll(
  session: AuthSession | null,
  input: { query: string; types?: string[]; limit?: number }
) {
  const params = new URLSearchParams();
  params.set("q", input.query);
  if (input.types?.length) {
    params.set("types", input.types.join(","));
  }
  if (input.limit) {
    params.set("limit", String(input.limit));
  }

  return request<SearchResponsePayload>(`/search?${params.toString()}`, {
    headers: withAuth(session)
  });
}
