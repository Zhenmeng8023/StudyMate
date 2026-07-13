import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type {
  ConfirmDialogHandlerMap
} from "./adminConfirmDialogState";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";

type PendingModerationAction = { action: "approve" | "reject" | "hide"; item: AdminWorkspaceModerationItem } | null;
type PendingReportAction = { action: "resolve" | "dismiss"; record: GovernanceRecord } | null;
type PendingUserAction = { action: "disable" | "activate"; record: GovernanceRecord } | null;
type PendingAITaskAction = { action: "retry" | "cancel"; record: GovernanceRecord } | null;
type PendingTemplateAction = { action: "publish" | "unpublish"; record: GovernanceRecord } | null;

export function buildAdminWorkspaceConfirmResetHandlers(options: {
  setAITaskAction: (value: PendingAITaskAction) => void;
  setAITaskError: (value: string) => void;
  setModerationAction: (value: PendingModerationAction) => void;
  setModerationError: (value: string) => void;
  setReportAction: (value: PendingReportAction) => void;
  setReportError: (value: string) => void;
  setTemplateAction: (value: PendingTemplateAction) => void;
  setTemplateError: (value: string) => void;
  setUserAction: (value: PendingUserAction) => void;
  setUserError: (value: string) => void;
}): ConfirmDialogHandlerMap<() => void> {
  return {
    moderation: () => {
      options.setModerationAction(null);
      options.setModerationError("");
    },
    report: () => {
      options.setReportAction(null);
      options.setReportError("");
    },
    user: () => {
      options.setUserAction(null);
      options.setUserError("");
    },
    aiTask: () => {
      options.setAITaskAction(null);
      options.setAITaskError("");
    },
    template: () => {
      options.setTemplateAction(null);
      options.setTemplateError("");
    }
  };
}

export function buildAdminWorkspaceConfirmSubmitHandlers(options: {
  applyAITaskAction: (record: GovernanceRecord, action: "retry" | "cancel") => Promise<void> | void;
  applyModerationAction: (
    item: AdminWorkspaceModerationItem,
    action: "approve" | "reject" | "hide"
  ) => Promise<void> | void;
  applyReportAction: (record: GovernanceRecord, action: "resolve" | "dismiss") => Promise<void> | void;
  applyTemplateAction: (record: GovernanceRecord, action: "publish" | "unpublish") => Promise<void> | void;
  applyUserAction: (record: GovernanceRecord, action: "disable" | "activate") => Promise<void> | void;
  readAITaskAction: () => PendingAITaskAction;
  readModerationAction: () => PendingModerationAction;
  readReportAction: () => PendingReportAction;
  readTemplateAction: () => PendingTemplateAction;
  readUserAction: () => PendingUserAction;
}): ConfirmDialogHandlerMap<() => Promise<void>> {
  return {
    moderation: async () => {
      const pending = options.readModerationAction();
      if (!pending) return;
      await options.applyModerationAction(pending.item, pending.action);
    },
    report: async () => {
      const pending = options.readReportAction();
      if (!pending) return;
      await options.applyReportAction(pending.record, pending.action);
    },
    user: async () => {
      const pending = options.readUserAction();
      if (!pending) return;
      await options.applyUserAction(pending.record, pending.action);
    },
    aiTask: async () => {
      const pending = options.readAITaskAction();
      if (!pending) return;
      await options.applyAITaskAction(pending.record, pending.action);
    },
    template: async () => {
      const pending = options.readTemplateAction();
      if (!pending) return;
      await options.applyTemplateAction(pending.record, pending.action);
    }
  };
}
