import type { SessionInvalidationState } from "@studymate/api-client";
import type { AdminAuthUser } from "../api/sessionStore";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import type { ConfirmDialogKey } from "./adminConfirmDialogState";
import { createAdminWorkspaceChromeAdapter } from "./adminWorkspaceChromeAdapter";
import type { AdminConfirmDialogItem } from "./adminConfirmDialogs";
import type { AdminOverviewPayload } from "./adminOverviewCards";
import { createAdminWorkspaceModuleAdapter } from "./adminWorkspaceModuleAdapter";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";

interface AdminWorkspaceConfirmSurface {
  buildDialogs: () => AdminConfirmDialogItem[];
  cancelDialog: (key: ConfirmDialogKey) => void;
  confirmDialog: (key: ConfirmDialogKey) => Promise<void>;
}

interface AdminWorkspaceInteractionSurface {
  selectRecord: (record: GovernanceRecord) => void;
  switchView: (view: AdminRouteKey) => void;
}

export interface CreateAdminWorkspaceSurfaceAdapterOptions {
  activeView: AdminRouteKey;
  errorMessage: string;
  formLogin: string;
  formPassword: string;
  governanceErrorStatus: number | null;
  governanceQuery: string;
  governanceRows: GovernanceRecord[];
  governanceStatusFilter: string;
  governanceSummary: GovernanceRecord | null;
  initialNotice: string;
  loading: boolean;
  loggedIn: boolean;
  moderationErrorStatus: number | null;
  moderationItems: AdminWorkspaceModerationItem[];
  moderationQuery: string;
  moderationStatusFilter: string;
  notice: string;
  overview: AdminOverviewPayload | null;
  profile: AdminAuthUser | null;
  requestGovernanceAction: (payload: { action: string; record: GovernanceRecord }) => void;
  requestModerationAction: (
    item: AdminWorkspaceModerationItem,
    action: "approve" | "reject" | "hide"
  ) => void;
  selectedRecord: GovernanceRecord | null;
  sessionInvalidation: SessionInvalidationState | null;
  setGovernanceQuery: (value: string) => void;
  setGovernanceStatusFilter: (value: string) => void;
  setLoginValue: (value: string) => void;
  setModerationQuery: (value: string) => void;
  setModerationStatusFilter: (value: string) => void;
  setPasswordValue: (value: string) => void;
  workspaceActions: {
    login: () => Promise<void> | void;
    logout: () => Promise<void> | void;
    refreshActiveView: () => Promise<void> | void;
  };
  workspaceConfirm: AdminWorkspaceConfirmSurface;
  workspaceInteractions: AdminWorkspaceInteractionSurface;
}

export function createAdminWorkspaceSurfaceAdapter(options: CreateAdminWorkspaceSurfaceAdapterOptions) {
  const loggedIn = options.loggedIn;
  const confirmDialogs = options.workspaceConfirm.buildDialogs();
  const chromeBindings = createAdminWorkspaceChromeAdapter({
    activeView: options.activeView,
    errorMessage: options.errorMessage,
    formLogin: options.formLogin,
    formPassword: options.formPassword,
    governanceRowCount: options.governanceRows.length,
    initialNotice: options.initialNotice,
    loading: options.loading,
    loggedIn,
    moderationItemCount: options.moderationItems.length,
    notice: options.notice,
    onLogin: () => options.workspaceActions.login(),
    onLogout: () => options.workspaceActions.logout(),
    onRefreshActiveView: () => options.workspaceActions.refreshActiveView(),
    onSwitchView: options.workspaceInteractions.switchView,
    profile: options.profile,
    sessionInvalidation: options.sessionInvalidation,
    setLoginValue: options.setLoginValue,
    setPasswordValue: options.setPasswordValue
  });
  const moduleBindings = createAdminWorkspaceModuleAdapter({
    activeLabel: chromeBindings.shellProps.activeTitle,
    activeView: options.activeView,
    errorMessage: options.errorMessage,
    governanceErrorStatus: options.governanceErrorStatus,
    governanceQuery: options.governanceQuery,
    governanceRows: options.governanceRows,
    governanceStatusFilter: options.governanceStatusFilter,
    governanceSummary: options.governanceSummary,
    loading: options.loading,
    moderationErrorStatus: options.moderationErrorStatus,
    moderationItems: options.moderationItems,
    moderationQuery: options.moderationQuery,
    moderationStatusFilter: options.moderationStatusFilter,
    overview: options.overview,
    requestGovernanceAction: options.requestGovernanceAction,
    requestModerationAction: options.requestModerationAction,
    selectedRecord: options.selectedRecord,
    selectRecord: options.workspaceInteractions.selectRecord,
    setGovernanceQuery: options.setGovernanceQuery,
    setGovernanceStatusFilter: options.setGovernanceStatusFilter,
    setModerationQuery: options.setModerationQuery,
    setModerationStatusFilter: options.setModerationStatusFilter,
    switchView: options.workspaceInteractions.switchView
  });

  return {
    cancelConfirmDialog: options.workspaceConfirm.cancelDialog,
    confirmConfirmDialog: options.workspaceConfirm.confirmDialog,
    confirmDialogs,
    loggedIn,
    loginPanelEvents: chromeBindings.loginPanelEvents,
    loginPanelProps: chromeBindings.loginPanelProps,
    moduleEvents: moduleBindings.moduleEvents,
    moduleProps: moduleBindings.moduleProps,
    shellEvents: chromeBindings.shellEvents,
    shellProps: chromeBindings.shellProps
  };
}
