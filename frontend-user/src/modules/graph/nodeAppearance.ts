import type { GraphNodePayload, GraphNodeMetadataPayload, GraphNodeTone, GraphNodeEmphasis } from "../../api/client";

export type GraphNodeSizePreset = "compact" | "default" | "detail";

type NodeToneTokens = {
  background: string;
  border: string;
  badge: string;
  shadow: string;
  exportFill: string;
  exportStroke: string;
  exportTypeFill: string;
  exportTitleFill: string;
  exportMetaFill: string;
};

const toneTokens: Record<GraphNodeTone, NodeToneTokens> = {
  neutral: {
    background: "rgba(255, 252, 247, 0.94)",
    border: "rgba(41, 88, 70, 0.15)",
    badge: "#7a8b81",
    shadow: "0 12px 28px rgba(61, 47, 24, 0.08)",
    exportFill: "#fffdf9",
    exportStroke: "#adc1b4",
    exportTypeFill: "#7a8b81",
    exportTitleFill: "#25362f",
    exportMetaFill: "#718176"
  },
  sage: {
    background: "rgba(242, 248, 243, 0.98)",
    border: "rgba(84, 132, 103, 0.28)",
    badge: "#587564",
    shadow: "0 14px 30px rgba(61, 110, 82, 0.12)",
    exportFill: "#f2f8f3",
    exportStroke: "#95b3a0",
    exportTypeFill: "#587564",
    exportTitleFill: "#254535",
    exportMetaFill: "#5f7769"
  },
  sky: {
    background: "rgba(242, 247, 251, 0.98)",
    border: "rgba(91, 130, 160, 0.28)",
    badge: "#55748a",
    shadow: "0 14px 30px rgba(74, 116, 154, 0.12)",
    exportFill: "#f2f7fb",
    exportStroke: "#9ab4ca",
    exportTypeFill: "#55748a",
    exportTitleFill: "#243b4a",
    exportMetaFill: "#61798b"
  },
  amber: {
    background: "rgba(251, 246, 235, 0.98)",
    border: "rgba(176, 134, 58, 0.28)",
    badge: "#8d6a1f",
    shadow: "0 14px 30px rgba(161, 119, 44, 0.12)",
    exportFill: "#fbf6eb",
    exportStroke: "#d0ba86",
    exportTypeFill: "#8d6a1f",
    exportTitleFill: "#4b3a18",
    exportMetaFill: "#7f6c3b"
  },
  rose: {
    background: "rgba(252, 244, 242, 0.98)",
    border: "rgba(179, 104, 96, 0.28)",
    badge: "#9c5a55",
    shadow: "0 14px 30px rgba(169, 77, 64, 0.12)",
    exportFill: "#fcf4f2",
    exportStroke: "#d8a9a1",
    exportTypeFill: "#9c5a55",
    exportTitleFill: "#4d2c29",
    exportMetaFill: "#876662"
  }
};

export const graphNodeToneOptions: Array<{ value: GraphNodeTone; label: string }> = [
  { value: "neutral", label: "中性" },
  { value: "sage", label: "绿" },
  { value: "sky", label: "蓝" },
  { value: "amber", label: "金" },
  { value: "rose", label: "红" }
];

export const graphNodeEmphasisOptions: Array<{ value: GraphNodeEmphasis; label: string }> = [
  { value: "default", label: "默认" },
  { value: "strong", label: "重点" },
  { value: "muted", label: "弱化" }
];

export const graphNodeSizePresetOptions: Array<{ value: GraphNodeSizePreset; label: string }> = [
  { value: "compact", label: "紧凑" },
  { value: "default", label: "标准" },
  { value: "detail", label: "展开" }
];

function cloneMetadata(node: GraphNodePayload): GraphNodeMetadataPayload {
  return { ...(node.metadata ?? {}) };
}

function normalizeTone(value: unknown): GraphNodeTone {
  if (typeof value !== "string") {
    return "neutral";
  }

  return graphNodeToneOptions.some((option) => option.value === value) ? (value as GraphNodeTone) : "neutral";
}

