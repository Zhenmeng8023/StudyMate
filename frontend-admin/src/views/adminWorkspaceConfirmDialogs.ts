import {
  getAITaskConfirmCopy,
  getModerationConfirmCopy,
  getReportConfirmCopy,
  getTemplateConfirmCopy,
  getUserConfirmCopy
} from "./adminActionConfirmCopy";
import { buildAdminConfirmDialogs, type AdminConfirmDialogItem } from "./adminConfirmDialogs";

type AdminWorkspaceModerationPendingState =
  | {
      action: "approve" | "reject" | "hide";
      item: {
        status: string;
        title: string;
      };
    }
  | null;

type AdminWorkspaceReportPendingState =
  | {
      action: "resolve" | "dismiss";
      record: {
        id?: unknown;
      };
    }
  | null;

type AdminWorkspaceAITaskPendingState =
  | {
      action: "retry" | "cancel";
      record: {
        id?: unknown;
      };
    }
  | null;

type AdminWorkspaceTemplatePendingState =
  | {
      action: "publish" | "unpublish";
      record: {
        id?: unknown;
        name?: unknown;
        title?: unknown;
      };
    }
  | null;

type AdminWorkspaceUserPendingState =
  | {
      action: "disable" | "activate";
      record: {
        displayName?: unknown;
        id?: unknown;
        username?: unknown;
      };
    }
  | null;

export function buildAdminWorkspaceConfirmDialogs(input: {
  loading: boolean;
  moderation: {
    errorMessage: string;
    pending: AdminWorkspaceModerationPendingState;
  };
  report: {
    errorMessage: string;
    pending: AdminWorkspaceReportPendingState;
  };
  aiTask: {
    errorMessage: string;
    pending: AdminWorkspaceAITaskPendingState;
  };
  template: {
    errorMessage: string;
    pending: AdminWorkspaceTemplatePendingState;
  };
  user: {
    errorMessage: string;
    pending: AdminWorkspaceUserPendingState;
  };
}): AdminConfirmDialogItem[] {
  return buildAdminConfirmDialogs({
    loading: input.loading,
    moderation: {
      copy: getModerationConfirmCopy(input.moderation.pending),
      errorMessage: input.moderation.errorMessage,
      isOpen: Boolean(input.moderation.pending)
    },
    report: {
      copy: getReportConfirmCopy(input.report.pending),
      errorMessage: input.report.errorMessage,
      isOpen: Boolean(input.report.pending)
    },
    aiTask: {
      copy: getAITaskConfirmCopy(input.aiTask.pending),
      errorMessage: input.aiTask.errorMessage,
      isOpen: Boolean(input.aiTask.pending)
    },
    template: {
      copy: getTemplateConfirmCopy(input.template.pending),
      errorMessage: input.template.errorMessage,
      isOpen: Boolean(input.template.pending)
    },
    user: {
      copy: getUserConfirmCopy(input.user.pending),
      errorMessage: input.user.errorMessage,
      isOpen: Boolean(input.user.pending)
    }
  });
}
