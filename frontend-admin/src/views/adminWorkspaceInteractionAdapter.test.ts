import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceInteractionAdapter } from "./adminWorkspaceInteractionAdapter";
import type { AdminWorkspaceViewSwitchPlan } from "./adminWorkspaceLifecycle";

describe("adminWorkspaceInteractionAdapter", () => {
  it("routes confirm cancel and submit through keyed handlers while respecting loading state", async () => {
    let loading = true;
    const moderationReset = vi.fn();
    const moderationSubmit = vi.fn(async () => {});
    const runConfirmDialogHandler = vi.fn((key, handlers) => handlers[key]());

    const adapter = createAdminWorkspaceInteractionAdapter({
      clearWorkspaceState: vi.fn(),
      loadActiveView: vi.fn(),
      readLoading: () => loading,
      resetConfirmHandlers: {
        aiTask: vi.fn(),
        moderation: moderationReset,
        report: vi.fn(),
        template: vi.fn(),
        user: vi.fn()
      },
      runners: {
        runConfirmDialogHandler
      },
      setActiveView: vi.fn(),
      setSelectedRecord: vi.fn(),
      submitConfirmHandlers: {
        aiTask: vi.fn(async () => {}),
        moderation: moderationSubmit,
        report: vi.fn(async () => {}),
        template: vi.fn(async () => {}),
        user: vi.fn(async () => {})
      },
      syncLocation: vi.fn()
    });

    adapter.cancelConfirmDialog("moderation");
    expect(runConfirmDialogHandler).not.toHaveBeenCalled();
    expect(moderationReset).not.toHaveBeenCalled();

    loading = false;
    adapter.cancelConfirmDialog("moderation");
    await adapter.confirmDialog("moderation");

    expect(runConfirmDialogHandler).toHaveBeenNthCalledWith(
      1,
      "moderation",
      expect.objectContaining({ moderation: moderationReset })
    );
    expect(runConfirmDialogHandler).toHaveBeenNthCalledWith(
      2,
      "moderation",
      expect.objectContaining({ moderation: moderationSubmit })
    );
    expect(moderationReset).toHaveBeenCalledTimes(1);
    expect(moderationSubmit).toHaveBeenCalledTimes(1);
  });

  it("routes view switching through the shared plan runner and updates selected records", () => {
    const clearWorkspaceState = vi.fn();
    const loadActiveView = vi.fn();
    const setActiveView = vi.fn();
    const setSelectedRecord = vi.fn();
    const syncLocation = vi.fn();
    const buildViewSwitchPlan = vi.fn(
      (): AdminWorkspaceViewSwitchPlan => ({
        nextView: "users",
        resetKeys: ["queries"],
        shouldLoadView: true,
        syncMode: "push"
      })
    );
    const runViewSwitch = vi.fn();

    const adapter = createAdminWorkspaceInteractionAdapter({
      clearWorkspaceState,
      loadActiveView,
      readLoading: () => false,
      resetConfirmHandlers: {
        aiTask: vi.fn(),
        moderation: vi.fn(),
        report: vi.fn(),
        template: vi.fn(),
        user: vi.fn()
      },
      runners: {
        buildViewSwitchPlan,
        runViewSwitch
      },
      setActiveView,
      setSelectedRecord,
      submitConfirmHandlers: {
        aiTask: vi.fn(async () => {}),
        moderation: vi.fn(async () => {}),
        report: vi.fn(async () => {}),
        template: vi.fn(async () => {}),
        user: vi.fn(async () => {})
      },
      syncLocation
    });

    adapter.switchView("users");
    adapter.selectRecord({ id: "record-1", title: "Alice" });

    expect(buildViewSwitchPlan).toHaveBeenCalledWith("users");
    expect(runViewSwitch).toHaveBeenCalledWith(
      {
        nextView: "users",
        resetKeys: ["queries"],
        shouldLoadView: true,
        syncMode: "push"
      },
      {
        clearWorkspaceState,
        loadActiveView,
        setActiveView,
        syncLocation
      }
    );
    expect(setSelectedRecord).toHaveBeenCalledWith({ id: "record-1", title: "Alice" });
  });
});
