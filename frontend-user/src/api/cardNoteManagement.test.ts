import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteCard, getCardNote, listCardNotes } from "./review";
import type { AuthSession } from "./types";

const session: AuthSession = { accessToken: "access-token", refreshToken: "refresh-token", accessTokenExpiresAt: "", user: { id: "u1", username: "user", email: "user@example.test", displayName: "User", role: "student" } };
afterEach(() => vi.restoreAllMocks());
function mockFetch() {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true, data: [] }), { status: 200, headers: { "Content-Type": "application/json" } }));
}
describe("CardNote management API", () => {
  it("encodes concrete source filters without interpolating query input", async () => {
    const fetch = mockFetch();
    await listCardNotes(session, { sourceType: "note", sourceId: "id & more" });
    expect(fetch.mock.calls[0][0]).toBe("/api/v1/card-notes?sourceType=note&sourceId=id+%26+more");
  });
  it("loads one note with authorization", async () => {
    const fetch = mockFetch();
    await getCardNote(session, "note-1");
    expect(fetch.mock.calls[0][0]).toBe("/api/v1/card-notes/note-1");
    expect(fetch.mock.calls[0][1]?.headers).toMatchObject({ Authorization: "Bearer access-token" });
  });
  it("deletes a card only with explicit history confirmation", async () => {
    const fetch = mockFetch();
    await deleteCard(session, "card-1", { confirmDeleteHistory: true });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/v1/cards/card-1");
    expect(init?.method).toBe("DELETE");
    expect(JSON.parse(String(init?.body))).toEqual({ confirmDeleteHistory: true });
  });
});
