import type { AuthSession } from "../../../api/client";
import { useGraphWorkspaceController } from "../hooks/useGraphWorkspaceController";

export function GraphWorkspacePage(props: { session: AuthSession }) {
  return useGraphWorkspaceController(props);
}
