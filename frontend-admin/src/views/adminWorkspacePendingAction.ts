import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import { runAdminGovernanceActionRequest } from "./adminGovernanceActionRequest";
import {
  resolveGovernanceActionDispatch,
  type GovernanceActionPayload,
} from "./adminGovernanceConfig";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";

export function requestAdminWorkspaceModerationAction(
  item: AdminWorkspaceModerationItem,
  action: "approve" | "reject" | "hide",
  options: {
    setModerationAction: (
      value: { action: "approve" | "reject" | "hide"; item: AdminWorkspaceModerationItem } | null
    ) => void;
    setModerationError: (value: string) => void;
  }
) {
  options.setModerationError("");
  options.setModerationAction({ action, item });
}

export function requestAdminWorkspaceGovernanceAction(
  activeView: AdminRouteKey,
  payload: GovernanceActionPayload,
  options: {
    clearAITaskError: () => void;
    clearReportError: () => void;
    clearTemplateError: () => void;
    clearUserError: () => void;
    invalidFallbackMessage: string;
    requestModerationAction: (
      item: AdminWorkspaceModerationItem,
      action: "approve" | "reject" | "hide"
    ) => void;
    setAITaskAction: (
      value: { action: "retry" | "cancel"; record: GovernanceRecord } | null
    ) => void;
    setError: (message: string) => void;
    setReportAction: (
      value: { action: "resolve" | "dismiss"; record: GovernanceRecord } | null
    ) => void;
    setTemplateAction: (
      value: { action: "publish" | "unpublish"; record: GovernanceRecord } | null
    ) => void;
    setUserAction: (
      value: { action: "disable" | "activate"; record: GovernanceRecord } | null
    ) => void;
  }
) {
  const dispatch = resolveGovernanceActionDispatch(activeView, payload);

  runAdminGovernanceActionRequest(dispatch, {
    clearAITaskError: options.clearAITaskError,
    clearReportError: options.clearReportError,
    clearTemplateError: options.clearTemplateError,
    clearUserError: options.clearUserError,
    invalidFallbackMessage: options.invalidFallbackMessage,
    requestModerationAction: options.requestModerationAction,
    setAITaskAction: (value) => {
      options.setAITaskAction(value);
    },
    setError: options.setError,
    setReportAction: (value) => {
      options.setReportAction(value);
    },
    setTemplateAction: (value) => {
      options.setTemplateAction(value);
    },
    setUserAction: (value) => {
      options.setUserAction(value);
    }
  });
}
