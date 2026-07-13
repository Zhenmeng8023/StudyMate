import { describe, expect, it } from "vitest";
import { buildStatusFilterOptions, filterCollectionByStatusAndQuery } from "./adminModuleFilters";

describe("adminModuleFilters", () => {
  it("builds a shared all-status option plus unique normalized status choices", () => {
    const options = buildStatusFilterOptions(
      [
        { status: "pending" },
        { status: " approved " },
        { status: "pending" },
        { status: "" }
      ],
      (item) => item.status
    );

    expect(options).toEqual([
      { label: "全部状态", value: "all" },
      { label: "pending", value: "pending" },
      { label: "approved", value: "approved" }
    ]);
  });

  it("filters a collection by shared status and keyword query rules", () => {
    const rows = [
      { status: "pending", title: "待审帖子", author: "Alice", kind: "post" },
      { status: "approved", title: "线性代数", author: "Bob", kind: "material" },
      { status: "pending", title: "积分技巧", author: "Carol", kind: "material" }
    ];

    const filtered = filterCollectionByStatusAndQuery(rows, {
      getStatus: (item) => item.status,
      query: "carol material",
      statusFilter: "pending",
      toSearchText: (item) => [item.title, item.author, item.kind, item.status].join(" ")
    });

    expect(filtered).toEqual([
      { status: "pending", title: "积分技巧", author: "Carol", kind: "material" }
    ]);
  });
});
