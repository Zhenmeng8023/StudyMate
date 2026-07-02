export type GraphWorkspaceConcurrencySignal = {
  currentVersion: number;
  dirty: boolean;
  graphId: string;
  sessionId: string;
  updatedAt: string;
};

const graphWorkspaceConcurrencyStorageKeyPrefix = "studymate:graph-workspace:presence:";

export function buildGraphWorkspaceConcurrencyStorageKey(graphId: string, sessionId: string) {
  return `${graphWorkspaceConcurrencyStorageKeyPrefix}${graphId}:${sessionId}`;
}

export function buildGraphWorkspaceConcurrencyStorageKeyPrefix(graphId: string) {
  return `${graphWorkspaceConcurrencyStorageKeyPrefix}${graphId}:`;
}

export function getGraphWorkspaceConcurrencyStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function persistGraphWorkspaceConcurrencySignal(
  storage: Pick<Storage, "setItem"> | null,
  signal: GraphWorkspaceConcurrencySignal
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      buildGraphWorkspaceConcurrencyStorageKey(signal.graphId, signal.sessionId),
      JSON.stringify(signal)
    );
  } catch {
    // Ignore browser storage failures and keep the workspace editable.
  }
}

export function clearGraphWorkspaceConcurrencySignal(
  storage: Pick<Storage, "removeItem"> | null,
  graphId: string,
  sessionId: string
) {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(buildGraphWorkspaceConcurrencyStorageKey(graphId, sessionId));
  } catch {
    // Ignore browser storage failures and keep the workspace editable.
  }
}

export function parseGraphWorkspaceConcurrencySignal(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GraphWorkspaceConcurrencySignal> | null;
    if (
      !parsed ||
      typeof parsed.graphId !== "string" ||
      typeof parsed.sessionId !== "string" ||
      typeof parsed.currentVersion !== "number" ||
      typeof parsed.dirty !== "boolean" ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }

    return {
      currentVersion: parsed.currentVersion,
      dirty: parsed.dirty,
      graphId: parsed.graphId,
      sessionId: parsed.sessionId,
      updatedAt: parsed.updatedAt
    } satisfies GraphWorkspaceConcurrencySignal;
  } catch {
    return null;
  }
}
