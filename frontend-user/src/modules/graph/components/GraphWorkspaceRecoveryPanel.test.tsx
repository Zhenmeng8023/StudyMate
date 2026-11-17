import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  DeckPayload,
  GraphSnapshotPayload
} from "../../../api/client";
import type { GraphCardNoteDraft } from "../features/card-notes/graphCardNoteDrafts";
import { GraphWorkspaceRecoveryPanel } from "./GraphWorkspaceRecoveryPanel";

const deck: DeckPayload = {
  id: "deck-1",
  ownerUserId: "user-1",
  title: "Deck 1",
  description: "",
  visibility: "private",
  cardCount: 0,
  createdAt: "2026-06-05T00:00:00Z",
  updatedAt: "2026-06-05T00:00:00Z"
};

const cardDraft: GraphCardNoteDraft = {
  id: "draft-1",
  title: "Question 1",
  front: "Question 1",
  back: "Answer 1",
  explanation: "From graph node",
  sourceLinks: [{ sourceType: "graph-node", sourceId: "node-1" }]
};

const snapshot: GraphSnapshotPayload = {
  id: "snapshot-1",
  graphId: "graph-1",
  versionNumber: 3,
  summary: "Imported markdown outline",
  createdAt: "2026-06-05T00:00:00Z"
};

describe("GraphWorkspaceRecoveryPanel", () => {
  afterEach(() => cleanup());

  it("delegates card draft generation, editing, commit, and snapshot restore", () => {
    const onCommitCardDrafts = vi.fn();
    const onDraftDeckChange = vi.fn();
    const onDraftFieldChange = vi.fn();
    const onGenerateCards = vi.fn();
    const onRestoreSnapshot = vi.fn();

    render(
      <GraphWorkspaceRecoveryPanel
        canGenerateCards={true}
        cardDrafts={[cardDraft]}
        cardTemplate="basic"
        decks={[deck]}
        onCardTemplateChange={vi.fn()}
        onCommitCardDrafts={onCommitCardDrafts}
        onDraftDeckChange={onDraftDeckChange}
        onDraftFieldChange={onDraftFieldChange}
        onGenerateCards={onGenerateCards}
        onRestoreSnapshot={onRestoreSnapshot}
        saving={false}
        selectedDraftDeckId="deck-1"
        snapshots={[snapshot]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "生成卡片草稿" }));
    expect(onGenerateCards).toHaveBeenCalled();
    expect(screen.getAllByText("Question 1").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("卡片模板")).toHaveClass("ds-select");

    fireEvent.change(screen.getByLabelText("写入 Deck"), { target: { value: "" } });
    expect(onDraftDeckChange).toHaveBeenCalledWith("");

    fireEvent.change(screen.getByDisplayValue("Question 1"), { target: { value: "Question 2" } });
    expect(onDraftFieldChange).toHaveBeenCalledWith("draft-1", "front", "Question 2");

    fireEvent.click(screen.getByRole("button", { name: "确认写入卡组" }));
    expect(onCommitCardDrafts).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "恢复" }));
    expect(onRestoreSnapshot).toHaveBeenCalledWith(3);
  });

  it("allows Basic Reverse and Cloze CardNote templates for graph drafts", () => {
    const onTemplateChange = vi.fn();

    render(
      <GraphWorkspaceRecoveryPanel
        canGenerateCards={true}
        cardDrafts={[cardDraft]}
        cardTemplate="basic_reverse"
        decks={[deck]}
        onCardTemplateChange={onTemplateChange}
        onCommitCardDrafts={vi.fn()}
        onDraftDeckChange={vi.fn()}
        onDraftFieldChange={vi.fn()}
        onGenerateCards={vi.fn()}
        onRestoreSnapshot={vi.fn()}
        saving={false}
        selectedDraftDeckId="deck-1"
        snapshots={[]}
      />
    );

    expect(screen.getByText("Basic Reverse")).toBeInTheDocument();
    expect(screen.getAllByText("Question 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Answer 1").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("卡片模板"), { target: { value: "cloze" } });
    expect(onTemplateChange).toHaveBeenCalledWith("cloze");
  });

  it("disables card generation without a selected node and shows deck guidance", () => {
    render(
      <GraphWorkspaceRecoveryPanel
        canGenerateCards={false}
        cardDrafts={[]}
        cardTemplate="basic"
        decks={[]}
        onCardTemplateChange={vi.fn()}
        onCommitCardDrafts={vi.fn()}
        onDraftDeckChange={vi.fn()}
        onDraftFieldChange={vi.fn()}
        onGenerateCards={vi.fn()}
        onRestoreSnapshot={vi.fn()}
        saving={false}
        selectedDraftDeckId=""
        snapshots={[]}
      />
    );

    expect(screen.getByRole("button", { name: "生成卡片草稿" })).toBeDisabled();
    expect(screen.getByText("卡组准备")).toBeInTheDocument();
  });
});
