import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";

type AdminView = "dashboard" | "moderation" | "materials" | "community" | "users" | "graph" | "ai" | "system" | "audit";

export function buildAdminWorkspaceModuleEvents(input: {
  requestGovernanceAction: (payload: { action: string; record: GovernanceRecord }) => void;
  requestModerationAction: (
    item: AdminWorkspaceModerationItem,
    action: "approve" | "reject" | "hide"
  ) => void;
  selectRecord: (record: GovernanceRecord) => void;
  setGovernanceQuery: (value: string) => void;
  setGovernanceStatusFilter: (value: string) => void;
  setModerationQuery: (value: string) => void;
  setModerationStatusFilter: (value: string) => void;
  switchView: (view: AdminView) => void;
}) {
  return {
    dashboard: {
      openModeration: () => {
        input.switchView("moderation");
      }
    },
    moderation: {
      requestAction: (payload: {
        action: "approve" | "reject" | "hide";
        item: AdminWorkspaceModerationItem;
      }) => {
        input.requestModerationAction(payload.item, payload.action);
      },
      updateQuery: (value: string) => {
        input.setModerationQuery(value);
      },
      updateStatusFilter: (value: string) => {
        input.setModerationStatusFilter(value);
      }
    },
    governance: {
      requestAction: (payload: { action: string; record: GovernanceRecord }) => {
        input.requestGovernanceAction(payload);
      },
      selectRecord: (record: GovernanceRecord) => {
        input.selectRecord(record);
      },
      updateQuery: (value: string) => {
        input.setGovernanceQuery(value);
      },
      updateStatusFilter: (value: string) => {
        input.setGovernanceStatusFilter(value);
      }
    }
  };
}
