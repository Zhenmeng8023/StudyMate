import type { AdminDataStatePayload } from "../components/admin/dataState";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import {
  getGovernanceActions,
  getGovernanceModuleConfig,
  type GovernanceActionItem
} from "./adminGovernanceConfig";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";

type FilterOption = {
  label: string;
  value: string;
};

export function buildAdminWorkspaceModuleProps(input: {
  activeView: AdminRouteKey;
  governance: {
    dataState: AdminDataStatePayload | null;
    query: string;
    rows: GovernanceRecord[];
    selectedRecord: GovernanceRecord | null;
    statusFilter: string;
    statusOptions: FilterOption[];
    summary: GovernanceRecord | null;
    totalCount: number;
  };
  governanceColumns: string[];
  moderation: {
    dataState: AdminDataStatePayload | null;
    items: AdminWorkspaceModerationItem[];
    query: string;
    statusFilter: string;
    statusOptions: FilterOption[];
    totalCount: number;
  };
  overviewCards: Array<{ helper: string; label: string; value: string }>;
  pendingMaterialsCount: number;
  pendingPostsCount: number;
  totalModerationCount: number;
}): {
  dashboard: {
    moderationItemsCount: number;
    overviewCards: Array<{ helper: string; label: string; value: string }>;
    pendingMaterialsCount: number;
    pendingPostsCount: number;
  };
  governance: {
    actions: GovernanceActionItem[];
    columns: string[];
    dataState: AdminDataStatePayload | null;
    emptyText: string;
    query: string;
    rows: GovernanceRecord[];
    selectedRecord: GovernanceRecord | null;
    statusFilter: string;
    statusOptions: FilterOption[];
    summary: GovernanceRecord | null;
    totalCount: number;
  };
  moderation: {
    dataState: AdminDataStatePayload | null;
    items: AdminWorkspaceModerationItem[];
    query: string;
    statusFilter: string;
    statusOptions: FilterOption[];
    totalCount: number;
  };
} {
  return {
    dashboard: {
      moderationItemsCount: input.totalModerationCount,
      overviewCards: input.overviewCards,
      pendingMaterialsCount: input.pendingMaterialsCount,
      pendingPostsCount: input.pendingPostsCount
    },
    moderation: {
      dataState: input.moderation.dataState,
      items: input.moderation.items,
      query: input.moderation.query,
      statusFilter: input.moderation.statusFilter,
      statusOptions: input.moderation.statusOptions,
      totalCount: input.moderation.totalCount
    },
    governance: {
      actions: getGovernanceActions(input.activeView, input.governance.selectedRecord),
      columns: input.governanceColumns,
      dataState: input.governance.dataState,
      emptyText: getGovernanceModuleConfig(input.activeView)?.empty ?? "",
      query: input.governance.query,
      rows: input.governance.rows,
      selectedRecord: input.governance.selectedRecord,
      statusFilter: input.governance.statusFilter,
      statusOptions: input.governance.statusOptions,
      summary: input.governance.summary,
      totalCount: input.governance.totalCount
    }
  };
}
