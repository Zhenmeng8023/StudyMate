import { formatGovernanceCell, type GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminFilterOption } from "./adminModuleFilters";
import { buildStatusFilterOptions, filterCollectionByStatusAndQuery } from "./adminModuleFilters";

export type AdminWorkspaceModerationItem = {
  id: string;
  type: "post" | "material";
  title: string;
  summary: string;
  authorName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type SplitModerationItemsResult = {
  pendingPosts: AdminWorkspaceModerationItem[];
  pendingMaterials: AdminWorkspaceModerationItem[];
};

function sortItemsByStatus<T>(items: T[], getStatus: (item: T) => string | null | undefined) {
  return [...items].sort((left, right) =>
    String(getStatus(left) ?? "")
      .trim()
      .toLowerCase()
      .localeCompare(String(getStatus(right) ?? "").trim().toLowerCase())
  );
}

export function splitModerationItems(items: AdminWorkspaceModerationItem[]): SplitModerationItemsResult {
  return items.reduce<SplitModerationItemsResult>(
    (result, item) => {
      if (item.type === "post") {
        result.pendingPosts.push(item);
        return result;
      }

      result.pendingMaterials.push(item);
      return result;
    },
    { pendingPosts: [], pendingMaterials: [] }
  );
}

export function filterModerationItems(
  items: AdminWorkspaceModerationItem[],
  query: string,
  statusFilter: string
) {
  return filterCollectionByStatusAndQuery(items, {
    getStatus: (item) => item.status,
    query,
    statusFilter,
    toSearchText: (item) => [item.title, item.summary, item.authorName, item.type, item.status].join(" ")
  });
}

export function buildModerationStatusOptions(items: AdminWorkspaceModerationItem[]): AdminFilterOption[] {
  return buildStatusFilterOptions(sortItemsByStatus(items, (item) => item.status), (item) => item.status);
}

export function filterGovernanceRows(rows: GovernanceRecord[], query: string, statusFilter: string) {
  return filterCollectionByStatusAndQuery(rows, {
    getStatus: (row) => String(row.status ?? ""),
    query,
    statusFilter,
    toSearchText: (row) => Object.values(row).map((value) => formatGovernanceCell(value)).join(" ")
  });
}

export function buildGovernanceStatusOptions(rows: GovernanceRecord[]): AdminFilterOption[] {
  return buildStatusFilterOptions(sortItemsByStatus(rows, (row) => String(row.status ?? "")), (row) => String(row.status ?? ""));
}
