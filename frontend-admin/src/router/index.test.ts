import { describe, expect, it } from "vitest";
import { createAdminAppRouter } from "./index";

describe("createAdminAppRouter", () => {
  it("redirects the root path to the default dashboard route", async () => {
    const router = createAdminAppRouter();

    await router.push("/");
    await router.isReady();

    expect(router.currentRoute.value.fullPath).toBe("/admin/dashboard");
  });

  it("resolves governance routes to the matching admin path", async () => {
    const router = createAdminAppRouter();

    await router.push("/admin/users");
    await router.isReady();

    expect(router.currentRoute.value.fullPath).toBe("/admin/users");
    expect(router.currentRoute.value.matched.at(-1)?.path).toBe("/admin/users");
  });
});
