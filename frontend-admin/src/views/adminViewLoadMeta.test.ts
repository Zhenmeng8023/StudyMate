import { describe, expect, it } from "vitest";
import {
  resolveAdminViewLoadPlan,
  shouldPreserveGovernanceRows
} from "./adminViewLoadMeta";

describe("adminViewLoadMeta", () => {
  it("derives the shared load plan for dashboard, moderation, and governance views", () => {
    expect(resolveAdminViewLoadPlan("dashboard")).toEqual({
      kind: "dashboard"
    });

    expect(resolveAdminViewLoadPlan("moderation")).toEqual({
      kind: "moderation"
    });

    expect(resolveAdminViewLoadPlan("users")).toEqual({
      kind: "governance",
      view: "users",
      summaryEndpoint: null
    });

    expect(resolveAdminViewLoadPlan("ai")).toEqual({
      kind: "governance",
      view: "ai",
      summaryEndpoint: "/api/v1/admin/ai/usage"
    });
  });

  it("preserves governance rows only when reloading the same module with existing rows", () => {
    expect(shouldPreserveGovernanceRows("users", "users", 1)).toBe(true);
    expect(shouldPreserveGovernanceRows("users", "users", 0)).toBe(false);
    expect(shouldPreserveGovernanceRows("users", "materials", 3)).toBe(false);
    expect(shouldPreserveGovernanceRows(null, "users", 3)).toBe(false);
  });
});
