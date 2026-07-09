import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminGovernanceModule from "./AdminGovernanceModule.vue";

describe("AdminGovernanceModule", () => {
  it("renders summary cards, records, and emits query and selection changes", async () => {
    const wrapper = mount(AdminGovernanceModule, {
      props: {
        columns: ["id", "action", "status"],
        emptyText: "暂无记录",
        query: "",
        rows: [
          {
            id: "audit-1",
            action: "moderation.approve",
            status: "success"
          }
        ],
        selectedRecord: {
          id: "audit-1",
          action: "moderation.approve",
          status: "success"
        },
        summary: {
          total: 1
        }
      }
    });

    expect(wrapper.text()).toContain("audit-1");
    expect(wrapper.text()).toContain("moderation.approve");

    await wrapper.get('input[placeholder="搜索当前记录"]').setValue("success");
    expect(wrapper.emitted("update:query")?.[0]).toEqual(["success"]);

    await wrapper.get('[data-record-row="audit-1"]').trigger("click");
    expect(wrapper.emitted("selectRecord")?.[0]?.[0]).toMatchObject({ id: "audit-1" });
  });
});
