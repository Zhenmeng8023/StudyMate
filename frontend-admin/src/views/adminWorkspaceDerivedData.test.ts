import { describe, expect, it } from "vitest";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import {
  buildGovernanceStatusOptions,
  buildModerationStatusOptions,
  filterGovernanceRows,
  filterModerationItems,
  splitModerationItems
} from "./adminWorkspaceDerivedData";

describe("adminWorkspaceDerivedData", () => {
  it("splits moderation items by post and material type", () => {
    const result = splitModerationItems([
      { id: "post-1", type: "post", title: "Post", summary: "", authorName: "Alice", status: "pending", createdAt: "", updatedAt: "" },
      { id: "material-1", type: "material", title: "Book", summary: "", authorName: "Bob", status: "approved", createdAt: "", updatedAt: "" }
    ]);

    expect(result.pendingPosts).toHaveLength(1);
    expect(result.pendingMaterials).toHaveLength(1);
    expect(result.pendingPosts[0]?.id).toBe("post-1");
    expect(result.pendingMaterials[0]?.id).toBe("material-1");
  });

  it("filters moderation items and builds shared status options", () => {
    const items = [
      { id: "post-1", type: "post" as const, title: "Pending Post", summary: "Needs review", authorName: "Alice", status: "pending", createdAt: "", updatedAt: "" },
      { id: "material-1", type: "material" as const, title: "Approved Book", summary: "Visible", authorName: "Bob", status: "approved", createdAt: "", updatedAt: "" }
    ];

    expect(filterModerationItems(items, "alice", "all")).toEqual([items[0]]);
    expect(filterModerationItems(items, "", "approved")).toEqual([items[1]]);
    expect(buildModerationStatusOptions(items).map((option) => option.value)).toEqual(["all", "approved", "pending"]);
  });

  it("filters governance rows and builds shared status options", () => {
    const rows: GovernanceRecord[] = [
      { id: "user-1", username: "alice", email: "alice@example.test", role: "student", status: "active" },
      { id: "user-2", username: "bob", email: "bob@example.test", role: "student", status: "disabled" }
    ];

    expect(filterGovernanceRows(rows, "bob", "all")).toEqual([rows[1]]);
    expect(filterGovernanceRows(rows, "", "active")).toEqual([rows[0]]);
    expect(buildGovernanceStatusOptions(rows).map((option) => option.value)).toEqual(["all", "active", "disabled"]);
  });
});
