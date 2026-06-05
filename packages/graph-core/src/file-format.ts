import type { GraphDocument, StudymateGraphFile } from "./model.ts";
import { cloneRecord, studymateGraphExtension, studymateGraphMimeType, supportedGraphSchemaVersion } from "./model.ts";
import { normalizeGraphDocument, validateGraphDocument } from "./validation.ts";

export function serializeStudymateGraphJson(
  document: GraphDocument,
  metadata: Record<string, unknown> = {}
): string {
  const normalized = normalizeGraphDocument(document.id, document.version, document);
  return JSON.stringify(
    {
      mimeType: studymateGraphMimeType,
      extension: studymateGraphExtension,
      schemaVersion: supportedGraphSchemaVersion,
      document: normalized,
      metadata
    },
    null,
    2
  );
}

export function parseStudymateGraphJson(
  content: string,
  options: { graphId?: string; version?: number; sourceTargets?: Set<string> } = {}
): StudymateGraphFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid StudyMate graph JSON: ${(error as Error).message}`);
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid StudyMate graph JSON: root must be an object");
  }

  const root = parsed as Record<string, unknown>;
  const rawSchemaVersion = Number(root.schemaVersion ?? (root.document as Record<string, unknown> | undefined)?.schemaVersion);
  if (rawSchemaVersion !== supportedGraphSchemaVersion) {
    throw new Error(`Unsupported StudyMate graph schema: ${rawSchemaVersion || "missing"}`);
  }

  const rawDocument = (root.document && typeof root.document === "object" ? root.document : root) as GraphDocument;
  const graphId = options.graphId ?? rawDocument.id;
  const version = options.version ?? rawDocument.version ?? 1;
  const document = normalizeGraphDocument(graphId, version, rawDocument);
  const issues = validateGraphDocument(document, { sourceTargets: options.sourceTargets });

  return {
    mimeType: studymateGraphMimeType,
    extension: studymateGraphExtension,
    schemaVersion: supportedGraphSchemaVersion,
    document,
    metadata: cloneRecord((root.metadata && typeof root.metadata === "object" ? root.metadata : {}) as Record<string, unknown>),
    issues
  };
}
