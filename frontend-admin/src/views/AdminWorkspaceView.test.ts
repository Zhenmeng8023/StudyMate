import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminWorkspaceView from "./AdminWorkspaceView.vue";

function apiPayload<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("AdminWorkspaceView governance modules", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("loads the real users governance API from an existing admin session", async () => {
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

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/overview") {
        return apiPayload({
          userCount: 12,
          postCount: 4,
          materialCount: 5,
          graphCount: 6,
          pendingModerationCount: 1
        });
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([]);
      }
      if (path === "/api/v1/admin/users?limit=20") {
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer admin-token"
        });
        return apiPayload([
          {
            id: "user-1",
            username: "alice",
            email: "alice@example.test",
            role: "student",
            status: "active"
          }
        ]);
      }
      return apiPayload([]);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    const usersButton = wrapper.find('[data-admin-nav-item-view="users"]');
    expect(usersButton.exists()).toBe(true);
    await usersButton.trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/users?limit=20",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
    expect(window.location.pathname).toBe("/admin/users");
    expect(wrapper.text()).toContain("alice");
    expect(wrapper.text()).toContain("1");
  });

  it("confirms user governance actions before disabling an active user", async () => {
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

    const disablePath = "/api/v1/admin/users/user-1/disable";
    const userRow = {
      id: "user-1",
      username: "alice",
      email: "alice@example.test",
      displayName: "Alice",
      role: "user",
      status: "active",
      createdAt: "2026-06-02T12:00:00Z"
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/users?limit=20") {
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer admin-token"
        });
        return apiPayload([userRow]);
      }
      if (path === disablePath) {
        expect(init?.method).toBe("POST");
        return apiPayload({ status: "disabled" });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("alice");

    await wrapper.get('[data-governance-action="disable"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("确认禁用这个用户");
    expect(fetchMock).not.toHaveBeenCalledWith(
      disablePath,
      expect.objectContaining({
        method: "POST"
      })
    );

    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      disablePath,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
  });

  it("returns to the login screen when refresh fails during admin bootstrap", async () => {
    window.history.replaceState({}, "", "/admin/dashboard");
    window.localStorage.setItem(
      "studymate.admin.session",
      JSON.stringify({
        accessToken: "stale-admin-token",
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

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path === "/api/v1/admin/me") {
        expect(authorization).toBe("Bearer stale-admin-token");
        return new Response(
          JSON.stringify({ success: false, error: { code: "token_expired", message: "访问令牌已过期" } }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path === "/api/v1/auth/refresh") {
        expect(init?.method).toBe("POST");
        return new Response(
          JSON.stringify({ success: false, error: { code: "refresh_expired", message: "刷新令牌已失效" } }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Unexpected request: ${path} ${authorization}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/refresh",
      expect.objectContaining({
        method: "POST"
      })
    );
    expect(window.localStorage.getItem("studymate.admin.session")).toBeNull();
    expect(wrapper.text()).toContain("进入管理后台");
    expect(wrapper.text()).toContain("后台会话已失效，请重新登录后继续治理工作。");
  });

  it("loads the dashboard data after a successful admin login", async () => {
    window.history.replaceState({}, "", "/admin/dashboard");

    const sessionPayload = {
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
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/login") {
        expect(init?.method).toBe("POST");
        return apiPayload(sessionPayload);
      }
      if (path === "/api/v1/admin/me") {
        return apiPayload(sessionPayload.user);
      }
      if (path === "/api/v1/admin/overview") {
        return apiPayload({
          userCount: 12,
          postCount: 4,
          materialCount: 5,
          graphCount: 6,
          pendingModerationCount: 1
        });
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([
          {
            id: "post-1",
            type: "post",
            title: "Pending Post",
            summary: "Needs moderation review",
            authorName: "Alice",
            status: "pending",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        ]);
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);

    await wrapper.get('input[type="text"]').setValue("operator@example.test");
    await wrapper.get('input[type="password"]').setValue("secret");
    await wrapper.get("form").trigger("submit.prevent");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/login",
      expect.objectContaining({
        method: "POST"
      })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/overview",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/moderation",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
    expect(window.localStorage.getItem("studymate.admin.session")).toContain("admin-token");
    expect(wrapper.text()).toContain("当前共有 1 条待处理内容");
    expect(wrapper.text()).toContain("用户规模");
    expect(window.location.pathname).toBe("/admin/dashboard");
  });

  it("asks for confirmation before applying a moderation action", async () => {
    window.history.replaceState({}, "", "/admin/dashboard");
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

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const rejectPath = "/api/v1/admin/moderation/posts/post-1/reject";
    const moderationItem = {
      id: "post-1",
      type: "post" as const,
      title: "Pending Post",
      summary: "Needs moderation review",
      authorName: "Alice",
      status: "pending",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/overview") {
        return apiPayload({
          userCount: 12,
          postCount: 4,
          materialCount: 5,
          graphCount: 6,
          pendingModerationCount: 1
        });
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([moderationItem]);
      }
      if (path === rejectPath) {
        expect(init?.method).toBe("POST");
        return apiPayload({ status: "rejected" });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    await wrapper.get('[data-admin-nav-item-view="moderation"]').trigger("click");
    await flushPromises();

    await wrapper.get('[data-moderation-action="reject"]').trigger("click");

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-admin-confirm-stack="true"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("确认驳回这条内容");
    expect(fetchMock).not.toHaveBeenCalledWith(
      rejectPath,
      expect.objectContaining({
        method: "POST"
      })
    );

    await wrapper.get('[data-confirm-cancel="true"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).not.toContain("确认驳回这条内容");
    expect(fetchMock).not.toHaveBeenCalledWith(
      rejectPath,
      expect.objectContaining({
        method: "POST"
      })
    );

    await wrapper.get('[data-moderation-action="reject"]').trigger("click");
    await flushPromises();
    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      rejectPath,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
    confirmSpy.mockRestore();
  });

  it("updates the browser URL when switching admin modules", async () => {
    window.history.replaceState({}, "", "/admin/dashboard");
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

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/overview") {
        return apiPayload({
          userCount: 12,
          postCount: 4,
          materialCount: 5,
          graphCount: 6,
          pendingModerationCount: 0
        });
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([]);
      }
      if (path === "/api/v1/admin/audit-logs?limit=20") {
        return apiPayload([
          {
            id: "audit-1",
            action: "moderation.approve",
            status: "success"
          }
        ]);
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    await wrapper.get('[data-admin-nav-item-view="audit"]').trigger("click");
    await flushPromises();

    expect(window.location.pathname).toBe("/admin/audit");
    expect(wrapper.text()).toContain("audit-1");
  });

  it("confirms report governance actions before posting report resolution", async () => {
    window.history.replaceState({}, "", "/admin/community");
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

    const reportRow = {
      id: "report-1",
      reporterUserId: "user-9",
      targetType: "post",
      targetId: "post-1",
      reason: "spam",
      description: "duplicate links",
      status: "pending"
    };
    const resolvePath = "/api/v1/admin/reports/report-1/resolve";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/reports?limit=20") {
        return apiPayload([reportRow]);
      }
      if (path === resolvePath) {
        expect(init?.method).toBe("POST");
        return apiPayload({ status: "resolved" });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("report-1");

    await wrapper.get('[data-governance-action="resolve"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("确认标记这条举报已处理");
    expect(fetchMock).not.toHaveBeenCalledWith(
      resolvePath,
      expect.objectContaining({
        method: "POST"
      })
    );

    await wrapper.get('[data-confirm-cancel="true"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).not.toContain("确认标记这条举报已处理");

    await wrapper.get('[data-governance-action="resolve"]').trigger("click");
    await flushPromises();
    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      resolvePath,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
  });

  it("loads real materials governance rows and confirms material hide actions", async () => {
    window.history.replaceState({}, "", "/admin/materials");
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

    const materialRow = {
      id: "material-1",
      ownerUserId: "user-9",
      ownerName: "Alice",
      title: "Linear Algebra",
      category: "math",
      attachmentName: "algebra.pdf",
      status: "approved",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    };
    const hidePath = "/api/v1/admin/moderation/materials/material-1/hide";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/materials?limit=20") {
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer admin-token"
        });
        return apiPayload([materialRow]);
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([]);
      }
      if (path === hidePath) {
        expect(init?.method).toBe("POST");
        return apiPayload({ status: "hidden" });
      }
      if (path === "/api/v1/admin/overview") {
        return apiPayload({
          userCount: 12,
          postCount: 4,
          materialCount: 5,
          graphCount: 6,
          pendingModerationCount: 0
        });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("Linear Algebra");
    expect(wrapper.text()).toContain("algebra.pdf");

    await wrapper.get('[data-governance-action="hide"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("确认隐藏这条内容");
    expect(fetchMock).not.toHaveBeenCalledWith(
      hidePath,
      expect.objectContaining({
        method: "POST"
      })
    );

    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      hidePath,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
  });

  it("confirms ai governance actions before retrying a failed task", async () => {
    window.history.replaceState({}, "", "/admin/ai");
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

    const aiTaskRow = {
      id: "task-1",
      userId: "user-9",
      taskType: "reader.generate_cards",
      sourceType: "material",
      sourceId: "material-1",
      status: "failed",
      model: "local-draft-engine",
      inputTokens: 120,
      outputTokens: 0,
      errorMessage: "timeout"
    };
    const retryPath = "/api/v1/admin/ai/tasks/task-1/retry";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/ai/tasks?limit=20") {
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer admin-token"
        });
        return apiPayload([aiTaskRow]);
      }
      if (path === "/api/v1/admin/ai/usage") {
        return apiPayload({
          totalTasks: 1,
          completedTasks: 0,
          failedTasks: 1,
          totalInputTokens: 120,
          totalOutputTokens: 0,
          totalCostUnits: 0
        });
      }
      if (path === retryPath) {
        expect(init?.method).toBe("POST");
        return apiPayload({ status: "pending" });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("reader.generate_cards");
    expect(wrapper.text()).toContain("timeout");

    await wrapper.get('[data-governance-action="retry"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("确认重试这个 AI 任务");
    expect(fetchMock).not.toHaveBeenCalledWith(
      retryPath,
      expect.objectContaining({
        method: "POST"
      })
    );

    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      retryPath,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
  });

  it("loads diagram template governance rows and confirms unpublish actions", async () => {
    window.history.replaceState({}, "", "/admin/graph");
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

    const templateRow = {
      id: "uml-class-diagram",
      name: "UML 绫诲浘",
      category: "uml",
      mode: "diagram",
      sourceType: "system",
      status: "published"
    };
    const unpublishPath = "/api/v1/admin/diagram-templates/uml-class-diagram/unpublish";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/diagram-templates?limit=20") {
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer admin-token"
        });
        return apiPayload([templateRow]);
      }
      if (path === unpublishPath) {
        expect(init?.method).toBe("POST");
        return apiPayload({ status: "unpublished" });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("UML 绫诲浘");

    await wrapper.get('[data-governance-action="unpublish"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("确认下架这个图谱模板");
    expect(fetchMock).not.toHaveBeenCalledWith(
      unpublishPath,
      expect.objectContaining({
        method: "POST"
      })
    );

    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      unpublishPath,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
  });

  it("returns to the login screen immediately when admin bootstrap receives user_disabled", async () => {
    window.history.replaceState({}, "", "/admin/dashboard");
    window.localStorage.setItem(
      "studymate.admin.session",
      JSON.stringify({
        accessToken: "disabled-admin-token",
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

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path === "/api/v1/admin/me") {
        expect(authorization).toBe("Bearer disabled-admin-token");
        return new Response(
          JSON.stringify({ success: false, error: { code: "user_disabled", message: "当前账号已被禁用" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path === "/api/v1/auth/refresh") {
        throw new Error("refresh should not run");
      }

      throw new Error(`Unexpected request: ${path} ${authorization}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(window.localStorage.getItem("studymate.admin.session")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/v1/auth/refresh",
      expect.objectContaining({
        method: "POST"
      })
    );
    expect(wrapper.text()).toContain("进入管理后台");
    expect(wrapper.text()).toContain("当前账号已被禁用，请联系其他管理员后重新登录。");
  });

  it("surfaces a stale moderation state when refreshing the queue fails after data already loaded", async () => {
    window.history.replaceState({}, "", "/admin/moderation");
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

    const moderationItem = {
      id: "post-1",
      type: "post" as const,
      title: "Pending Post",
      summary: "Needs moderation review",
      authorName: "Alice",
      status: "pending",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    };

    let moderationRequestCount = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/moderation") {
        moderationRequestCount += 1;
        if (moderationRequestCount === 1) {
          return apiPayload([moderationItem]);
        }
        return new Response(
          JSON.stringify({ success: false, error: { code: "moderation_sync_failed", message: "审核队列刷新失败" } }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("Pending Post");

    await wrapper.get('button[data-admin-refresh="true"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("需要刷新");
    expect(wrapper.text()).toContain("审核队列需要刷新");
    expect(wrapper.text()).toContain("Pending Post");
    expect(wrapper.text()).toContain("审核队列刷新失败");
  });

  it("surfaces a stale governance state when refreshing a loaded module fails", async () => {
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

    const userRow = {
      id: "user-1",
      username: "alice",
      email: "alice@example.test",
      role: "student",
      status: "active"
    };

    let usersRequestCount = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/users?limit=20") {
        usersRequestCount += 1;
        if (usersRequestCount === 1) {
          return apiPayload([userRow]);
        }
        return new Response(
          JSON.stringify({ success: false, error: { code: "governance_sync_failed", message: "治理记录刷新失败" } }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("alice");

    await wrapper.get('button[data-admin-refresh="true"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("需要刷新");
    expect(wrapper.text()).toContain("治理记录需要刷新");
    expect(wrapper.text()).toContain("alice");
    expect(wrapper.text()).toContain("治理记录刷新失败");
  });

  it("surfaces an unauthorized moderation state and clears existing rows after a 403 refresh failure", async () => {
    window.history.replaceState({}, "", "/admin/moderation");
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

    const moderationItem = {
      id: "post-1",
      type: "post" as const,
      title: "Pending Post",
      summary: "Needs moderation review",
      authorName: "Alice",
      status: "pending",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    };

    let moderationRequestCount = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/moderation") {
        moderationRequestCount += 1;
        if (moderationRequestCount === 1) {
          return apiPayload([moderationItem]);
        }
        return new Response(
          JSON.stringify({ success: false, error: { code: "admin_forbidden", message: "当前账号没有审核权限" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("Pending Post");

    await wrapper.get('button[data-admin-refresh="true"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("需要登录");
    expect(wrapper.text()).toContain("暂无审核权限");
    expect(wrapper.text()).toContain("当前账号没有审核权限");
    expect(wrapper.text()).not.toContain("Pending Post");
  });

  it("surfaces an unauthorized governance state and clears existing rows after a 403 refresh failure", async () => {
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

    const userRow = {
      id: "user-1",
      username: "alice",
      email: "alice@example.test",
      role: "student",
      status: "active"
    };

    let usersRequestCount = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/users?limit=20") {
        usersRequestCount += 1;
        if (usersRequestCount === 1) {
          return apiPayload([userRow]);
        }
        return new Response(
          JSON.stringify({ success: false, error: { code: "admin_forbidden", message: "当前账号没有用户治理权限" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("alice");

    await wrapper.get('button[data-admin-refresh="true"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("需要登录");
    expect(wrapper.text()).toContain("暂无治理权限");
    expect(wrapper.text()).toContain("当前账号没有用户治理权限");
    expect(wrapper.text()).not.toContain("alice");
  });

  it("filters moderation rows locally by status through the shared select", async () => {
    window.history.replaceState({}, "", "/admin/moderation");
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

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([
          {
            id: "post-1",
            type: "post",
            title: "待审帖子",
            summary: "等待人工审核",
            authorName: "Alice",
            status: "pending",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          {
            id: "material-2",
            type: "material",
            title: "已通过资料",
            summary: "已经完成治理",
            authorName: "Bob",
            status: "approved",
            createdAt: "2026-06-02T12:05:00Z",
            updatedAt: "2026-06-02T12:05:00Z"
          }
        ]);
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("待审帖子");
    expect(wrapper.text()).toContain("已通过资料");
    expect(wrapper.findAll('[data-admin-moderation-row="true"]')).toHaveLength(2);

    await wrapper.get('[data-moderation-status-filter="true"]').setValue("pending");
    await flushPromises();

    expect(wrapper.text()).toContain("待审帖子");
    expect(wrapper.text()).not.toContain("已通过资料");
    expect(wrapper.findAll('[data-admin-moderation-row="true"]')).toHaveLength(1);
    expect(wrapper.find('[data-moderation-row="post-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-moderation-row="material-2"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("1 / 2");
  });

  it("filters governance rows locally by status through the shared select", async () => {
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

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/users?limit=20") {
        return apiPayload([
          {
            id: "user-1",
            username: "alice",
            email: "alice@example.test",
            role: "student",
            status: "active"
          },
          {
            id: "user-2",
            username: "bob",
            email: "bob@example.test",
            role: "student",
            status: "disabled"
          }
        ]);
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("alice");
    expect(wrapper.text()).toContain("bob");
    expect(wrapper.findAll("[data-record-row]")).toHaveLength(2);

    await wrapper.get('[data-governance-status-filter="true"]').setValue("disabled");
    await flushPromises();

    expect(wrapper.text()).toContain("bob");
    expect(wrapper.findAll("[data-record-row]")).toHaveLength(1);
    expect(wrapper.find('[data-record-row="user-1"]').exists()).toBe(false);
    expect(wrapper.find('[data-record-row="user-2"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("1 / 2");
  });

  it("surfaces a conflict governance state when an ai task action returns 409 and keeps the current rows visible", async () => {
    window.history.replaceState({}, "", "/admin/ai");
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

    const aiTaskRow = {
      id: "task-1",
      userId: "user-9",
      taskType: "reader.generate_cards",
      sourceType: "material",
      sourceId: "material-1",
      status: "failed",
      model: "local-draft-engine",
      inputTokens: 120,
      outputTokens: 0,
      errorMessage: "timeout"
    };
    const retryPath = "/api/v1/admin/ai/tasks/task-1/retry";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/ai/tasks?limit=20") {
        return apiPayload([aiTaskRow]);
      }
      if (path === "/api/v1/admin/ai/usage") {
        return apiPayload({
          totalTasks: 1,
          completedTasks: 0,
          failedTasks: 1,
          totalInputTokens: 120,
          totalOutputTokens: 0,
          totalCostUnits: 0
        });
      }
      if (path === retryPath) {
        expect(init?.method).toBe("POST");
        return new Response(
          JSON.stringify({ success: false, error: { code: "invalid_ai_task_transition", message: "该任务已经不再处于可重试状态" } }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(wrapper.text()).toContain("reader.generate_cards");

    await wrapper.get('[data-governance-action="retry"]').trigger("click");
    await flushPromises();
    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      retryPath,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
    expect(wrapper.text()).toContain("存在冲突");
    expect(wrapper.text()).toContain("治理动作存在冲突");
    expect(wrapper.text()).toContain("该任务已经不再处于可重试状态");
    expect(wrapper.text()).toContain("reader.generate_cards");
  });
});
