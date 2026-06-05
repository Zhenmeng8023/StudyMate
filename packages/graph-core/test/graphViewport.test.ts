import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGraphMinimapViewport,
  centerGraphViewportOnRect,
  clampGraphZoom,
  projectClientPointToGraph,
  type GraphViewport
} from "../src/index.ts";

const viewport: GraphViewport = { x: 120, y: 90, zoom: 1.25 };

test("clampGraphZoom constrains and rounds zoom values", () => {
  assert.equal(clampGraphZoom(0.1), 0.55);
  assert.equal(clampGraphZoom(4), 1.8);
  assert.equal(clampGraphZoom(1.234), 1.23);
  assert.equal(clampGraphZoom(Number.NaN), 1);
});

test("centerGraphViewportOnRect centers a graph rect in the stage", () => {
  assert.deepEqual(
    centerGraphViewportOnRect({
      rect: { x: 100, y: 80, width: 240, height: 120 },
      stage: { width: 1000, height: 600 },
      zoom: 1.5
    }),
    {
      x: 170,
      y: 90,
      zoom: 1.5
    }
  );
});

test("projectClientPointToGraph converts browser coordinates to graph coordinates", () => {
  assert.deepEqual(
    projectClientPointToGraph({
      clientX: 470,
      clientY: 340,
      stageRect: { left: 50, top: 40 },
      viewport
    }),
    {
      x: 240,
      y: 168
    }
  );
});

test("buildGraphMinimapViewport projects the visible graph window into minimap space", () => {
  assert.deepEqual(
    buildGraphMinimapViewport({
      viewport: { x: -240, y: -120, zoom: 2 },
      stage: { width: 800, height: 400 },
      world: { width: 2400, height: 1600 },
      scale: 0.1
    }),
    {
      left: 12,
      top: 6,
      width: 40,
      height: 20
    }
  );
});

test("buildGraphMinimapViewport returns null when stage is not measurable", () => {
  assert.equal(
    buildGraphMinimapViewport({
      viewport,
      stage: { width: 0, height: 400 },
      world: { width: 2400, height: 1600 },
      scale: 0.1
    }),
    null
  );
});
