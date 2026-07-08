import type { ReactNode } from "react";
import type { AuthSession } from "../../api/client";
import { AppShell } from "../layouts/AppShell";

/**
 * Compatibility wrapper for route definitions. Layout selection now lives in
 * AppShell, keeping ShellFrame small while individual routes use the layout
 * density their learning task requires.
 */
export function ShellFrame(props: { session: AuthSession | null; onLogout: () => void; children: ReactNode }) {
  return <AppShell {...props} />;
}
