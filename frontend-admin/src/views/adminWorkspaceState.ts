export type AdminWorkspaceResetKey =
  | "queries"
  | "filters"
  | "moderationData"
  | "governanceData"
  | "confirmState";

export const adminWorkspaceResetKeys: AdminWorkspaceResetKey[] = [
  "queries",
  "filters",
  "moderationData",
  "governanceData",
  "confirmState"
];

export type AdminWorkspaceResetHandlers = Record<AdminWorkspaceResetKey, () => void>;

export function resetAdminWorkspaceState(
  handlers: AdminWorkspaceResetHandlers,
  keys: AdminWorkspaceResetKey[] = adminWorkspaceResetKeys
) {
  for (const key of keys) {
    handlers[key]();
  }
}
