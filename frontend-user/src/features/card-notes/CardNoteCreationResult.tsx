import { Link } from "react-router-dom";

export type CardNoteCreationResultData = {
  count: number;
  cardId?: string;
  sourcePath: string;
};

export function CardNoteCreationResult({ result }: { result: CardNoteCreationResultData | null }) {
  if (!result) return null;
  return (
    <section className="studio-draft-card" aria-label="制卡完成">
      <p role="status">{`已生成 ${result.count} 张卡片。`}</p>
      <p className="inline-link-row">
        <Link className="primary-button" to={result.cardId ? `/review?card=${encodeURIComponent(result.cardId)}` : "/review"}>去复习</Link>
        <Link className="secondary-button" to={result.sourcePath}>回到来源</Link>
      </p>
    </section>
  );
}
