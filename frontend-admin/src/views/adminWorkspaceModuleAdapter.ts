import { getGovernanceColumns, type GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import { resolveGovernanceDataState, resolveModerationDataState } from "./adminViewDataState";
import { buildAdminOverviewCards, type AdminOverviewPayload } from "./adminOverviewCards";
import {
  buildGovernanceStatusOptions,
  buildModerationStatusOptions,
  filterGovernanceRows,
  filterModerationItems,
  splitModerationItems,
  type AdminWorkspaceModerationItem
} from "./adminWorkspaceDerivedData";
import { buildAdminWorkspaceModuleEvents } from "./adminWorkspaceModuleEvents";
import { buildAdminWorkspaceModuleProps } from "./adminWorkspaceModuleProps";

export interface CreateAdminWorkspaceModuleAdapterOptions {
  activeLabel: string;
  activeView: AdminRouteKey;
  errorMessage: string;
  governanceErrorStatus: number | null;
  governanceQuery: string;
  governanceRows: GovernanceRecord[];
  governanceStatusFilter: string;
  governanceSummary: GovernanceRecord | null;
  loading: boolean;
  moderationErrorStatus: number | null;
  moderationItems: AdminWorkspaceModerationItem[];
  moderationQuery: string;
  moderationStatusFilter: string;
  overview: AdminOverviewPayload | null;
  requestGovernanceAction: (payload: { action: string; record: GovernanceRecord }) => void;
  requestModerationAction: (
    item: AdminWorkspaceModerationItem,
    action: "approve" | "reject" | "hide"
  ) => void;
  selectedRecord: GovernanceRecord | null;
  selectRecord: (record: GovernanceRecord) => void;
  setGovernanceQuery: (value: string) => void;
  setGovernanceStatusFilter: (value: string) => void;
  setModerationQuery: (value: string) => void;
  setModerationStatusFilter: (value: string) => void;
  switchView: (view: AdminRouteKey) => void;
}

export function createAdminWorkspaceModuleAdapter(
  options: CreateAdminWorkspaceModuleAdapterOptions
) {
  const moderationDataState = resolveModerationDataState({
    errorMessage: options.errorMessage,
    errorStatus: options.moderationErrorStatus,
    loading: options.loading,
    rowCount: options.moderationItems.length
  });

  const governanceDataState =
    options.activeView === "dashboard" || options.activeView === "moderation"
      ? null
      : resolveGovernanceDataState({
          activeLabel: options.activeLabel,
          errorMessage: options.errorMessage,
          errorStatus: options.governanceErrorStatus,
          loading: options.loading,
          rowCount: options.governanceRows.length
        });

  const moderationBuckets = splitModerationItems(options.moderationItems);
  const visibleModerationItems = filterModerationItems(
    options.moderationItems,
    options.moderationQuery,
    options.moderationStatusFilter
  );
  const moderationStatusOptions = buildModerationStatusOptions(options.moderationItems);
  const visibleGovernanceRows = filterGovernanceRows(
    options.governanceRows,
    options.governanceQuery,
    options.governanceStatusFilter
  );
  const governanceStatusOptions = buildGovernanceStatusOptions(options.governanceRows);
  const governanceColumns = getGovernanceColumns(options.governanceRows);
  const overviewCards = buildAdminOverviewCards({
    moderationItemsCount: options.moderationItems.length,
    overview: options.overview
  });

  return {
    moduleEvents: buildAdminWorkspaceModuleEvents({
      requestGovernanceAction: options.requestGovernanceAction,
      requestModerationAction: options.requestModerationAction,
      selectRecord: options.selectRecord,
      setGovernanceQuery: options.setGovernanceQuery,
      setGovernanceStatusFilter: options.setGovernanceStatusFilter,
      setModerationQuery: options.setModerationQuery,
      setModerationStatusFilter: options.setModerationStatusFilter,
      switchView: options.switchView
    }),
    moduleProps: buildAdminWorkspaceModuleProps({
      activeView: options.activeView,
      governance: {
        dataState: governanceDataState,
        query: options.governanceQuery,
        rows: visibleGovernanceRows,
        selectedRecord: options.selectedRecord,
        statusFilter: options.governanceStatusFilter,
        statusOptions: governanceStatusOptions,
        summary: options.governanceSummary,
        totalCount: options.governanceRows.length
      },
      governanceColumns,
      moderation: {
        dataState: moderationDataState,
        items: visibleModerationItems,
        query: options.moderationQuery,
        statusFilter: options.moderationStatusFilter,
        statusOptions: moderationStatusOptions,
        totalCount: options.moderationItems.length
      },
      overviewCards,
      pendingMaterialsCount: moderationBuckets.pendingMaterials.length,
      pendingPostsCount: moderationBuckets.pendingPosts.length,
      totalModerationCount: options.moderationItems.length
    })
  };
}
