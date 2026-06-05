import type { GraphDocument, GraphEdge, GraphGroup, GraphNode } from "./model.ts";
import { supportedGraphSchemaVersion } from "./model.ts";

export function buildGraphBenchmarkFixture(options: {
  nodeCount?: number;
  edgeCount?: number;
  groupCount?: number;
} = {}): GraphDocument {
  const nodeCount = options.nodeCount ?? 200;
  const edgeCount = options.edgeCount ?? 300;
  const groupCount = options.groupCount ?? 20;
  const nodes: GraphNode[] = Array.from({ length: nodeCount }, (_, index) => ({
    id: `node-${index + 1}`,
    type: index % 5 === 0 ? "material" : index % 5 === 1 ? "note" : index % 5 === 2 ? "card" : index % 5 === 3 ? "ai" : "concept",
    title: `Benchmark Node ${index + 1}`,
    x: (index % 20) * 120,
    y: Math.floor(index / 20) * 110,
    width: 180,
    height: 96,
    source: {
      type: index % 5 === 0 ? "material" : index % 5 === 1 ? "note" : index % 5 === 2 ? "card" : index % 5 === 3 ? "ai" : "free",
      id: index % 5 === 4 ? `free-${index + 1}` : `source-${index + 1}`,
      label: `Source ${index + 1}`
    }
  }));

  const edges: GraphEdge[] = Array.from({ length: edgeCount }, (_, index) => ({
    id: `edge-${index + 1}`,
    kind: index % 3 === 0 ? "curve" : "straight",
    sourceNodeId: nodes[index % nodes.length].id,
    targetNodeId: nodes[(index + 1) % nodes.length].id,
    label: index % 5 === 0 ? "关联" : undefined,
    metadata: index % 17 === 0 ? { targetNodeIds: [nodes[(index + 2) % nodes.length].id] } : undefined
  }));

  const groups: GraphGroup[] = Array.from({ length: groupCount }, (_, index) => {
    const start = Math.floor((index * nodeCount) / groupCount);
    const end = Math.floor(((index + 1) * nodeCount) / groupCount);
    return {
      id: `group-${index + 1}`,
      title: `Benchmark Group ${index + 1}`,
      nodeIds: nodes.slice(start, Math.max(start + 1, end)).map((node) => node.id),
      x: (index % 5) * 430,
      y: Math.floor(index / 5) * 310,
      width: 380,
      height: 260,
      collapsed: false,
      metadata: { fixture: "benchmark" }
    };
  });

  return {
    id: "benchmark-graph",
    version: 1,
    schemaVersion: supportedGraphSchemaVersion,
    viewport: { x: 120, y: 90, zoom: 1 },
    nodes,
    edges,
    groups,
    theme: { density: "comfortable" },
    metadata: { fixture: "200-node-productization" }
  };
}

export function sanitizeGraphExportFilename(name: string, fallback = "studymate-graph"): string {
  const normalized = name
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^-+|-+$/g, "")
    .trim();
  return normalized || fallback;
}
