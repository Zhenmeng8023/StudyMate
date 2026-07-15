import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import {
  runAdminConfirmDialogHandler,
  type ConfirmDialogHandlerMap,
  type ConfirmDialogKey
} from "./adminConfirmDialogState";
import { buildAdminWorkspaceViewSwitchPlan } from "./adminWorkspaceLifecycle";
import { runAdminWorkspaceViewSwitch } from "./adminWorkspaceViewSwitch";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

interface AdminWorkspaceInteractionAdapterRunners {
  buildViewSwitchPlan: typeof buildAdminWorkspaceViewSwitchPlan;
  runConfirmDialogHandler: typeof runAdminConfirmDialogHandler;
  runViewSwitch: typeof runAdminWorkspaceViewSwitch;
}

export interface CreateAdminWorkspaceInteractionAdapterOptions {
  clearWorkspaceState: (keys?: AdminWorkspaceResetKey[]) => void;
  loadActiveView: (view: AdminRouteKey) => void;
  readLoading: () => boolean;
  resetConfirmHandlers: ConfirmDialogHandlerMap<() => void>;
  runners?: Partial<AdminWorkspaceInteractionAdapterRunners>;
  setActiveView: (view: AdminRouteKey) => void;
  setSelectedRecord: (record: GovernanceRecord) => void;
  submitConfirmHandlers: ConfirmDialogHandlerMap<() => Promise<void>>;
  syncLocation: (view: AdminRouteKey, syncMode: "push" | "replace") => void;
}

export function createAdminWorkspaceInteractionAdapter(
  options: CreateAdminWorkspaceInteractionAdapterOptions
) {
  const runners: AdminWorkspaceInteractionAdapterRunners = {
    buildViewSwitchPlan:
      options.runners?.buildViewSwitchPlan ?? buildAdminWorkspaceViewSwitchPlan,
    runConfirmDialogHandler:
      options.runners?.runConfirmDialogHandler ?? runAdminConfirmDialogHandler,
    runViewSwitch: options.runners?.runViewSwitch ?? runAdminWorkspaceViewSwitch
  };

  return {
    cancelConfirmDialog(key: ConfirmDialogKey) {
      if (options.readLoading()) return;
      runners.runConfirmDialogHandler(key, options.resetConfirmHandlers);
    },
    confirmDialog(key: ConfirmDialogKey) {
      return runners.runConfirmDialogHandler(key, options.submitConfirmHandlers);
    },
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
