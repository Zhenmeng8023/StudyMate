import type { ApiRequestInit } from "@studymate/api-client";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import {
  requestAdminWorkspaceGovernanceAction,
  requestAdminWorkspaceModerationAction
} from "./adminWorkspacePendingAction";
import {
  runAdminWorkspaceGovernanceAction,
  runAdminWorkspaceModerationAction
} from "./adminWorkspaceMutationState";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";
import type { GovernanceMutationKey } from "./adminGovernanceMutationMeta";

type ModerationAction = "approve" | "reject" | "hide";
type ReportAction = "resolve" | "dismiss";
type UserAction = "disable" | "activate";
type AITaskAction = "retry" | "cancel";
type TemplateAction = "publish" | "unpublish";

interface AdminWorkspaceMutationAdapterRunners {
  requestGovernanceAction: typeof requestAdminWorkspaceGovernanceAction;
  requestModerationAction: typeof requestAdminWorkspaceModerationAction;
  runGovernanceAction: typeof runAdminWorkspaceGovernanceAction;
  runModerationAction: typeof runAdminWorkspaceModerationAction;
}

export interface CreateAdminWorkspaceMutationAdapterOptions {
  hasSession: () => boolean;
  loadGovernance: (view: Exclude<AdminRouteKey, "dashboard" | "moderation">) => Promise<void> | void;
  loadModeration: () => Promise<void> | void;
  loadOverview: () => Promise<void> | void;
  post: <T>(path: string, body: ApiRequestInit["body"]) => Promise<T>;
  readActiveView: () => AdminRouteKey;
  readStatus: (error: unknown) => number | null;
  resolveErrorMessage: (error: unknown, fallbackMessage: string) => string;
  runners?: Partial<AdminWorkspaceMutationAdapterRunners>;
  setAITaskAction: (value: { action: AITaskAction; record: GovernanceRecord } | null) => void;
  setAITaskError: (value: string) => void;
  setError: (message: string) => void;
  setGovernanceStatus: (status: number | null) => void;
  setLoading: (loading: boolean) => void;
  setModerationAction: (value: { action: ModerationAction; item: AdminWorkspaceModerationItem } | null) => void;
  setModerationConfirmError: (value: string) => void;
  setNotice: (notice: string) => void;
  setReportAction: (value: { action: ReportAction; record: GovernanceRecord } | null) => void;
  setReportConfirmError: (value: string) => void;
  setTemplateAction: (value: { action: TemplateAction; record: GovernanceRecord } | null) => void;
  setTemplateConfirmError: (value: string) => void;
  setUserAction: (value: { action: UserAction; record: GovernanceRecord } | null) => void;
  setUserConfirmError: (value: string) => void;
}

export function createAdminWorkspaceMutationAdapter(
  options: CreateAdminWorkspaceMutationAdapterOptions
) {
  const runners: AdminWorkspaceMutationAdapterRunners = {
    requestGovernanceAction:
      options.runners?.requestGovernanceAction ?? requestAdminWorkspaceGovernanceAction,
    requestModerationAction:
      options.runners?.requestModerationAction ?? requestAdminWorkspaceModerationAction,
    runGovernanceAction: options.runners?.runGovernanceAction ?? runAdminWorkspaceGovernanceAction,
    runModerationAction: options.runners?.runModerationAction ?? runAdminWorkspaceModerationAction
  };

  const applyGovernanceRecordAction = async (
    key: GovernanceMutationKey,
    record: GovernanceRecord,
    action: string,
    setConfirmError: (message: string) => void
  ) => {
    if (!options.hasSession()) return;

    await runners.runGovernanceAction(key, record, action, {
      readStatus: options.readStatus,
      reloadView: (view) => Promise.resolve(options.loadGovernance(view)),
      request: (path) => options.post<{ status: string }>(path, {}),
      resetDialog: () => {
        if (key === "report") options.setReportAction(null);
        if (key === "user") options.setUserAction(null);
        if (key === "aiTask") options.setAITaskAction(null);
        if (key === "template") options.setTemplateAction(null);
      },
      resolveErrorMessage: options.resolveErrorMessage,
      setConfirmError,
      setError: options.setError,
      setGovernanceStatus: options.setGovernanceStatus,
      setLoading: options.setLoading,
      setNotice: options.setNotice
    });
  };

  const requestModerationAction = (item: AdminWorkspaceModerationItem, action: ModerationAction) => {
    runners.requestModerationAction(item, action, {
      setModerationAction: options.setModerationAction,
      setModerationError: options.setModerationConfirmError
    });
  };

  return {
    applyAITaskAction: (record: GovernanceRecord, action: AITaskAction) =>
      applyGovernanceRecordAction("aiTask", record, action, options.setAITaskError),
    applyModerationAction: async (item: AdminWorkspaceModerationItem, action: ModerationAction) => {
      if (!options.hasSession()) return;

      await runners.runModerationAction(options.readActiveView(), item, action, {
        loadGovernance: options.loadGovernance,
        loadModeration: options.loadModeration,
        loadOverview: options.loadOverview,
        post: (path, body) => options.post<{ status: string }>(path, body),
        readStatus: options.readStatus,
        resetDialog: () => {
          options.setModerationAction(null);
        },
        resolveErrorMessage: options.resolveErrorMessage,
        setConfirmError: options.setModerationConfirmError,
        setError: options.setError,
        setGovernanceStatus: options.setGovernanceStatus,
        setLoading: options.setLoading,
        setNotice: options.setNotice
      });
    },
    applyReportAction: (record: GovernanceRecord, action: ReportAction) =>
      applyGovernanceRecordAction("report", record, action, options.setReportConfirmError),
    applyTemplateAction: (record: GovernanceRecord, action: TemplateAction) =>
      applyGovernanceRecordAction("template", record, action, options.setTemplateConfirmError),
    applyUserAction: (record: GovernanceRecord, action: UserAction) =>
      applyGovernanceRecordAction("user", record, action, options.setUserConfirmError),
    requestGovernanceAction: (payload: { action: string; record: GovernanceRecord }) => {
      runners.requestGovernanceAction(options.readActiveView(), payload, {
        clearAITaskError: () => {
          options.setAITaskError("");
        },
        clearReportError: () => {
          options.setReportConfirmError("");
        },
        clearTemplateError: () => {
          options.setTemplateConfirmError("");
        },
        clearUserError: () => {
          options.setUserConfirmError("");
        },
        invalidFallbackMessage: "\u65e0\u6cd5\u63d0\u4ea4\u6cbb\u7406\u52a8\u4f5c\u3002",
        requestModerationAction,
        setAITaskAction: options.setAITaskAction,
        setError: options.setError,
        setReportAction: options.setReportAction,
        setTemplateAction: options.setTemplateAction,
        setUserAction: options.setUserAction
      });
    },
    requestModerationAction
  };
}
