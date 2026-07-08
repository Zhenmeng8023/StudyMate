import { describe, expect, it } from "vitest";
import { dataStateKinds, getDataStateLabel } from "./index";

describe("@studymate/ui data state contract", () => {
  it("exposes the shared state kinds in a stable order", () => {
    expect(dataStateKinds).toEqual(["empty", "error", "loading", "stale", "unauthorized", "conflict"]);
  });

  it("returns readable labels for shared page states", () => {
    expect(getDataStateLabel("loading")).toBe("加载中");
    expect(getDataStateLabel("stale")).toBe("需要刷新");
    expect(getDataStateLabel("conflict")).toBe("存在冲突");
  });
});
