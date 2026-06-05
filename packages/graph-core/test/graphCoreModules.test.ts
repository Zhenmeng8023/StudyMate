import test from "node:test";
import assert from "node:assert/strict";

import { supportedGraphSchemaVersion } from "../src/model.ts";
import { normalizeGraphDocument, validateGraphDocument } from "../src/validation.ts";
import { parseStudymateGraphJson, serializeStudymateGraphJson } from "../src/file-format.ts";
import { createGraphHistoryState, withGraphHistoryChange } from "../src/history.ts";
import { getLearningGraphTemplates } from "../src/templates.ts";
import { buildGraphBenchmarkFixture } from "../src/fixtures.ts";
import { selectGraphNodesInRect } from "../src/selection.ts";
import { clampGraphZoom } from "../src/viewport.ts";

test("graph-core focused modules expose the same productized graph primitives", () => {
  const document = buildGraphBenchmarkFixture({ nodeCount: 3, edgeCount: 2, groupCount: 1 });

  assert.equal(supportedGraphSchemaVersion, 1);
  assert.equal(normalizeGraphDocument("graph-1", 2, document).version, 2);
  assert.equal(validateGraphDocument(document).filter((issue) => issue.severity === "error").length, 0);
  assert.equal(parseStudymateGraphJson(serializeStudymateGraphJson(document)).schemaVersion, 1);
  assert.equal(withGraphHistoryChange(createGraphHistoryState(document), document, "测试变更").dirty, true);
  assert.equal(getLearningGraphTemplates().length, 4);
  assert.deepEqual(selectGraphNodesInRect(document.nodes, { left: 0, top: 0, right: 300, bottom: 300 }).slice(0, 2), [
    "node-1",
    "node-2"
  ]);
  assert.equal(clampGraphZoom(10), 1.8);
});
