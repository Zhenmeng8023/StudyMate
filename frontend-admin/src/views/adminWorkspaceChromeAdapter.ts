import type { SessionInvalidationState } from "@studymate/api-client";
import { getSessionInvalidationPrompt } from "@studymate/api-client";
import type { AdminAuthUser } from "../api/sessionStore";
import type { AdminRouteKey } from "../router";
import { getGovernanceModuleConfig } from "./adminGovernanceConfig";
import { buildAdminWorkspaceLoginPanelEvents } from "./adminWorkspaceLoginPanelEvents";
import { buildAdminWorkspaceLoginPanelProps } from "./adminWorkspaceLoginPanelProps";
import { buildAdminWorkspaceShellEvents } from "./adminWorkspaceShellEvents";
import { buildAdminWorkspaceShellProps } from "./adminWorkspaceShellProps";
import {
  buildAdminNavItems,
  getAdminActiveCountLabel,
  getAdminViewDescription,
  groupAdminNavItems
} from "./adminViewMeta";

export interface CreateAdminWorkspaceChromeAdapterOptions {
  activeView: AdminRouteKey;
  errorMessage: string;
  formLogin: string;
  formPassword: string;
  governanceRowCount: number;
  initialNotice: string;
  loading: boolean;
  loggedIn: boolean;
  moderationItemCount: number;
  notice: string;
  onLogin: () => void | Promise<void>;
  onLogout: () => void;
  onRefreshActiveView: () => void;
  onSwitchView: (view: AdminRouteKey) => void;
  profile: AdminAuthUser | null;
  sessionInvalidation: SessionInvalidationState | null;
  setLoginValue: (value: string) => void;
  setPasswordValue: (value: string) => void;
}

export function createAdminWorkspaceChromeAdapter(
  options: CreateAdminWorkspaceChromeAdapterOptions
) {
  const navItems = buildAdminNavItems(options.moderationItemCount);
  const navGroups = groupAdminNavItems(navItems);
  const activeMeta = navItems.find((item) => item.key === options.activeView) ?? navItems[0];
  const activeDescription = getAdminViewDescription(
    options.activeView,
    getGovernanceModuleConfig(options.activeView)?.description ?? ""
  );
  const countLabel = getAdminActiveCountLabel(
    options.activeView,
    options.moderationItemCount,
    options.governanceRowCount
  );
  const loginPrompt = getSessionInvalidationPrompt(options.sessionInvalidation, "admin");
  const loginNotice =
    options.loggedIn || loginPrompt || options.notice === options.initialNotice
      ? ""
      : options.notice;
  const profileInitial = options.profile?.displayName?.trim().slice(0, 1) || "A";

  return {
    loginPanelEvents: buildAdminWorkspaceLoginPanelEvents({
      login: options.onLogin,
      setLoginValue: options.setLoginValue,
      setPasswordValue: options.setPasswordValue
    }),
    loginPanelProps: buildAdminWorkspaceLoginPanelProps({
      errorMessage: options.errorMessage,
      loading: options.loading,
      loginPrompt,
      loginValue: options.formLogin,
      notice: loginNotice,
      passwordValue: options.formPassword
    }),
    shellEvents: buildAdminWorkspaceShellEvents({
      logout: options.onLogout,
      refreshActiveView: options.onRefreshActiveView,
      switchView: options.onSwitchView
    }),
    shellProps: buildAdminWorkspaceShellProps({
      activeDescription,
      activeGroup: activeMeta.group,
      activeTitle: activeMeta.label,
      activeView: options.activeView,
      countLabel,
      errorMessage: options.errorMessage,
      loading: options.loading,
      navGroups,
      notice: options.notice,
      profile: options.profile,
      profileInitial
    })
  };
}
