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
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid StudyMate graph JSON: root must be an object");
  }

  const root = parsed as Record<string, unknown>;
  const wrappedDocument = root.document;
  if (wrappedDocument !== undefined && (!wrappedDocument || typeof wrappedDocument !== "object" || Array.isArray(wrappedDocument))) {
    throw new Error("Invalid StudyMate graph JSON: document must be an object");
  }
  const declaredSchemaVersion = root.schemaVersion ?? (root.document as Record<string, unknown> | undefined)?.schemaVersion;
  const schemaVersion =
    declaredSchemaVersion === undefined || declaredSchemaVersion === null
      ? supportedGraphSchemaVersion
      : Number(declaredSchemaVersion);
  if (schemaVersion !== supportedGraphSchemaVersion) {
    throw new Error(`Unsupported StudyMate graph schema: ${declaredSchemaVersion ?? "missing"}`);
  }

  const rawDocument = (wrappedDocument && typeof wrappedDocument === "object" ? wrappedDocument : root) as GraphDocument;
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
