import { describe, expect, it } from "vitest";
import {
  buildGraphWorkspaceConcurrencyStorageKey,
  clearGraphWorkspaceConcurrencySignal,
  parseGraphWorkspaceConcurrencySignal,
  persistGraphWorkspaceConcurrencySignal
} from "./graphWorkspaceConcurrencySignal";

describe("graphWorkspaceConcurrencySignal", () => {
  it("persists and clears per-session graph concurrency signals", () => {
    const storage = window.localStorage;
    const signal = {
      currentVersion: 4,
      dirty: true,
      graphId: "graph-1",
      sessionId: "session-1",
      updatedAt: "2026-07-01T20:00:00Z"
    };

    clearGraphWorkspaceConcurrencySignal(storage, signal.graphId, signal.sessionId);
    persistGraphWorkspaceConcurrencySignal(storage, signal);

    const key = buildGraphWorkspaceConcurrencyStorageKey(signal.graphId, signal.sessionId);
    expect(parseGraphWorkspaceConcurrencySignal(storage.getItem(key))).toMatchObject(signal);

    clearGraphWorkspaceConcurrencySignal(storage, signal.graphId, signal.sessionId);
    expect(storage.getItem(key)).toBeNull();
  });
});
