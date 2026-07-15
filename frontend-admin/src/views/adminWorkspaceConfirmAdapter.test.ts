import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceConfirmAdapter } from "./adminWorkspaceConfirmAdapter";

describe("adminWorkspaceConfirmAdapter", () => {
  it("skips cancel while loading and routes cancel/confirm through keyed handlers", async () => {
    let loading = true;
    const resetAll = vi.fn();
    const buildDialogs = vi.fn(() => []);
    const moderationReset = vi.fn();
    const moderationSubmit = vi.fn(async () => {});
    const createController = vi.fn(() => ({
      buildDialogs,
      resetAll,
      resetHandlers: {
        aiTask: vi.fn(),
        moderation: moderationReset,
        report: vi.fn(),
        template: vi.fn(),
        user: vi.fn()
      },
      submitHandlers: {
        aiTask: vi.fn(async () => {}),
        moderation: moderationSubmit,
        report: vi.fn(async () => {}),
        template: vi.fn(async () => {}),
        user: vi.fn(async () => {})
      }
    }));
    const runConfirmDialogHandler = vi.fn((key, handlers) => handlers[key]());

    const adapter = createAdminWorkspaceConfirmAdapter({
      applyAITaskAction: vi.fn(async () => {}),
      applyModerationAction: vi.fn(async () => {}),
      applyReportAction: vi.fn(async () => {}),
      applyTemplateAction: vi.fn(async () => {}),
      applyUserAction: vi.fn(async () => {}),
      readAITaskAction: () => null,
      readAITaskError: () => "",
      readLoading: () => loading,
      readModerationAction: () => null,
      readModerationError: () => "",
      readReportAction: () => null,
      readReportError: () => "",
      readTemplateAction: () => null,
      readTemplateError: () => "",
      readUserAction: () => null,
      readUserError: () => "",
      runners: {
        createController,
        runConfirmDialogHandler
      },
      setAITaskAction: vi.fn(),
      setAITaskError: vi.fn(),
      setModerationAction: vi.fn(),
      setModerationError: vi.fn(),
      setReportAction: vi.fn(),
      setReportError: vi.fn(),
      setTemplateAction: vi.fn(),
      setTemplateError: vi.fn(),
      setUserAction: vi.fn(),
      setUserError: vi.fn()
    });

    expect(adapter.buildDialogs()).toEqual([]);
    expect(buildDialogs).toHaveBeenCalledTimes(1);

    adapter.cancelDialog("moderation");
    expect(runConfirmDialogHandler).not.toHaveBeenCalled();

    loading = false;
    adapter.cancelDialog("moderation");
    await adapter.confirmDialog("moderation");
    adapter.resetAll();

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
    expect(resetAll).toHaveBeenCalledTimes(1);
  });
});
