import {
  resetAdminWorkspaceState,
  type AdminWorkspaceResetHandlers,
  type AdminWorkspaceResetKey
} from "./adminWorkspaceState";

type MutableValue<T> = { value: T };

export function createAdminWorkspaceResetController<
  ModerationItem,
  Overview,
  GovernanceRow,
  GovernanceView,
  SelectedRecord
>(options: {
  governanceRows: MutableValue<GovernanceRow[]>;
  governanceRowsView: MutableValue<GovernanceView | null>;
  governanceStatusFilter: MutableValue<string>;
  governanceSummary: MutableValue<GovernanceRow | null>;
  moderationItems: MutableValue<ModerationItem[]>;
  moderationQuery: MutableValue<string>;
  moderationStatusFilter: MutableValue<string>;
  overview: MutableValue<Overview | null>;
  recordQuery: MutableValue<string>;
  resetConfirmState: () => void;
  selectedRecord: MutableValue<SelectedRecord | null>;
}) {
  const handlers: AdminWorkspaceResetHandlers = {
    queries: () => {
      options.recordQuery.value = "";
      options.moderationQuery.value = "";
    },
    filters: () => {
      options.moderationStatusFilter.value = "all";
      options.governanceStatusFilter.value = "all";
    },
    moderationData: () => {
      options.moderationItems.value = [];
      options.overview.value = null;
    },
    governanceData: () => {
      options.governanceRows.value = [];
      options.governanceSummary.value = null;
      options.governanceRowsView.value = null;
      options.selectedRecord.value = null;
    },
    confirmState: options.resetConfirmState
  };

  return {
    clearState(keys?: AdminWorkspaceResetKey[]) {
      resetAdminWorkspaceState(handlers, keys);
    },
    handlers
  };
}