function normalizeEmphasis(value: unknown): GraphNodeEmphasis {
  if (typeof value !== "string") {
    return "default";
  }

  return graphNodeEmphasisOptions.some((option) => option.value === value) ? (value as GraphNodeEmphasis) : "default";
}

function defaultToneByType(node: GraphNodePayload): GraphNodeTone {
  if (node.type === "material") {
    return "amber";
  }
  if (node.type === "rich-note" || node.type === "note") {
    return "sage";
  }
  if (node.type === "card") {
    return "rose";
  }
  return "neutral";
}

export function getNodeDetail(node: GraphNodePayload): string {
  const detail = node.metadata?.detail;
  return typeof detail === "string" ? detail : "";
}

export function getNodeTone(node: GraphNodePayload): GraphNodeTone {
  const appearance = node.metadata?.appearance;
  if (appearance && typeof appearance === "object") {
    return normalizeTone((appearance as Record<string, unknown>).tone);
  }
  return defaultToneByType(node);
}

export function getNodeEmphasis(node: GraphNodePayload): GraphNodeEmphasis {
  const appearance = node.metadata?.appearance;
  if (appearance && typeof appearance === "object") {
    return normalizeEmphasis((appearance as Record<string, unknown>).emphasis);
  }
  return "default";
}

export function getNodeToneTokens(node: GraphNodePayload): NodeToneTokens {
  return toneTokens[getNodeTone(node)];
}

export function buildNodeStyle(node: GraphNodePayload, isActive: boolean) {
  const tokens = getNodeToneTokens(node);
  const emphasis = getNodeEmphasis(node);
  const boxShadow =
    emphasis === "strong"
      ? "0 18px 42px rgba(41, 88, 70, 0.2)"
      : emphasis === "muted"
        ? "0 10px 18px rgba(61, 47, 24, 0.05)"
        : tokens.shadow;

  return {
    background: tokens.background,
    borderColor: isActive ? "rgba(41, 88, 70, 0.46)" : tokens.border,
    boxShadow,
    opacity: emphasis === "muted" ? 0.72 : 1
  };
}

export function patchNodeAppearance(
  node: GraphNodePayload,
  patch: {
    detail?: string;
    tone?: GraphNodeTone;
    emphasis?: GraphNodeEmphasis;
  }
): GraphNodePayload {
  const nextMetadata = cloneMetadata(node);
  const nextAppearance: Record<string, unknown> = {};

  const currentAppearance = nextMetadata.appearance;
  if (currentAppearance && typeof currentAppearance === "object") {
    Object.assign(nextAppearance, currentAppearance as Record<string, unknown>);
  }

  if (patch.detail !== undefined) {
    if (patch.detail.trim()) {
      nextMetadata.detail = patch.detail;
    } else {
      delete nextMetadata.detail;
    }
  }

  if (patch.tone !== undefined) {
    nextAppearance.tone = patch.tone;
  }

  if (patch.emphasis !== undefined) {
    nextAppearance.emphasis = patch.emphasis;
  }

  const normalizedTone = normalizeTone(nextAppearance.tone);
  const normalizedEmphasis = normalizeEmphasis(nextAppearance.emphasis);
  if (normalizedTone === defaultToneByType(node) && normalizedEmphasis === "default") {
    delete nextMetadata.appearance;
  } else {
    nextMetadata.appearance = {
      tone: normalizedTone,
      emphasis: normalizedEmphasis
    };
  }

  return {
    ...node,
    metadata: nextMetadata
  };
}

export function resolveNodeSizePreset(node: GraphNodePayload): GraphNodeSizePreset {
  if (node.width >= 300 || node.height >= 156) {
    return "detail";
  }
  if (node.width <= 210 || node.height <= 104) {
    return "compact";
  }
  return "default";
}

export function resizeNodeToPreset(node: GraphNodePayload, preset: GraphNodeSizePreset): GraphNodePayload {
  const sizes: Record<GraphNodeSizePreset, { width: number; height: number }> = {
    compact: { width: 204, height: 102 },
    default: { width: 240, height: 132 },
    detail: { width: 320, height: 164 }
  };

  return {
    ...node,
    width: sizes[preset].width,
    height: sizes[preset].height
  };
}
