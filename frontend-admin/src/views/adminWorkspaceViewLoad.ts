import type { AdminRouteKey } from "../router";
import { resolveAdminViewLoadPlan } from "./adminViewLoadMeta";

export type AdminWorkspaceViewLoadHandlers = {
  loadGovernance: (view: Exclude<AdminRouteKey, "dashboard" | "moderation">) => Promise<void> | void;
  loadModeration: () => Promise<void> | void;
  loadOverview: () => Promise<void> | void;
};

export async function runAdminWorkspaceViewLoad(
  view: AdminRouteKey,
  handlers: AdminWorkspaceViewLoadHandlers
) {
  const plan = resolveAdminViewLoadPlan(view);
  if (plan.kind === "dashboard") {
    await Promise.all([handlers.loadOverview(), handlers.loadModeration()]);
    return;
  }
  if (plan.kind === "moderation") {
    await handlers.loadModeration();
    return;
  }
  await handlers.loadGovernance(plan.view);
}
