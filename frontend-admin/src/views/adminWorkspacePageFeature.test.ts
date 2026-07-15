import { reactive, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspacePageFeature } from "./adminWorkspacePageFeature";

function createWorkspaceStateStub() {
  const form = reactive({ login: "operator", password: "secret" });
  const session = ref({
    accessToken: "admin-token",
    refreshToken: "refresh-token",
    accessTokenExpiresAt: "2026-07-15T00:00:00Z",
    user: {
      id: "admin-1",
      username: "operator",
      email: "operator@example.test",
      displayName: "Operator",
      role: "admin"
    }
  });

  return {
    activeView: ref<"dashboard" | "users">("dashboard"),
    aiTaskConfirmError: ref(""),
    clearError: vi.fn(),
    clearProfile: vi.fn(),
    clearSessionInvalidation: vi.fn(),
    clearSessionState: vi.fn(),
    clearWorkspaceState: vi.fn(),
    errorMessage: ref(""),
    form,
    governanceErrorStatus: ref<number | null>(null),
    governanceRows: ref([{ id: "audit-1", action: "moderation.approve", status: "success" }]),
    governanceRowsView: ref(null),
    governanceStatusFilter: ref("all"),
    governanceSummary: ref<{ total: number } | null>(null),
    initializeResetController: vi.fn(),
    loading: ref(false),
    moderationConfirmError: ref(""),
    moderationErrorStatus: ref<number | null>(null),
    moderationItems: ref([
      {
        id: "post-1",
        type: "post" as const,
        title: "Pending Post",
        summary: "Needs review",
        authorName: "Alice",
        status: "pending",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]),
    moderationQuery: ref(""),
    moderationStatusFilter: ref("all"),
    notice: ref("已加载"),
    overview: ref<{ userCount: number } | null>({ userCount: 12 }),
    pendingAITaskAction: ref(null),
    pendingModerationAction: ref(null),
    pendingReportAction: ref(null),
    pendingTemplateAction: ref(null),
    pendingUserAction: ref(null),
    profile: ref({
      id: "admin-1",
      username: "operator",
      email: "operator@example.test",
      displayName: "Operator",
      role: "admin"
    }),
    recordQuery: ref(""),
    reportConfirmError: ref(""),
    selectedRecord: ref<{ id: string; action: string; status: string } | null>(null),
    session,
    sessionInvalidation: ref(null),
    setAITaskAction: vi.fn(),
    setAITaskError: vi.fn(),
    setActiveView: vi.fn(),
    setError: vi.fn(),
    setGovernanceQuery: vi.fn(),
    setGovernanceRows: vi.fn(),
    setGovernanceRowsView: vi.fn(),
    setGovernanceSelectedRecord: vi.fn(),
    setGovernanceStatus: vi.fn(),
    setGovernanceStatusFilter: vi.fn(),
    setGovernanceSummary: vi.fn(),
    setLoading: vi.fn(),
    setLoginValue: vi.fn(),
    setModerationAction: vi.fn(),
    setModerationConfirmError: vi.fn(),
    setModerationItems: vi.fn(),
    setModerationQuery: vi.fn(),
    setModerationStatus: vi.fn(),
    setModerationStatusFilter: vi.fn(),
    setNotice: vi.fn(),
    setOverview: vi.fn(),
    setPasswordValue: vi.fn(),
    setProfile: vi.fn(),
    setReportAction: vi.fn(),
    setReportConfirmError: vi.fn(),
    setSelectedRecord: vi.fn(),
    setSession: vi.fn(),
    setSessionInvalidation: vi.fn(),
    setTemplateAction: vi.fn(),
    setTemplateConfirmError: vi.fn(),
    setUserAction: vi.fn(),
    setUserConfirmError: vi.fn(),
    templateConfirmError: ref(""),
    userConfirmError: ref("")
  };
}

describe("adminWorkspacePageFeature", () => {
  it("wires state, feature, confirm, interaction, and surface adapters through one page feature", () => {
    const state = createWorkspaceStateStub();
    const workspaceFeature = {
      actions: {
        login: vi.fn(),
        logout: vi.fn(),
        refreshActiveView: vi.fn()
      },
      mutations: {
        applyAITaskAction: vi.fn(),
        applyModerationAction: vi.fn(),
        applyReportAction: vi.fn(),
        applyTemplateAction: vi.fn(),
        applyUserAction: vi.fn(),
        requestGovernanceAction: vi.fn(),
        requestModerationAction: vi.fn()
      },
      read: {
        loadActiveView: vi.fn(),
        refreshProfile: vi.fn(),
        loadGovernance: vi.fn(),
        loadModeration: vi.fn(),
        loadOverview: vi.fn()
      },
      startRuntime: vi.fn(() => vi.fn())
    };
    const workspaceConfirm = {
      buildDialogs: vi.fn(() => []),
      cancelDialog: vi.fn(),
      confirmDialog: vi.fn(),
      resetAll: vi.fn()
    };
    const workspaceInteractions = {
      selectRecord: vi.fn(),
      switchView: vi.fn()
    };
    const surfaceResult = {
      cancelConfirmDialog: vi.fn(),
      confirmConfirmDialog: vi.fn(),
      confirmDialogs: [],
      loggedIn: true,
      loginPanelEvents: {},
      loginPanelProps: {},
      moduleEvents: {},
      moduleProps: {},
      shellEvents: {},
      shellProps: {}
    };

    const createStateAdapter = vi.fn(() => state);
    const createFeatureAdapter = vi.fn(() => workspaceFeature);
    const createConfirmAdapter = vi.fn(() => workspaceConfirm);
    const createInteractionAdapter = vi.fn(() => workspaceInteractions);
    const createSurfaceAdapter = vi.fn(() => surfaceResult);

    const pageFeature = createAdminWorkspacePageFeature<{ userCount: number }>({
      initialNotice: "登录后同步数据",
      runners: {
        createConfirmAdapter,
        createFeatureAdapter,
        createInteractionAdapter,
        createStateAdapter,
        createSurfaceAdapter
      } as any
    });

    expect(createStateAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        initialNotice: "登录后同步数据"
      })
    );
    expect(createFeatureAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        action: expect.objectContaining({
          readActiveView: expect.any(Function),
          readForm: expect.any(Function)
        }),
        mutation: expect.objectContaining({
          hasSession: expect.any(Function),
          readActiveView: expect.any(Function)
        }),
        read: expect.objectContaining({
          hasSession: expect.any(Function),
          readGovernanceRows: expect.any(Function)
        }),
        runtime: expect.objectContaining({
          hasSession: expect.any(Function),
          readSession: expect.any(Function)
        })
      })
    );
    expect(createConfirmAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        applyModerationAction: workspaceFeature.mutations.applyModerationAction,
        setModerationAction: state.setModerationAction
      })
    );
    expect(createInteractionAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        clearWorkspaceState: state.clearWorkspaceState,
        loadActiveView: workspaceFeature.read.loadActiveView,
        setActiveView: state.setActiveView
      })
    );
    expect(state.initializeResetController).toHaveBeenCalledWith(workspaceConfirm.resetAll);

    state.activeView.value = "users";
    const surface = pageFeature.surface.value;

    expect(createSurfaceAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        activeView: "users",
        workspaceActions: workspaceFeature.actions,
        workspaceConfirm,
        workspaceInteractions
      })
    );
    expect(surface).toBe(surfaceResult);
    expect(pageFeature.startRuntime).toBe(workspaceFeature.startRuntime);
  });
});
