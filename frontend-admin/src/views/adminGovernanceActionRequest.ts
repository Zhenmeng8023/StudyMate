import type {
  GovernanceActionDispatch,
  GovernanceModerationItem
} from "./adminGovernanceConfig";
import type { GovernanceRecord } from "../components/admin/governanceRecord";

export function runAdminGovernanceActionRequest(
  dispatch: GovernanceActionDispatch,
  options: {
    clearAITaskError: () => void;
    clearReportError: () => void;
    clearTemplateError: () => void;
    clearUserError: () => void;
    invalidFallbackMessage: string;
    requestModerationAction: (
      item: GovernanceModerationItem,
      action: "approve" | "reject" | "hide"
    ) => void;
    setAITaskAction: (value: { action: "retry" | "cancel"; record: GovernanceRecord }) => void;
    setError: (message: string) => void;
    setReportAction: (value: { action: "resolve" | "dismiss"; record: GovernanceRecord }) => void;
    setTemplateAction: (value: { action: "publish" | "unpublish"; record: GovernanceRecord }) => void;
    setUserAction: (value: { action: "disable" | "activate"; record: GovernanceRecord }) => void;
  }
) {
  const {
    clearAITaskError,
    clearReportError,
    clearTemplateError,
    clearUserError,
    invalidFallbackMessage,
    requestModerationAction,
    setAITaskAction,
    setError,
    setReportAction,
    setTemplateAction,
    setUserAction
  } = options;

  switch (dispatch.kind) {
    case "report":
      clearReportError();
      setReportAction({
        action: dispatch.action,
        record: dispatch.record
      });
      return;
    case "moderation":
      requestModerationAction(dispatch.item, dispatch.action);
      return;
    case "user":
      clearUserError();
      setUserAction({
        action: dispatch.action,
        record: dispatch.record
      });
      return;
    case "aiTask":
      clearAITaskError();
      setAITaskAction({
        action: dispatch.action,
        record: dispatch.record
      });
      return;
    case "template":
      clearTemplateError();
      setTemplateAction({
        action: dispatch.action,
        record: dispatch.record
      });
      return;
    case "invalid":
      setError(dispatch.message ?? invalidFallbackMessage);
      return;
    case "noop":
      return;
  }
}
