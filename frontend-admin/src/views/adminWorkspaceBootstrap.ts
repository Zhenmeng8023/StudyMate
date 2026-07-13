import type { AdminSessionPayload } from "../api/sessionStore";
import type { AdminRouteKey } from "../router";

export async function runAdminWorkspaceLoginBootstrap(
  activeView: AdminRouteKey,
  options: {
    authenticate: () => Promise<AdminSessionPayload>;
    persistSession: (session: AdminSessionPayload) => void;
    refreshProfile: () => Promise<void>;
    loadActiveView: (view: AdminRouteKey) => void;
  }
) {
  const { authenticate, persistSession, refreshProfile, loadActiveView } = options;

  const session = await authenticate();
  persistSession(session);
  await refreshProfile();
  loadActiveView(activeView);

  return session;
}
