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
    expect(wrapper.get('input[placeholder="搜索当前记录"]').classes()).toContain("ds-input");

    await wrapper.get('input[placeholder="搜索当前记录"]').setValue("success");
    expect(wrapper.emitted("update:query")?.[0]).toEqual(["success"]);

    await wrapper.get('[data-record-row="audit-1"]').trigger("click");
    expect(wrapper.emitted("selectRecord")?.[0]?.[0]).toMatchObject({ id: "audit-1" });
  });

  it("renders governance actions for the selected record and emits action requests", async () => {
    const selectedRecord = {
      id: "report-1",
      targetType: "post",
      status: "pending"
    };

    const wrapper = mount(AdminGovernanceModule, {
      props: {
        actions: [
          { key: "resolve", label: "标记已处理" },
          { key: "dismiss", label: "忽略举报", tone: "danger" }
        ],
        columns: ["id", "status"],
        emptyText: "暂无举报记录",
        query: "",
        rows: [selectedRecord],
        selectedRecord,
        summary: null
      }
    });

    expect(wrapper.get('[data-governance-action="resolve"]').text()).toContain("标记已处理");
    expect(wrapper.get('[data-governance-action="dismiss"]').text()).toContain("忽略举报");
    expect(wrapper.get('[data-governance-action="dismiss"]').classes()).toContain("danger");

    await wrapper.get('[data-governance-action="resolve"]').trigger("click");

    expect(wrapper.emitted("requestAction")?.[0]?.[0]).toEqual({
      action: "resolve",
      record: selectedRecord
    });
  });

  it("renders the shared error state before governance data is available", () => {
    const wrapper = mount(AdminGovernanceModule, {
      props: {
        columns: ["id", "status"],
        dataState: {
          kind: "error",
          title: "治理记录暂时不可用",
          description: "读取治理模块失败"
        },
        emptyText: "暂无举报记录",
        query: "",
        rows: [],
        selectedRecord: null,
        summary: null
      }
    });

    expect(wrapper.text()).toContain("暂时不可用");
    expect(wrapper.text()).toContain("治理记录暂时不可用");
    expect(wrapper.text()).not.toContain("当前模块已接入真实 API，但没有可显示的数据。");
  });

  it("keeps rendering existing governance rows while surfacing the shared stale state", () => {
    const selectedRecord = {
      id: "audit-1",
      action: "moderation.approve",
      status: "success"
    };

    const wrapper = mount(AdminGovernanceModule, {
      props: {
        columns: ["id", "action", "status"],
        dataState: {
          kind: "stale",
          title: "治理记录需要刷新",
          description: "当前显示的是上一次同步结果，请刷新后再继续判断。"
        },
        emptyText: "暂无记录",
        query: "",
        rows: [selectedRecord],
        selectedRecord,
        summary: null
      }
    });

    expect(wrapper.text()).toContain("需要刷新");
    expect(wrapper.text()).toContain("治理记录需要刷新");
    expect(wrapper.text()).toContain("audit-1");
    expect(wrapper.find('[data-record-row="audit-1"]').exists()).toBe(true);
  });

  it("keeps rendering existing governance rows while surfacing the shared conflict state", () => {
    const selectedRecord = {
      id: "audit-1",
      action: "moderation.approve",
      status: "success"
    };

    const wrapper = mount(AdminGovernanceModule, {
      props: {
        columns: ["id", "action", "status"],
        dataState: {
          kind: "conflict",
          title: "治理动作存在冲突",
          description: "这条记录的状态已经被其他人更新，请先刷新后再决定下一步。"
        },
        emptyText: "暂无记录",
        query: "",
        rows: [selectedRecord],
        selectedRecord,
        summary: null
      }
    });

    expect(wrapper.text()).toContain("存在冲突");
    expect(wrapper.text()).toContain("治理动作存在冲突");
    expect(wrapper.text()).toContain("audit-1");
    expect(wrapper.find('[data-record-row="audit-1"]').exists()).toBe(true);
  });

  it("hides governance rows when the shared unauthorized state is active", () => {
    const wrapper = mount(AdminGovernanceModule, {
      props: {
        columns: ["id", "action", "status"],
        dataState: {
          kind: "unauthorized",
          title: "暂无治理权限",
          description: "当前账号没有查看这个治理模块的权限。"
        },
        emptyText: "暂无记录",
        query: "",
        rows: [
          {
            id: "audit-1",
            action: "moderation.approve",
            status: "success"
          }
        ],
        selectedRecord: null,
        summary: null
      }
    });

    expect(wrapper.text()).toContain("需要登录");
    expect(wrapper.text()).toContain("暂无治理权限");
    expect(wrapper.text()).not.toContain("audit-1");
    expect(wrapper.find('[data-record-row="audit-1"]').exists()).toBe(false);
  });
});
