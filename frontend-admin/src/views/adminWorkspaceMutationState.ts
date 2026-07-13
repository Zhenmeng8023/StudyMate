import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import { resolveAdminModerationMutationMeta } from "./adminModerationMutationMeta";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";
import {
  runAdminGovernanceMutation,
  type AdminGovernanceMutationResult
} from "./adminGovernanceMutationFlow";
import type { GovernanceMutationKey } from "./adminGovernanceMutationMeta";

export async function runAdminWorkspaceModerationAction(
  activeView: AdminRouteKey,
  item: AdminWorkspaceModerationItem,
  action: "approve" | "reject" | "hide",
  options: {
    loadGovernance: (view: Exclude<AdminRouteKey, "dashboard" | "moderation">) => Promise<void> | void;
    loadModeration: () => Promise<void> | void;
    loadOverview: () => Promise<void> | void;
    post: (path: string, body: { reason: string }) => Promise<{ status: string }>;
    readStatus: (error: unknown) => number | null;
    resetDialog: () => void;
    resolveErrorMessage: (error: unknown, fallbackMessage: string) => string;
    setConfirmError: (message: string) => void;
    setError: (message: string) => void;
    setGovernanceStatus: (status: number | null) => void;
    setLoading: (loading: boolean) => void;
    setNotice: (message: string) => void;
  }
) {
  const mutation = resolveAdminModerationMutationMeta(activeView, item, action);

  options.setLoading(true);
  options.setError("");
  options.setConfirmError("");
  if (mutation.clearGovernanceConflictBeforeSubmit) {
    options.setGovernanceStatus(null);
  }

  try {
    const data = await options.post(mutation.path, { reason: "" });
    options.resetDialog();
    options.setNotice(mutation.successNotice.replace("{status}", data.status));
    await Promise.all([options.loadModeration(), options.loadOverview()]);
    if (mutation.reloadGovernanceView) {
      await options.loadGovernance(mutation.reloadGovernanceView);
    }
  } catch (error) {
    const message = options.resolveErrorMessage(error, mutation.errorFallbackMessage);
    const status = options.readStatus(error);
    if (mutation.reloadGovernanceView && status !== null && mutation.markGovernanceConflictOnStatus.includes(status)) {
      options.setGovernanceStatus(status);
    }
    options.setError(message);
    options.setConfirmError(message);
  } finally {
    options.setLoading(false);
  }
}

export async function runAdminWorkspaceGovernanceAction(
  key: GovernanceMutationKey,
  record: GovernanceRecord,
  action: string,
  options: {
    readStatus: (error: unknown) => number | null;
    request: (path: string) => Promise<{ status: string }>;
    resetDialog: (key: GovernanceMutationKey) => void;
    resolveErrorMessage: (error: unknown, fallbackMessage: string) => string;
    runMutation?: (
      key: GovernanceMutationKey,
      record: GovernanceRecord,
      action: string,
      options: {
        request: (path: string) => Promise<{ status: string }>;
        resetDialog: (key: GovernanceMutationKey) => void;
        reloadView: (view: "community" | "users" | "ai" | "graph") => Promise<void>;
        readStatus: (error: unknown) => number | null;
        resolveErrorMessage: (error: unknown, fallbackMessage: string) => string;
      }
    ) => Promise<AdminGovernanceMutationResult>;
    reloadView: (view: "community" | "users" | "ai" | "graph") => Promise<void>;
    setConfirmError: (message: string) => void;
    setError: (message: string) => void;
    setGovernanceStatus: (status: number | null) => void;
    setLoading: (loading: boolean) => void;
    setNotice: (message: string) => void;
  }
) {
  options.setLoading(true);
  options.setError("");
  options.setConfirmError("");
  options.setGovernanceStatus(null);

  const runMutation = options.runMutation ?? runAdminGovernanceMutation;
  const result = await runMutation(key, record, action, {
    readStatus: options.readStatus,
    reloadView: options.reloadView,
    request: options.request,
    resetDialog: options.resetDialog,
    resolveErrorMessage: options.resolveErrorMessage
  });

  if (result.kind === "invalid") {
    options.setConfirmError(result.message);
    options.setLoading(false);
    return;
  }

  if (result.kind === "success") {
    options.setNotice(result.notice);
    options.setLoading(false);
    return;
  }

  if (result.shouldMarkConflict && result.status !== null) {
    options.setGovernanceStatus(result.status);
  }
  options.setError(result.message);
  options.setConfirmError(result.message);
  options.setLoading(false);
}
