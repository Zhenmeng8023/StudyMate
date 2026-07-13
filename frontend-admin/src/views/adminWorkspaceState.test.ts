import { describe, expect, it, vi } from "vitest";
import {
  adminWorkspaceResetKeys,
  resetAdminWorkspaceState,
  type AdminWorkspaceResetKey
} from "./adminWorkspaceState";

describe("adminWorkspaceState", () => {
  it("resets the shared workspace state through the canonical key order", () => {
    const calls: AdminWorkspaceResetKey[] = [];
    const handlers = {
      queries: vi.fn(() => calls.push("queries")),
      filters: vi.fn(() => calls.push("filters")),
      moderationData: vi.fn(() => calls.push("moderationData")),
      governanceData: vi.fn(() => calls.push("governanceData")),
      confirmState: vi.fn(() => calls.push("confirmState"))
    };

    resetAdminWorkspaceState(handlers);

    expect(adminWorkspaceResetKeys).toEqual([
      "queries",
      "filters",
      "moderationData",
      "governanceData",
      "confirmState"
    ]);
    expect(calls).toEqual(adminWorkspaceResetKeys);
  });

  it("supports resetting only the requested workspace slices", () => {
    const calls: AdminWorkspaceResetKey[] = [];
    const handlers = {
      queries: vi.fn(() => calls.push("queries")),
      filters: vi.fn(() => calls.push("filters")),
      moderationData: vi.fn(() => calls.push("moderationData")),
      governanceData: vi.fn(() => calls.push("governanceData")),
      confirmState: vi.fn(() => calls.push("confirmState"))
    };

    resetAdminWorkspaceState(handlers, ["queries", "confirmState"]);

    expect(calls).toEqual(["queries", "confirmState"]);
    expect(handlers.filters).not.toHaveBeenCalled();
    expect(handlers.moderationData).not.toHaveBeenCalled();
    expect(handlers.governanceData).not.toHaveBeenCalled();
  });
});
