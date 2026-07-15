import { afterEach, describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceStateAdapter } from "./adminWorkspaceStateAdapter";

describe("adminWorkspaceStateAdapter", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("hydrates session, invalidation, profile and location-derived view", () => {
    window.history.replaceState({}, "", "/admin/users");
    window.localStorage.setItem(
      "studymate.admin.session",
      JSON.stringify({
        accessToken: "admin-token",
        refreshToken: "refresh-token",
        accessTokenExpiresAt: "2026-06-02T12:00:00Z",
        user: {
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        }
      })
    );
    window.localStorage.setItem(
      "studymate.admin.session.invalidation",
      JSON.stringify({
        kind: "refresh_failed",
        code: "refresh_expired",
        message: "Session invalidated",
        status: 401,
        occurredAt: "2026-06-02T12:01:00Z"
      })
    );

    const state = createAdminWorkspaceStateAdapter<{ userCount: number }>({
      initialNotice: "Notice",
      resolveLocationView: (location) =>
        location?.pathname === "/admin/users" ? "users" : "dashboard"
    });

    expect(state.session.value?.accessToken).toBe("admin-token");
    expect(state.sessionInvalidation.value).toMatchObject({
      kind: "refresh_failed",
      code: "refresh_expired",
      message: "Session invalidated"
    });
    expect(state.profile.value).toMatchObject({
      id: "admin-1",
      username: "operator"
    });
    expect(state.activeView.value).toBe("users");
    expect(state.notice.value).toBe("Notice");
  });

  it("centralizes reset wiring and local state mutators", () => {
    const clearSessionInvalidation = vi.fn();
    const state = createAdminWorkspaceStateAdapter<{ userCount: number }>({
      clearSessionInvalidation,
      initialNotice: "Notice",
      readSession: () => null,
      readSessionInvalidation: () => null,
      resolveLocationView: () => "dashboard"
    });

    state.setGovernanceQuery("alice");
    state.setModerationQuery("pending");
    state.setGovernanceStatusFilter("disabled");
    state.setModerationStatusFilter("approved");
    state.setGovernanceRows([{ id: "user-1", username: "alice", email: "alice@example.test", role: "student", status: "active" }]);
    state.setGovernanceSummary({
      id: "summary-1",
      username: "summary",
      email: "summary@example.test",
      role: "admin",
      status: "active"
    });
    state.setGovernanceRowsView("users");
    state.setSelectedRecord({
      id: "user-1",
      username: "alice",
      email: "alice@example.test",
      role: "student",
      status: "active"
    });
    state.setModerationItems([
      {
        id: "post-1",
        type: "post",
        title: "待审帖子",
        summary: "等待审核",
        authorName: "Alice",
        status: "pending",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    state.setOverview({ userCount: 12 });
    state.setSessionInvalidation({
      kind: "refresh_failed",
      code: "refresh_expired",
      message: "Session invalidated",
      status: 401,
      occurredAt: "2026-06-02T12:01:00Z"
    });

    const resetConfirmState = vi.fn();
    state.initializeResetController(resetConfirmState);
    state.clearWorkspaceState();
    state.clearSessionInvalidation();

    expect(state.recordQuery.value).toBe("");
    expect(state.moderationQuery.value).toBe("");
    expect(state.governanceStatusFilter.value).toBe("all");
    expect(state.moderationStatusFilter.value).toBe("all");
    expect(state.governanceRows.value).toEqual([]);
    expect(state.governanceSummary.value).toBeNull();
    expect(state.governanceRowsView.value).toBeNull();
    expect(state.selectedRecord.value).toBeNull();
    expect(state.moderationItems.value).toEqual([]);
    expect(state.overview.value).toBeNull();
    expect(resetConfirmState).toHaveBeenCalledTimes(1);
    expect(state.sessionInvalidation.value).toBeNull();
    expect(clearSessionInvalidation).toHaveBeenCalledTimes(1);
  });
});
