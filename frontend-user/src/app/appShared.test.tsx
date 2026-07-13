// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildCardInputsFromDrafts, WorkspaceHeader } from "./appShared";

vi.mock("../design-system/primitives", () => ({
  PageHeader: (props: { title: string; description: string; eyebrow: string; actions?: React.ReactNode }) => (
    <div data-testid="shared-page-header">
      <span>{props.eyebrow}</span>
      <h1>{props.title}</h1>
      <p>{props.description}</p>
      {props.actions}
    </div>
  )
}));

describe("WorkspaceHeader", () => {
  it("renders through the shared page header contract", () => {
    render(
      <WorkspaceHeader
        actions={<button type="button">新建资料</button>}
        description="把主标题、说明和动作区保持在同一套头部骨架里。"
        eyebrow="资料空间"
        title="资料总览"
      />
    );

    expect(screen.getByTestId("shared-page-header")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "资料总览" })).toBeTruthy();
    expect(screen.getByText("把主标题、说明和动作区保持在同一套头部骨架里。")).toBeTruthy();
    expect(screen.getByRole("button", { name: "新建资料" })).toBeTruthy();
  });
});

describe("buildCardInputsFromDrafts", () => {
  it("preserves source metadata for annotation-based review cards", () => {
    const result = buildCardInputsFromDrafts([
      {
        id: "annotation-1",
        draftId: "draft-1",
        sourceType: "annotation",
        sourceId: "annotation-1",
        sourceMetadata: {
          materialId: "material-1",
          annotationId: "annotation-1",
          page: 12
        },
        front: "What does this annotation highlight?",
        back: "The key invariant in the proof."
      }
    ]);

    expect(result).toEqual([
      {
        cardType: "basic",
        draftId: "draft-1",
        front: "What does this annotation highlight?",
        back: "The key invariant in the proof.",
        sourceType: "annotation",
        sourceId: "annotation-1",
        sourceMetadata: {
          materialId: "material-1",
          annotationId: "annotation-1",
          page: 12
        }
      }
    ]);
  });
});
