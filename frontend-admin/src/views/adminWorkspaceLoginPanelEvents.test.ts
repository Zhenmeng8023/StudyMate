import { describe, expect, it, vi } from "vitest";
import { buildAdminWorkspaceLoginPanelEvents } from "./adminWorkspaceLoginPanelEvents";

describe("adminWorkspaceLoginPanelEvents", () => {
  it("builds the shared AdminLoginPanel event handlers from login actions", () => {
    const login = vi.fn();
    const setLoginValue = vi.fn();
    const setPasswordValue = vi.fn();

    const events = buildAdminWorkspaceLoginPanelEvents({
      login,
      setLoginValue,
      setPasswordValue
    });

    events.submit();
    events.updateLoginValue("operator@example.test");
    events.updatePasswordValue("secret");

    expect(login).toHaveBeenCalledTimes(1);
    expect(setLoginValue).toHaveBeenCalledWith("operator@example.test");
    expect(setPasswordValue).toHaveBeenCalledWith("secret");
  });
});
