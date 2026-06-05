import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  DeckPayload,
  GraphCardDraftPayload,
  GraphSnapshotPayload
} from "../../../api/client";
import { GraphWorkspaceRecoveryPanel } from "./GraphWorkspaceRecoveryPanel";

const deck: DeckPayload = {
  id: "deck-1",
  ownerUserId: "user-1",
  title: "期末复习",
  description: "",
  visibility: "private",
  cardCount: 0,
  createdAt: "2026-06-05T00:00:00Z",
  updatedAt: "2026-06-05T00:00:00Z"
};

const cardDraft: GraphCardDraftPayload = {
  id: "draft-1",
  sourceNodeId: "node-1",
  front: "什么是临界区？",
  back: "一次只允许一个进程进入的共享资源访问区。",
  explanation: "来自图谱节点"
};

const snapshot: GraphSnapshotPayload = {
  id: "snapshot-1",
  graphId: "graph-1",
  versionNumber: 3,
  summary: "导入 Markdown 大纲",
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
        decks={[deck]}
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

    fireEvent.click(screen.getByRole("button", { name: /生成卡片草稿/ }));
    expect(onGenerateCards).toHaveBeenCalled();

    fireEvent.change(screen.getByDisplayValue("期末复习"), { target: { value: "" } });
    expect(onDraftDeckChange).toHaveBeenCalledWith("");

    fireEvent.change(screen.getByDisplayValue("什么是临界区？"), { target: { value: "解释临界区" } });
    expect(onDraftFieldChange).toHaveBeenCalledWith("draft-1", "front", "解释临界区");

    fireEvent.click(screen.getByRole("button", { name: /确认写入卡组/ }));
    expect(onCommitCardDrafts).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "恢复" }));
    expect(onRestoreSnapshot).toHaveBeenCalledWith(3);
  });

  it("disables card generation without a selected node and shows deck guidance", () => {
    render(
      <GraphWorkspaceRecoveryPanel
        canGenerateCards={false}
        cardDrafts={[]}
        decks={[]}
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

    expect(screen.getByRole("button", { name: /生成卡片草稿/ })).toBeDisabled();
    expect(screen.getByText("卡组准备")).toBeInTheDocument();
  });
});
