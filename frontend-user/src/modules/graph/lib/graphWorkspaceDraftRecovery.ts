import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";
import { cloneDocument, normalizeDocument, rebuildDetail } from "./workspaceControllerHelpers";

export type GraphWorkspaceLocalDraft = {
  currentVersion: number;
  description: string;
  document: GraphDocumentPayload;
  graphId: string;
  savedAt: string;
  title: string;
};

export function buildGraphWorkspaceDraftStorageKey(graphId: string) {
  return `studymate:graph-workspace:draft:${graphId}`;
}

export function getGraphWorkspaceDraftStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function persistGraphWorkspaceLocalDraft(
  storage: Pick<Storage, "setItem"> | null,
  detail: GraphDetailPayload,
  savedAt = new Date().toISOString()
) {
  if (!storage) {
    return;
  }

  try {
    const draft: GraphWorkspaceLocalDraft = {
      currentVersion: detail.currentVersion,
      description: detail.description,
      document: normalizeDocument(detail.id, detail.currentVersion, cloneDocument(detail.document)),
      graphId: detail.id,
      savedAt,
      title: detail.title
    };
    storage.setItem(buildGraphWorkspaceDraftStorageKey(detail.id), JSON.stringify(draft));
  } catch {
    // Ignore browser storage failures and keep the workspace editable.
  }
}

export function readGraphWorkspaceLocalDraft(storage: Pick<Storage, "getItem"> | null, graphId: string) {
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(buildGraphWorkspaceDraftStorageKey(graphId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<GraphWorkspaceLocalDraft> | null;
    if (
      !parsed ||
      parsed.graphId !== graphId ||
      typeof parsed.currentVersion !== "number" ||
      typeof parsed.title !== "string" ||
      typeof parsed.description !== "string" ||
      typeof parsed.savedAt !== "string" ||
      !parsed.document
    ) {
      return null;
    }
    return {
      ...parsed,
      document: cloneDocument(parsed.document as GraphDocumentPayload)
    } as GraphWorkspaceLocalDraft;
  } catch {
    return null;
  }
}

export function clearGraphWorkspaceLocalDraft(storage: Pick<Storage, "removeItem"> | null, graphId: string) {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(buildGraphWorkspaceDraftStorageKey(graphId));
  } catch {
    // Ignore browser storage failures and keep the workspace editable.
  }
}

export function recoverGraphWorkspaceLocalDraft(detail: GraphDetailPayload, draft: GraphWorkspaceLocalDraft | null) {
  if (!draft || draft.graphId !== detail.id) {
    return {
      detail,
      recovered: false,
      stale: false
    };
  }

  if (draft.currentVersion !== detail.currentVersion) {
    return {
      detail,
      recovered: false,
      stale: true
    };
  }

  const document = normalizeDocument(detail.id, detail.currentVersion, cloneDocument(draft.document));
  const recovered = rebuildDetail(
    {
      ...detail,
      description: draft.description,
      title: draft.title
    },
    document
  );

  return {
    detail: recovered,
    recovered: true,
    stale: false
  };
}
