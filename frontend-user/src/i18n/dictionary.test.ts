import { describe, expect, it } from "vitest";
import { sourceLocale, supportedLocales, userDictionary } from "./dictionary";

describe("user i18n dictionary", () => {
  it("keeps placeholder locales aligned with zh-CN keys", () => {
    const sourceKeys = Object.keys(userDictionary[sourceLocale]);

    for (const locale of supportedLocales) {
      expect(Object.keys(userDictionary[locale]).sort()).toEqual([...sourceKeys].sort());
    }
  });
});
