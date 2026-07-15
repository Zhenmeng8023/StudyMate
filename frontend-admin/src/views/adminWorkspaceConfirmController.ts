import type { GovernanceRecord } from "../components/admin/governanceRecord";
import {
  resetAdminConfirmDialogState,
  type ConfirmDialogHandlerMap
} from "./adminConfirmDialogState";
import { buildAdminWorkspaceConfirmDialogs } from "./adminWorkspaceConfirmDialogs";
import {
  buildAdminWorkspaceConfirmResetHandlers,
  buildAdminWorkspaceConfirmSubmitHandlers
} from "./adminWorkspaceConfirmState";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";

type PendingModerationAction = { action: "approve" | "reject" | "hide"; item: AdminWorkspaceModerationItem } | null;
type PendingReportAction = { action: "resolve" | "dismiss"; record: GovernanceRecord } | null;
type PendingUserAction = { action: "disable" | "activate"; record: GovernanceRecord } | null;
type PendingAITaskAction = { action: "retry" | "cancel"; record: GovernanceRecord } | null;
type PendingTemplateAction = { action: "publish" | "unpublish"; record: GovernanceRecord } | null;

export interface CreateAdminWorkspaceConfirmControllerOptions {
  applyAITaskAction: (record: GovernanceRecord, action: "retry" | "cancel") => Promise<void> | void;
  applyModerationAction: (
    item: AdminWorkspaceModerationItem,
    action: "approve" | "reject" | "hide"
  ) => Promise<void> | void;
  applyReportAction: (record: GovernanceRecord, action: "resolve" | "dismiss") => Promise<void> | void;
  applyTemplateAction: (record: GovernanceRecord, action: "publish" | "unpublish") => Promise<void> | void;
  applyUserAction: (record: GovernanceRecord, action: "disable" | "activate") => Promise<void> | void;
  readAITaskAction: () => PendingAITaskAction;
  readAITaskError: () => string;
  readLoading: () => boolean;
  readModerationAction: () => PendingModerationAction;
  readModerationError: () => string;
  readReportAction: () => PendingReportAction;
  readReportError: () => string;
  readTemplateAction: () => PendingTemplateAction;
  readTemplateError: () => string;
  readUserAction: () => PendingUserAction;
  readUserError: () => string;
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
}

export function createAdminWorkspaceConfirmController(
  options: CreateAdminWorkspaceConfirmControllerOptions
) {
  const resetHandlers = buildAdminWorkspaceConfirmResetHandlers({
    setAITaskAction: options.setAITaskAction,
    setAITaskError: options.setAITaskError,
    setModerationAction: options.setModerationAction,
    setModerationError: options.setModerationError,
    setReportAction: options.setReportAction,
    setReportError: options.setReportError,
    setTemplateAction: options.setTemplateAction,
    setTemplateError: options.setTemplateError,
    setUserAction: options.setUserAction,
    setUserError: options.setUserError
  });

  const submitHandlers = buildAdminWorkspaceConfirmSubmitHandlers({
    applyAITaskAction: options.applyAITaskAction,
    applyModerationAction: options.applyModerationAction,
    applyReportAction: options.applyReportAction,
    applyTemplateAction: options.applyTemplateAction,
    applyUserAction: options.applyUserAction,
    readAITaskAction: options.readAITaskAction,
    readModerationAction: options.readModerationAction,
    readReportAction: options.readReportAction,
    readTemplateAction: options.readTemplateAction,
    readUserAction: options.readUserAction
  });

  return {
    buildDialogs: () =>
      buildAdminWorkspaceConfirmDialogs({
        loading: options.readLoading(),
        moderation: {
          errorMessage: options.readModerationError(),
          pending: options.readModerationAction()
        },
        report: {
          errorMessage: options.readReportError(),
          pending: options.readReportAction()
        },
        aiTask: {
          errorMessage: options.readAITaskError(),
          pending: options.readAITaskAction()
        },
        template: {
          errorMessage: options.readTemplateError(),
          pending: options.readTemplateAction()
        },
        user: {
          errorMessage: options.readUserError(),
          pending: options.readUserAction()
        }
      }),
    resetHandlers,
    resetAll: () => {
      resetAdminConfirmDialogState(resetHandlers);
    },
    submitHandlers
  } satisfies {
    buildDialogs: () => ReturnType<typeof buildAdminWorkspaceConfirmDialogs>;
    resetAll: () => void;
    resetHandlers: ConfirmDialogHandlerMap<() => void>;
    submitHandlers: ConfirmDialogHandlerMap<() => Promise<void>>;
  };
}
