import { describe, expect, it } from "vitest";
import { adminDictionary, sourceLocale, supportedLocales } from "./dictionary";

describe("admin i18n dictionary", () => {
  it("keeps placeholder locales aligned with zh-CN keys", () => {
    const sourceKeys = Object.keys(adminDictionary[sourceLocale]);

    for (const locale of supportedLocales) {
      expect(Object.keys(adminDictionary[locale]).sort()).toEqual([...sourceKeys].sort());
    }
  });
});
