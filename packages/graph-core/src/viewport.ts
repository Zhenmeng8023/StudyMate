import type {
  GraphClientPointProjection,
  GraphMinimapViewportOptions,
  GraphRect,
  GraphStageSize,
  GraphViewport
} from "./model.ts";
import { roundLayoutNumber } from "./utils.ts";

export function clampGraphZoom(value: number, min = 0.55, max = 1.8, fallback = 1): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Number(value.toFixed(2))));
}

export function centerGraphViewportOnRect(options: {
  rect: GraphRect;
  stage: GraphStageSize;
  zoom: number;
}): GraphViewport {
  const zoom = clampGraphZoom(options.zoom);
  const centerX = options.rect.x + options.rect.width / 2;
  const centerY = options.rect.y + options.rect.height / 2;
  return {
    x: roundLayoutNumber(options.stage.width / 2 - centerX * zoom),
    y: roundLayoutNumber(options.stage.height / 2 - centerY * zoom),
    zoom
  };
}

export function projectClientPointToGraph(options: GraphClientPointProjection): { x: number; y: number } {
  const localX = options.clientX - options.stageRect.left;
  const localY = options.clientY - options.stageRect.top;
  const zoom = options.viewport.zoom || 1;
  return {
    x: roundLayoutNumber((localX - options.viewport.x) / zoom),
    y: roundLayoutNumber((localY - options.viewport.y) / zoom)
  };
}

export function zoomGraphViewport(viewport: GraphViewport, delta: number): GraphViewport {
  return {
    x: viewport.x,
    y: viewport.y,
    zoom: clampGraphZoom(viewport.zoom + delta)
  };
}

export function resetGraphViewport(_: GraphViewport, nextViewport: GraphViewport): GraphViewport {
  return {
    x: roundLayoutNumber(nextViewport.x),
    y: roundLayoutNumber(nextViewport.y),
    zoom: clampGraphZoom(nextViewport.zoom)
  };
}

export function buildGraphMinimapViewport(options: GraphMinimapViewportOptions) {
  if (options.stage.width <= 0 || options.stage.height <= 0 || options.viewport.zoom <= 0 || options.scale <= 0) {
    return null;
  }
  const left = Math.max(0, -options.viewport.x / options.viewport.zoom);
  const top = Math.max(0, -options.viewport.y / options.viewport.zoom);
  const width = Math.min(options.world.width, options.stage.width / options.viewport.zoom);
  const height = Math.min(options.world.height, options.stage.height / options.viewport.zoom);
  return {
    left: roundLayoutNumber(left * options.scale),
    top: roundLayoutNumber(top * options.scale),
    width: roundLayoutNumber(width * options.scale),
    height: roundLayoutNumber(height * options.scale)
  };
}
