import type { GraphWorkspaceResourceTab } from "../../components/GraphWorkspaceShell";
import type { GraphInspectorTab } from "../../components/GraphWorkspaceCanvasChrome";

export type GraphPanelPlan = {
  inspectorOpen?: boolean;
  inspectorTab?: GraphInspectorTab;
  resourcePanelOpen?: boolean;
  resourceTab?: GraphWorkspaceResourceTab;
};

export function shouldUseGraphOverlayDock(width: number | null | undefined) {
  return typeof width === "number" && width < 1600;
}

export function buildGraphSelectionPanelPlan(input: {
  hasSelection: boolean;
  overlayDock: boolean;
  resourcePanelOpen: boolean;
}): GraphPanelPlan {
  if (!input.hasSelection) {
    return {};
  }
  return {
    inspectorOpen: true,
    inspectorTab: "selection",
    resourcePanelOpen: input.overlayDock ? false : input.resourcePanelOpen
  };
}

export function buildGraphConflictPanelPlan(input: {
  dirty: boolean;
  inspectorTab: GraphInspectorTab;
  overlayDock: boolean;
  reloadLatestSuggested: boolean;
  resourcePanelOpen: boolean;
}): GraphPanelPlan {
  const hasConflict = input.reloadLatestSuggested && input.dirty;
  if (hasConflict) {
    return {
      inspectorOpen: true,
      inspectorTab: "conflict",
      resourcePanelOpen: input.overlayDock ? false : input.resourcePanelOpen
    };
  }
  if (input.inspectorTab === "conflict") {
    return { inspectorTab: "overview" };
  }
  return {};
}

export function buildGraphResourceTabPlan(input: {
  overlayDock: boolean;
  tab: GraphWorkspaceResourceTab;
}): GraphPanelPlan {
  return {
    inspectorOpen: input.overlayDock ? false : undefined,
    resourcePanelOpen: true,
    resourceTab: input.tab
  };
}

export function buildGraphInspectorTabPlan(input: {
  overlayDock: boolean;
  resourcePanelOpen: boolean;
  tab: GraphInspectorTab;
}): GraphPanelPlan {
  return {
    inspectorOpen: true,
    inspectorTab: input.tab,
    resourcePanelOpen: input.overlayDock ? false : input.resourcePanelOpen
  };
}

export function buildGraphPanelTogglePlan(input: {
  inspectorOpen: boolean;
  overlayDock: boolean;
  panel: "inspector" | "resources";
  resourcePanelOpen: boolean;
}): GraphPanelPlan {
  if (input.panel === "resources") {
    const nextResourcePanelOpen = !input.resourcePanelOpen;
    return {
      inspectorOpen: nextResourcePanelOpen && input.overlayDock ? false : input.inspectorOpen,
      resourcePanelOpen: nextResourcePanelOpen
    };
  }

  const nextInspectorOpen = !input.inspectorOpen;
  return {
    inspectorOpen: nextInspectorOpen,
    resourcePanelOpen: nextInspectorOpen && input.overlayDock ? false : input.resourcePanelOpen
  };
}
