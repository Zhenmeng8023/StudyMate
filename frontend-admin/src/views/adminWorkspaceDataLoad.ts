import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import type { GovernanceModuleView } from "./adminGovernanceConfig";
import { getGovernanceModuleConfig } from "./adminGovernanceConfig";
import { resolveAdminViewLoadPlan, shouldPreserveGovernanceRows } from "./adminViewLoadMeta";
import { runAdminViewLoadRequest } from "./adminViewLoadRequest";
import { runAdminViewReadRequest } from "./adminViewReadRequest";

export async function runAdminWorkspaceProfileRefresh<T>(options: {
  fallbackMessage: string;
  readStatus: (error: unknown) => number | null;
  request: () => Promise<T>;
  setError: (message: string) => void;
  setProfile: (profile: T) => void;
}) {
  const result = await runAdminViewReadRequest({
    fallbackMessage: options.fallbackMessage,
    readStatus: options.readStatus,
    request: options.request
  });

  if (result.kind === "error") {
    options.setError(result.message);
    return;
  }

  options.setProfile(result.data);
}

export async function runAdminWorkspaceOverviewLoad<T>(options: {
  fallbackMessage: string;
  readStatus: (error: unknown) => number | null;
  request: () => Promise<T>;
  setError: (message: string) => void;
  setOverview: (overview: T) => void;
}) {
  const result = await runAdminViewReadRequest({
    fallbackMessage: options.fallbackMessage,
    readStatus: options.readStatus,
    request: options.request
  });

  if (result.kind === "error") {
    options.setError(result.message);
    return;
  }

  options.setOverview(result.data);
}

export async function runAdminWorkspaceModerationLoad<T>(options: {
  fallbackMessage: string;
  getLoadedNotice: (count: number) => string;
  readStatus: (error: unknown) => number | null;
  request: () => Promise<T[]>;
  resolveErrorMessage: (error: unknown, fallbackMessage: string) => string;
  setError: (message: string) => void;
  setItems: (items: T[]) => void;
  setLoading: (loading: boolean) => void;
  setNotice: (message: string) => void;
  setStatus: (status: number | null) => void;
}) {
  options.setLoading(true);
  options.setError("");
  options.setStatus(null);

  try {
    const result = await runAdminViewLoadRequest({
      readStatus: options.readStatus,
      request: options.request,
      onForbidden: () => {
        options.setItems([]);
      }
    });

    if (result.kind === "error") {
      options.setStatus(result.status);
      throw result.error;
    }

    options.setItems(result.data);
    options.setNotice(options.getLoadedNotice(result.data.length));
  } catch (error) {
    options.setError(options.resolveErrorMessage(error, options.fallbackMessage));
  } finally {
    options.setLoading(false);
  }
}

export async function runAdminWorkspaceGovernanceLoad(
  view: AdminRouteKey,
  options: {
    currentRows: GovernanceRecord[];
    currentRowsView: GovernanceModuleView | null;
    fallbackMessage: string;
    getLoadedNotice: (count: number) => string;
    readStatus: (error: unknown) => number | null;
    request: (endpoint: string, query?: { limit?: number }) => Promise<GovernanceRecord[]>;
    requestSummary: (path: string) => Promise<GovernanceRecord>;
    resolveErrorMessage: (error: unknown, fallbackMessage: string) => string;
    setError: (message: string) => void;
    setLoading: (loading: boolean) => void;
    setNotice: (message: string) => void;
    setRows: (rows: GovernanceRecord[]) => void;
    setRowsView: (view: GovernanceModuleView | null) => void;
    setSelectedRecord: (record: GovernanceRecord | null) => void;
    setStatus: (status: number | null) => void;
    setSummary: (summary: GovernanceRecord | null) => void;
  }
) {
  if (view === "dashboard" || view === "moderation") return;

  const plan = resolveAdminViewLoadPlan(view);
  if (plan.kind !== "governance") return;

  const preserveExistingRows = shouldPreserveGovernanceRows(
    options.currentRowsView,
    plan.view,
    options.currentRows.length
  );

  options.setLoading(true);
  options.setError("");
  options.setStatus(null);

  if (!preserveExistingRows) {
    options.setRows([]);
    options.setSummary(null);
    options.setSelectedRecord(null);
  }

  try {
    const config = getGovernanceModuleConfig(plan.view);
    if (!config) return;

    const result = await runAdminViewLoadRequest({
      readStatus: options.readStatus,
      request: () => options.request(config.endpoint, config.query),
      onForbidden: () => {
        options.setRows([]);
        options.setSummary(null);
        options.setRowsView(null);
        options.setSelectedRecord(null);
      }
    });

    if (result.kind === "error") {
      options.setStatus(result.status);
      throw result.error;
    }

    options.setRows(result.data);
    options.setRowsView(plan.view);
    options.setSelectedRecord(result.data[0] ?? null);
    if (plan.summaryEndpoint) {
      options.setSummary(await options.requestSummary(plan.summaryEndpoint));
    } else {
      options.setSummary(null);
    }
    options.setNotice(options.getLoadedNotice(result.data.length));
  } catch (error) {
    options.setError(options.resolveErrorMessage(error, options.fallbackMessage));
  } finally {
    options.setLoading(false);
  }
}
