import { describe, expect, it } from "vitest";
import {
  layoutShowsGlobalContext,
  layoutShowsGlobalSearch,
  layoutUsesCompactNavigation,
  resolveAppLayoutMode
} from "./layoutPolicy";

describe("layout policy", () => {
  it.each([
    ["/", "standard"],
    ["/materials", "standard"],
    ["/reader", "studio"],
    ["/reader/material-1", "studio"],
    ["/notes", "studio"],
    ["/graph", "canvas"],
    ["/graph?graphId=graph-1", "canvas"],
    ["/review", "focus"]
  ] as const)("maps %s to %s", (pathname, expected) => {
    expect(resolveAppLayoutMode(pathname)).toBe(expected);
  });

  it("keeps the global context panel on standard pages only", () => {
    expect(layoutShowsGlobalContext("standard")).toBe(true);
    expect(layoutShowsGlobalContext("studio")).toBe(false);
    expect(layoutShowsGlobalContext("canvas")).toBe(false);
    expect(layoutShowsGlobalContext("focus")).toBe(false);
  });

  it("uses compact navigation only for high-density workspaces", () => {
    expect(layoutUsesCompactNavigation("standard")).toBe(false);
    expect(layoutUsesCompactNavigation("studio")).toBe(true);
    expect(layoutUsesCompactNavigation("canvas")).toBe(true);
    expect(layoutUsesCompactNavigation("focus")).toBe(false);
  });

  it("does not allocate global search space in canvas and focus workspaces", () => {
    expect(layoutShowsGlobalSearch("standard")).toBe(true);
    expect(layoutShowsGlobalSearch("studio")).toBe(true);
    expect(layoutShowsGlobalSearch("canvas")).toBe(false);
    expect(layoutShowsGlobalSearch("focus")).toBe(false);
  });
});
