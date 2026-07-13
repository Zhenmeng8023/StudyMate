import { describe, expect, it } from "vitest";
import {
  resolveGovernanceDataState,
  resolveModerationDataState
} from "./adminViewDataState";

describe("adminViewDataState", () => {
  it("derives the moderation loading, unauthorized, stale, and error states", () => {
    expect(
      resolveModerationDataState({
        errorMessage: "",
        errorStatus: null,
        loading: true,
        rowCount: 0
      })
    ).toEqual({
      kind: "loading",
      title: "正在同步审核队列",
      description: "请稍候，最新待审核内容和状态正在载入。"
    });

    expect(
      resolveModerationDataState({
        errorMessage: "当前账号没有查看审核队列的权限。",
        errorStatus: 403,
        loading: false,
        rowCount: 0
      })
    ).toEqual({
      kind: "unauthorized",
      title: "暂无审核权限",
      description: "当前账号没有查看审核队列的权限。"
    });

    expect(
      resolveModerationDataState({
        errorMessage: "审核队列刷新失败",
        errorStatus: 500,
        loading: false,
        rowCount: 2
      })
    ).toEqual({
      kind: "stale",
      title: "审核队列需要刷新",
      description: "当前显示的是上一次同步结果，请刷新后再继续处理。"
    });

    expect(
      resolveModerationDataState({
        errorMessage: "审核队列刷新失败",
        errorStatus: 500,
        loading: false,
        rowCount: 0
      })
    ).toEqual({
      kind: "error",
      title: "审核队列暂时不可用",
      description: "审核队列刷新失败"
    });
  });

  it("derives the governance loading, unauthorized, conflict, stale, and error states", () => {
    expect(
      resolveGovernanceDataState({
        activeLabel: "用户治理",
        errorMessage: "",
        errorStatus: null,
        loading: true,
        rowCount: 0
      })
    ).toEqual({
      kind: "loading",
      title: "正在同步用户治理",
      description: "请稍候，最新治理记录正在载入。"
    });

    expect(
      resolveGovernanceDataState({
        activeLabel: "用户治理",
        errorMessage: "当前账号没有查看这个治理模块的权限。",
        errorStatus: 403,
        loading: false,
        rowCount: 0
      })
    ).toEqual({
      kind: "unauthorized",
      title: "暂无治理权限",
      description: "当前账号没有查看这个治理模块的权限。"
    });

    expect(
      resolveGovernanceDataState({
        activeLabel: "用户治理",
        errorMessage: "这条记录的状态已经被其他人更新，请先刷新后再决定下一步。",
        errorStatus: 409,
        loading: false,
        rowCount: 1
      })
    ).toEqual({
      kind: "conflict",
      title: "治理动作存在冲突",
      description: "这条记录的状态已经被其他人更新，请先刷新后再决定下一步。"
    });

    expect(
      resolveGovernanceDataState({
        activeLabel: "用户治理",
        errorMessage: "治理记录刷新失败",
        errorStatus: 500,
        loading: false,
        rowCount: 2
      })
    ).toEqual({
      kind: "stale",
      title: "治理记录需要刷新",
      description: "当前显示的是上一次同步结果，请刷新后再继续判断。"
    });

    expect(
      resolveGovernanceDataState({
        activeLabel: "用户治理",
        errorMessage: "治理记录刷新失败",
        errorStatus: 500,
        loading: false,
        rowCount: 0
      })
    ).toEqual({
      kind: "error",
      title: "用户治理暂时不可用",
      description: "治理记录刷新失败"
    });
  });

  it("returns null when no admin data state should be shown", () => {
    expect(
      resolveModerationDataState({
        errorMessage: "",
        errorStatus: null,
        loading: false,
        rowCount: 3
      })
    ).toBeNull();

    expect(
      resolveGovernanceDataState({
        activeLabel: "治理记录",
        errorMessage: "",
        errorStatus: null,
        loading: false,
        rowCount: 4
      })
    ).toBeNull();
  });
});
