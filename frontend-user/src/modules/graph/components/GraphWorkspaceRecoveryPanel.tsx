import { Sparkles } from "lucide-react";
import type {
  DeckPayload,
  GraphSnapshotPayload
} from "../../../api/client";
import {
  CardNoteComposer,
  type CardNoteTemplateCode
} from "../../../features/card-notes/CardNoteComposer";
import type { GraphCardNoteDraft } from "../features/card-notes/graphCardNoteDrafts";

export function GraphWorkspaceRecoveryPanel(props: {
  canGenerateCards: boolean;
  cardDrafts: GraphCardNoteDraft[];
  cardTemplate: CardNoteTemplateCode;
  decks: DeckPayload[];
  onCardTemplateChange: (template: CardNoteTemplateCode) => void;
  onCommitCardDrafts: () => void;
  onDraftDeckChange: (deckId: string) => void;
  onDraftFieldChange: (draftId: string, field: "front" | "back", value: string) => void;
  onGenerateCards: () => void;
  onRestoreSnapshot: (versionNumber: number) => void;
  saving: boolean;
  selectedDraftDeckId: string;
  snapshots: GraphSnapshotPayload[];
}) {
  return (
    <div className="graph-rail-section" aria-label="图谱快照与卡片草稿">
      <div className="section-frame-head compact">
        <div>
          <p className="eyebrow">学习反馈</p>
          <h2>快照与卡片草稿</h2>
        </div>
      </div>

      <div className="graph-inline-actions">
        <button className="secondary-button" disabled={!props.canGenerateCards} onClick={props.onGenerateCards} type="button">
          <Sparkles size={16} />
          生成卡片草稿
        </button>
      </div>

      {props.cardDrafts.length ? (
        <>
          <CardNoteComposer
            allowedTemplates={["basic", "basic_reverse", "cloze"]}
            busy={props.saving}
            decks={props.decks}
            drafts={props.cardDrafts}
            onDeckChange={props.onDraftDeckChange}
            onDraftFieldChange={props.onDraftFieldChange}
            onSubmit={props.onCommitCardDrafts}
            onTemplateChange={props.onCardTemplateChange}
            selectedDeckId={props.selectedDraftDeckId}
            submitLabel="确认写入卡组"
            template={props.cardTemplate}
          />
        </>
      ) : !props.decks.length ? (
        <article className="graph-meta-card muted">
          <strong>卡组准备</strong>
          <p>先去复习页创建一个 deck，这里就能把图谱草稿确认写进去。</p>
        </article>
      ) : null}

      <div className="graph-snapshot-list">
        {props.snapshots.map((snapshot) => (
          <article className="graph-snapshot-item" key={snapshot.id}>
            <div>
              <strong>v{snapshot.versionNumber}</strong>
              <span>{snapshot.summary || "图谱变更"}</span>
            </div>
            <button
              className="ghost-button"
              disabled={props.saving}
              onClick={() => props.onRestoreSnapshot(snapshot.versionNumber)}
              type="button"
            >
              恢复
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
