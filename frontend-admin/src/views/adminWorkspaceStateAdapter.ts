import type { SessionInvalidationState } from "@studymate/api-client";
import { reactive, ref } from "vue";
import {
  clearSessionInvalidation as clearStoredSessionInvalidation,
  readSession as readStoredAdminSession,
  readSessionInvalidation as readStoredSessionInvalidation
} from "../api/sessionStore";
import type { AdminAuthUser, AdminSessionPayload } from "../api/sessionStore";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";
import { createAdminWorkspaceResetController } from "./adminWorkspaceResetController";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

type ModerationAction = "approve" | "reject" | "hide";
type ReportAction = "resolve" | "dismiss";
type UserAction = "disable" | "activate";
type AITaskAction = "retry" | "cancel";
type TemplateAction = "publish" | "unpublish";
type GovernanceView = Exclude<AdminRouteKey, "dashboard" | "moderation">;

export interface CreateAdminWorkspaceStateAdapterOptions {
  initialNotice: string;
  initialView?: AdminRouteKey;
  clearSessionInvalidation?: () => void;
  readSession?: () => AdminSessionPayload | null;
  readSessionInvalidation?: () => SessionInvalidationState | null;
  resolveLocationView: (location: Location | null) => AdminRouteKey;
}

export function createAdminWorkspaceStateAdapter<Overview>(
  options: CreateAdminWorkspaceStateAdapterOptions
) {
  const readSession = options.readSession ?? readStoredAdminSession;
  const readSessionInvalidation =
    options.readSessionInvalidation ?? readStoredSessionInvalidation;
  const clearStoredInvalidation =
    options.clearSessionInvalidation ?? clearStoredSessionInvalidation;

  const form = reactive({ login: "", password: "" });
  const session = ref<AdminSessionPayload | null>(readSession());
  const sessionInvalidation = ref(readSessionInvalidation());
  const profile = ref<AdminAuthUser | null>(session.value?.user ?? null);
  const moderationItems = ref<AdminWorkspaceModerationItem[]>([]);
  const overview = ref<Overview | null>(null);
  const governanceRows = ref<GovernanceRecord[]>([]);
  const governanceSummary = ref<GovernanceRecord | null>(null);
  const governanceRowsView = ref<GovernanceView | null>(null);
  const selectedRecord = ref<GovernanceRecord | null>(null);
  const loading = ref(false);
  const errorMessage = ref("");
  const moderationErrorStatus = ref<number | null>(null);
  const governanceErrorStatus = ref<number | null>(null);
  const notice = ref(options.initialNotice);
  const activeView = ref<AdminRouteKey>(
    options.initialView ??
      options.resolveLocationView(typeof window === "undefined" ? null : window.location)
  );
  const recordQuery = ref("");
  const moderationQuery = ref("");
  const moderationStatusFilter = ref("all");
  const governanceStatusFilter = ref("all");
  const pendingModerationAction = ref<{ action: ModerationAction; item: AdminWorkspaceModerationItem } | null>(null);
  const moderationConfirmError = ref("");
  const pendingReportAction = ref<{ action: ReportAction; record: GovernanceRecord } | null>(null);
  const reportConfirmError = ref("");
  const pendingUserAction = ref<{ action: UserAction; record: GovernanceRecord } | null>(null);
  const userConfirmError = ref("");
  const pendingAITaskAction = ref<{ action: AITaskAction; record: GovernanceRecord } | null>(null);
  const aiTaskConfirmError = ref("");
  const pendingTemplateAction = ref<{ action: TemplateAction; record: GovernanceRecord } | null>(null);
  const templateConfirmError = ref("");

  let workspaceResetController: ReturnType<
    typeof createAdminWorkspaceResetController<
      AdminWorkspaceModerationItem,
      Overview,
      GovernanceRecord,
      GovernanceView,
      GovernanceRecord
    >
  > | null = null;

  const clearWorkspaceState = (keys?: AdminWorkspaceResetKey[]) => {
    workspaceResetController?.clearState(keys);
  };

  return {
    activeView,
    aiTaskConfirmError,
    errorMessage,
    form,
    governanceErrorStatus,
    governanceRows,
    governanceRowsView,
    governanceStatusFilter,
    governanceSummary,
    loading,
    moderationConfirmError,
    moderationErrorStatus,
    moderationItems,
    moderationQuery,
    moderationStatusFilter,
    notice,
    overview,
    pendingAITaskAction,
    pendingModerationAction,
    pendingReportAction,
    pendingTemplateAction,
    pendingUserAction,
    profile,
    recordQuery,
    reportConfirmError,
    selectedRecord,
    session,
    sessionInvalidation,
    templateConfirmError,
    userConfirmError,
    clearError() {
      errorMessage.value = "";
    },
    clearProfile() {
      profile.value = null;
    },
    clearSessionInvalidation() {
      sessionInvalidation.value = null;
      clearStoredInvalidation();
    },
    clearSessionState() {
      session.value = null;
    },
    clearWorkspaceState,
    initializeResetController(resetConfirmState: () => void) {
      workspaceResetController = createAdminWorkspaceResetController({
        governanceRows,
        governanceRowsView,
        governanceStatusFilter,
        governanceSummary,
        moderationItems,
        moderationQuery,
        moderationStatusFilter,
        overview,
        recordQuery,
        resetConfirmState,
        selectedRecord
      });
      return workspaceResetController;
    },
    setAITaskAction(value: { action: AITaskAction; record: GovernanceRecord } | null) {
      pendingAITaskAction.value = value;
    },
    setAITaskError(value: string) {
      aiTaskConfirmError.value = value;
    },
    setActiveView(view: AdminRouteKey) {
      activeView.value = view;
    },
    setError(message: string) {
      errorMessage.value = message;
    },
    setGovernanceQuery(value: string) {
      recordQuery.value = value;
    },
    setGovernanceRows(rows: GovernanceRecord[]) {
      governanceRows.value = rows;
    },
    setGovernanceRowsView(view: GovernanceView | null) {
      governanceRowsView.value = view;
    },
    setGovernanceSelectedRecord(record: GovernanceRecord | null) {
      selectedRecord.value = record;
    },
    setGovernanceStatus(status: number | null) {
      governanceErrorStatus.value = status;
    },
    setGovernanceStatusFilter(value: string) {
      governanceStatusFilter.value = value;
    },
    setGovernanceSummary(summary: GovernanceRecord | null) {
      governanceSummary.value = summary;
    },
    setLoading(nextLoading: boolean) {
      loading.value = nextLoading;
    },
    setLoginValue(value: string) {
      form.login = value;
    },
    setModerationAction(value: { action: ModerationAction; item: AdminWorkspaceModerationItem } | null) {
      pendingModerationAction.value = value;
    },
    setModerationConfirmError(value: string) {
      moderationConfirmError.value = value;
    },
    setModerationItems(items: AdminWorkspaceModerationItem[]) {
      moderationItems.value = items;
    },
    setModerationQuery(value: string) {
      moderationQuery.value = value;
    },
    setModerationStatus(status: number | null) {
      moderationErrorStatus.value = status;
    },
    setModerationStatusFilter(value: string) {
      moderationStatusFilter.value = value;
    },
    setNotice(nextNotice: string) {
      notice.value = nextNotice;
    },
    setOverview(nextOverview: Overview | null) {
      overview.value = nextOverview;
    },
    setPasswordValue(value: string) {
      form.password = value;
    },
    setProfile(nextProfile: AdminAuthUser | null) {
      profile.value = nextProfile;
    },
    setReportAction(value: { action: ReportAction; record: GovernanceRecord } | null) {
      pendingReportAction.value = value;
    },
    setReportConfirmError(value: string) {
      reportConfirmError.value = value;
    },
    setSelectedRecord(record: GovernanceRecord | null) {
      selectedRecord.value = record;
    },
    setSession(nextValue: AdminSessionPayload | null) {
      session.value = nextValue;
    },
    setSessionInvalidation(nextValue: SessionInvalidationState | null) {
      sessionInvalidation.value = nextValue;
    },
    setTemplateAction(value: { action: TemplateAction; record: GovernanceRecord } | null) {
      pendingTemplateAction.value = value;
    },
    setTemplateConfirmError(value: string) {
      templateConfirmError.value = value;
    },
    setUserAction(value: { action: UserAction; record: GovernanceRecord } | null) {
      pendingUserAction.value = value;
    },
    setUserConfirmError(value: string) {
      userConfirmError.value = value;
    }
  };
}
