export type AdminFilterOption = {
  label: string;
  value: string;
};

type FilterCollectionOptions<T> = {
  getStatus: (item: T) => string | null | undefined;
  query: string;
  statusFilter: string;
  toSearchText: (item: T) => string;
};

function normalizeFilterToken(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

export function buildStatusFilterOptions<T>(
  items: T[],
  getStatus: (item: T) => string | null | undefined,
  allLabel = "全部状态"
): AdminFilterOption[] {
  const statuses = Array.from(
    new Set(
      items
        .map((item) => String(getStatus(item) ?? "").trim())
        .filter(Boolean)
    )
  );

  return [
    { label: allLabel, value: "all" },
    ...statuses.map((status) => ({ label: status, value: normalizeFilterToken(status) }))
  ];
}

export function filterCollectionByStatusAndQuery<T>(items: T[], options: FilterCollectionOptions<T>): T[] {
  const normalizedStatusFilter = normalizeFilterToken(options.statusFilter);
  const statusFiltered = normalizedStatusFilter && normalizedStatusFilter !== "all"
    ? items.filter((item) => normalizeFilterToken(options.getStatus(item)) === normalizedStatusFilter)
    : items;

  const normalizedQuery = normalizeFilterToken(options.query);
  if (!normalizedQuery) return statusFiltered;

  return statusFiltered.filter((item) =>
    options.toSearchText(item).toLowerCase().includes(normalizedQuery)
  );
}
