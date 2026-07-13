import type { GovernanceRecord } from "../components/admin/governanceRecord";
import {
  resolveGovernanceMutationMeta,
  type GovernanceMutationKey
} from "./adminGovernanceMutationMeta";

export type AdminGovernanceMutationResult =
  | {
      kind: "invalid";
      message: string;
    }
  | {
      kind: "success";
      notice: string;
    }
  | {
      kind: "error";
      message: string;
      status: number | null;
      shouldMarkConflict: boolean;
    };

export async function runAdminGovernanceMutation(
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
): Promise<AdminGovernanceMutationResult> {
  const mutation = resolveGovernanceMutationMeta(key, record, action);
  if (mutation.kind === "invalid") {
    return mutation;
  }

  const { readStatus, reloadView, request, resetDialog, resolveErrorMessage } = options;

  try {
    const data = await request(mutation.path);
    resetDialog(key);
    await reloadView(mutation.reloadView);
    return {
      kind: "success",
      notice: mutation.successNotice.replace("{status}", data.status)
    };
  } catch (error) {
    const status = readStatus(error);
    return {
      kind: "error",
      message: resolveErrorMessage(error, mutation.errorFallbackMessage),
      shouldMarkConflict: status === 409,
      status
    };
  }
}
