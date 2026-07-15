import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import type { GovernanceModuleView } from "./adminGovernanceConfig";
import {
  runAdminWorkspaceGovernanceLoad,
  runAdminWorkspaceModerationLoad,
  runAdminWorkspaceOverviewLoad,
  runAdminWorkspaceProfileRefresh
} from "./adminWorkspaceDataLoad";
import { runAdminWorkspaceViewLoad } from "./adminWorkspaceViewLoad";

type AdminWorkspaceQuery = { limit?: number };

type AdminWorkspaceGet = <T>(path: string, query?: AdminWorkspaceQuery) => Promise<T>;

interface AdminWorkspaceReadAdapterRunners {
  runGovernanceLoad: typeof runAdminWorkspaceGovernanceLoad;
  runModerationLoad: typeof runAdminWorkspaceModerationLoad;
  runOverviewLoad: typeof runAdminWorkspaceOverviewLoad;
  runProfileRefresh: typeof runAdminWorkspaceProfileRefresh;
  runViewLoad: typeof runAdminWorkspaceViewLoad;
}

export interface CreateAdminWorkspaceReadAdapterOptions<Profile, Overview, ModerationItem> {
  get: AdminWorkspaceGet;
  getGovernanceLoadedNotice: (count: number) => string;
  getModerationLoadedNotice: (count: number) => string;
  hasSession: () => boolean;
  readGovernanceRows: () => GovernanceRecord[];
  readGovernanceRowsView: () => GovernanceModuleView | null;
  readStatus: (error: unknown) => number | null;
  resolveErrorMessage: (error: unknown, fallbackMessage: string) => string;
  runners?: Partial<AdminWorkspaceReadAdapterRunners>;
  setError: (message: string) => void;
  setGovernanceRows: (rows: GovernanceRecord[]) => void;
  setGovernanceRowsView: (view: GovernanceModuleView | null) => void;
  setGovernanceSelectedRecord: (record: GovernanceRecord | null) => void;
  setGovernanceStatus: (status: number | null) => void;
  setGovernanceSummary: (summary: GovernanceRecord | null) => void;
  setLoading: (loading: boolean) => void;
  setModerationItems: (items: ModerationItem[]) => void;
  setModerationStatus: (status: number | null) => void;
  setNotice: (notice: string) => void;
  setOverview: (overview: Overview) => void;
  setProfile: (profile: Profile) => void;
}

export function createAdminWorkspaceReadAdapter<Profile, Overview, ModerationItem>(
  options: CreateAdminWorkspaceReadAdapterOptions<Profile, Overview, ModerationItem>
) {
  const runners: AdminWorkspaceReadAdapterRunners = {
    runGovernanceLoad: options.runners?.runGovernanceLoad ?? runAdminWorkspaceGovernanceLoad,
    runModerationLoad: options.runners?.runModerationLoad ?? runAdminWorkspaceModerationLoad,
    runOverviewLoad: options.runners?.runOverviewLoad ?? runAdminWorkspaceOverviewLoad,
    runProfileRefresh: options.runners?.runProfileRefresh ?? runAdminWorkspaceProfileRefresh,
    runViewLoad: options.runners?.runViewLoad ?? runAdminWorkspaceViewLoad
  };

  const refreshProfile = async () => {
    if (!options.hasSession()) return;

    await runners.runProfileRefresh({
      fallbackMessage: "读取管理员资料失败。",
      readStatus: options.readStatus,
      request: () => options.get<Profile>("/api/v1/admin/me"),
      setError: options.setError,
      setProfile: options.setProfile
    });
  };

  const loadOverview = async () => {
    if (!options.hasSession()) return;

    await runners.runOverviewLoad({
      fallbackMessage: "读取后台概览失败。",
      readStatus: options.readStatus,
      request: () => options.get<Overview>("/api/v1/admin/overview"),
      setError: options.setError,
      setOverview: options.setOverview
    });
  };

  const loadModeration = async () => {
    if (!options.hasSession()) return;

    await runners.runModerationLoad({
      fallbackMessage: "读取审核队列失败。",
      getLoadedNotice: options.getModerationLoadedNotice,
      readStatus: options.readStatus,
      request: () => options.get<ModerationItem[]>("/api/v1/admin/moderation"),
      resolveErrorMessage: options.resolveErrorMessage,
      setError: options.setError,
      setItems: options.setModerationItems,
      setLoading: options.setLoading,
      setNotice: options.setNotice,
      setStatus: options.setModerationStatus
    });
  };

  const loadGovernance = async (view: GovernanceModuleView) => {
    if (!options.hasSession()) return;

    await runners.runGovernanceLoad(view, {
      currentRows: options.readGovernanceRows(),
      currentRowsView: options.readGovernanceRowsView(),
      fallbackMessage: "读取治理模块失败。",
      getLoadedNotice: options.getGovernanceLoadedNotice,
      readStatus: options.readStatus,
      request: (path, query) => options.get<GovernanceRecord[]>(path, query),
      requestSummary: (path) => options.get<GovernanceRecord>(path),
      resolveErrorMessage: options.resolveErrorMessage,
      setError: options.setError,
      setLoading: options.setLoading,
      setNotice: options.setNotice,
      setRows: options.setGovernanceRows,
      setRowsView: options.setGovernanceRowsView,
      setSelectedRecord: options.setGovernanceSelectedRecord,
      setStatus: options.setGovernanceStatus,
      setSummary: options.setGovernanceSummary
    });
  };

  return {
    loadActiveView(view: AdminRouteKey) {
      return runners.runViewLoad(view, {
        loadGovernance,
        loadModeration,
        loadOverview
      });
    },
    loadGovernance,
    loadModeration,
    loadOverview,
    refreshProfile
  };
}
