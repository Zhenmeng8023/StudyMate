import { describe, expect, it } from "vitest";
import {
  buildGraphConflictPanelPlan,
  buildGraphInspectorTabPlan,
  buildGraphPanelTogglePlan,
  buildGraphSelectionPanelPlan
} from "./graphPanelCommands";

describe("graphPanelCommands", () => {
  it("opens selection inspector and closes resources on overlay docks", () => {
    expect(
      buildGraphSelectionPanelPlan({
        hasSelection: true,
        overlayDock: true,
        resourcePanelOpen: true
      })
    ).toEqual({
      inspectorOpen: true,
      inspectorTab: "selection",
      resourcePanelOpen: false
    });
  });

  it("opens conflict inspector only while the dirty reload suggestion is active", () => {
    expect(
      buildGraphConflictPanelPlan({
        dirty: true,
        inspectorTab: "overview",
        overlayDock: true,
        reloadLatestSuggested: true,
        resourcePanelOpen: true
      })
    ).toMatchObject({
      inspectorOpen: true,
      inspectorTab: "conflict",
      resourcePanelOpen: false
    });

    expect(
      buildGraphConflictPanelPlan({
        dirty: false,
        inspectorTab: "conflict",
        overlayDock: false,
        reloadLatestSuggested: true,
        resourcePanelOpen: false
      })
    ).toEqual({ inspectorTab: "overview" });
  });

  it("keeps resource and inspector docks mutually exclusive on narrow layouts", () => {
    expect(
      buildGraphPanelTogglePlan({
        inspectorOpen: true,
        overlayDock: true,
        panel: "resources",
        resourcePanelOpen: false
      })
    ).toEqual({
      inspectorOpen: false,
      resourcePanelOpen: true
    });

    expect(
      buildGraphInspectorTabPlan({
        overlayDock: true,
        resourcePanelOpen: true,
        tab: "history"
      })
    ).toEqual({
      inspectorOpen: true,
      inspectorTab: "history",
      resourcePanelOpen: false
    });
  });
});
