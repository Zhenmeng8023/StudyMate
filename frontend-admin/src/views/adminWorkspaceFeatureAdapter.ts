import type { AdminAuthUser, AdminSessionPayload } from "../api/sessionStore";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import { createAdminWorkspaceActionAdapter, type CreateAdminWorkspaceActionAdapterOptions } from "./adminWorkspaceActionAdapter";
import { type GovernanceModuleView } from "./adminGovernanceConfig";
import { createAdminWorkspaceMutationAdapter, type CreateAdminWorkspaceMutationAdapterOptions } from "./adminWorkspaceMutationAdapter";
import { createAdminWorkspaceReadAdapter, type CreateAdminWorkspaceReadAdapterOptions } from "./adminWorkspaceReadAdapter";
import { startAdminWorkspaceRuntime, type StartAdminWorkspaceRuntimeOptions } from "./adminWorkspaceRuntime";

type AdminWorkspaceReadAdapterApi = ReturnType<
  typeof createAdminWorkspaceReadAdapter<AdminAuthUser, unknown, unknown>
>;
type AdminWorkspaceActionAdapterApi = ReturnType<typeof createAdminWorkspaceActionAdapter>;
type AdminWorkspaceMutationAdapterApi = ReturnType<typeof createAdminWorkspaceMutationAdapter>;

interface AdminWorkspaceFeatureAdapterFactories {
  createActionAdapter: typeof createAdminWorkspaceActionAdapter;
  createMutationAdapter: typeof createAdminWorkspaceMutationAdapter;
  createReadAdapter: typeof createAdminWorkspaceReadAdapter;
  startRuntime: typeof startAdminWorkspaceRuntime;
}

export interface CreateAdminWorkspaceFeatureAdapterOptions<Profile, Overview, ModerationItem> {
  action: Omit<
    CreateAdminWorkspaceActionAdapterOptions,
    "loadActiveView" | "refreshProfile"
  >;
  mutation: Omit<
    CreateAdminWorkspaceMutationAdapterOptions,
    "loadGovernance" | "loadModeration" | "loadOverview"
  >;
  read: CreateAdminWorkspaceReadAdapterOptions<Profile, Overview, ModerationItem>;
  runtime: Omit<
    StartAdminWorkspaceRuntimeOptions,
    "loadActiveView" | "readSession" | "readSessionInvalidation" | "refreshProfile"
  > & {
    readSession: () => AdminSessionPayload | null;
    readSessionInvalidation: StartAdminWorkspaceRuntimeOptions["readSessionInvalidation"];
  };
  runners?: Partial<AdminWorkspaceFeatureAdapterFactories>;
}

export function createAdminWorkspaceFeatureAdapter<Profile, Overview, ModerationItem>(
  options: CreateAdminWorkspaceFeatureAdapterOptions<Profile, Overview, ModerationItem>
) {
  const factories: AdminWorkspaceFeatureAdapterFactories = {
    createActionAdapter: options.runners?.createActionAdapter ?? createAdminWorkspaceActionAdapter,
    createMutationAdapter:
      options.runners?.createMutationAdapter ?? createAdminWorkspaceMutationAdapter,
    createReadAdapter: options.runners?.createReadAdapter ?? createAdminWorkspaceReadAdapter,
    startRuntime: options.runners?.startRuntime ?? startAdminWorkspaceRuntime
  };

  const read = factories.createReadAdapter<Profile, Overview, ModerationItem>(options.read);
  const actions = factories.createActionAdapter({
    ...options.action,
    loadActiveView: read.loadActiveView,
    refreshProfile: read.refreshProfile
  });
  const mutations = factories.createMutationAdapter({
    ...options.mutation,
    loadGovernance: read.loadGovernance,
    loadModeration: read.loadModeration,
    loadOverview: read.loadOverview
  });

  return {
    actions,
    mutations,
    read,
    startRuntime: () =>
      factories.startRuntime({
        ...options.runtime,
        loadActiveView: read.loadActiveView,
        readSession: options.runtime.readSession,
        readSessionInvalidation: options.runtime.readSessionInvalidation,
        refreshProfile: read.refreshProfile
      })
  };
}

export type AdminWorkspaceFeatureReadAdapter = AdminWorkspaceReadAdapterApi;
export type AdminWorkspaceFeatureActionAdapter = AdminWorkspaceActionAdapterApi;
export type AdminWorkspaceFeatureMutationAdapter = AdminWorkspaceMutationAdapterApi;
export type AdminWorkspaceFeatureGovernanceRowsView = GovernanceModuleView | null;
export type AdminWorkspaceFeatureGovernanceRows = GovernanceRecord[];
