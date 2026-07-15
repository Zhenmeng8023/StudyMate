import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import { buildAdminWorkspaceViewSwitchPlan } from "./adminWorkspaceLifecycle";
import { runAdminWorkspaceViewSwitch } from "./adminWorkspaceViewSwitch";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

interface AdminWorkspaceInteractionAdapterRunners {
  buildViewSwitchPlan: typeof buildAdminWorkspaceViewSwitchPlan;
  runViewSwitch: typeof runAdminWorkspaceViewSwitch;
}

export interface CreateAdminWorkspaceInteractionAdapterOptions {
  clearWorkspaceState: (keys?: AdminWorkspaceResetKey[]) => void;
  loadActiveView: (view: AdminRouteKey) => void;
  runners?: Partial<AdminWorkspaceInteractionAdapterRunners>;
  setActiveView: (view: AdminRouteKey) => void;
  setSelectedRecord: (record: GovernanceRecord) => void;
  syncLocation: (view: AdminRouteKey, syncMode: "push" | "replace") => void;
}

export function createAdminWorkspaceInteractionAdapter(
  options: CreateAdminWorkspaceInteractionAdapterOptions
) {
  const runners: AdminWorkspaceInteractionAdapterRunners = {
    buildViewSwitchPlan: options.runners?.buildViewSwitchPlan ?? buildAdminWorkspaceViewSwitchPlan,
    runViewSwitch: options.runners?.runViewSwitch ?? runAdminWorkspaceViewSwitch
  };

  return {
    selectRecord(record: GovernanceRecord) {
      options.setSelectedRecord(record);
    },
    switchView(view: AdminRouteKey) {
      const plan = runners.buildViewSwitchPlan(view);
      runners.runViewSwitch(plan, {
        clearWorkspaceState: options.clearWorkspaceState,
        loadActiveView: options.loadActiveView,
        setActiveView: options.setActiveView,
        syncLocation: options.syncLocation
      });
    }
  };
}
