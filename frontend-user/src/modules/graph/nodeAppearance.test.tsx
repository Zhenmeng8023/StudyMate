import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GraphNodePayload } from "../../api/client";
import { getNodeTone, patchNodeAppearance } from "./nodeAppearance";

function node(overrides: Partial<GraphNodePayload> = {}): GraphNodePayload {
  return {
    id: "node-1",
    type: "material",
    title: "资料节点",
    x: 0,
    y: 0,
    width: 240,
    height: 132,
    ...overrides
  };
}

function ToneLabel(props: { value: GraphNodePayload }) {
  return <span aria-label="node-tone">{getNodeTone(props.value)}</span>;
}

describe("graph node appearance test harness", () => {
  it("renders the default material tone through React Testing Library", () => {
    render(<ToneLabel value={node()} />);

    expect(screen.getByLabelText("node-tone").textContent).toBe("amber");
  });

  it("patches appearance immutably", () => {
    const original = node();
    const updated = patchNodeAppearance(original, { tone: "sage", emphasis: "strong" });

    expect(updated).not.toBe(original);
    expect(getNodeTone(updated)).toBe("sage");
    expect(original.metadata).toBeUndefined();
  });
});
