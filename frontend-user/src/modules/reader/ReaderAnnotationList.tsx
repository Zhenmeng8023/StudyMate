import { Link } from "react-router-dom";
import type { MaterialPayload, ReaderAnnotationPayload } from "../../api/types";
import { displayAnnotationText, displayMaterialTitle } from "../../app/appShared";
import { DataState } from "../../design-system/primitives";

type Props = {
  material: MaterialPayload;
  annotations: ReaderAnnotationPayload[];
  focusedId: string;
  busy: string;
  onDelete: (id: string) => void;
  onLocate: (annotation: ReaderAnnotationPayload) => void;
};

export function ReaderAnnotationList({ material, annotations, focusedId, busy, onDelete, onLocate }: Props) {
  if (!annotations.length) return <DataState description="选中文本或记录想法后，批注会按页码与来源坐标保留在这里。" kind="empty" title="还没有批注" />;
  return <div className="reader-annotation-list">{annotations.map((annotation) => {
    const noteQuery = new URLSearchParams({ material: material.id, annotation: annotation.id, page: String(annotation.page), quote: annotation.quote, comment: annotation.comment });
    return <article className={`reader-annotation-item${focusedId === annotation.id ? " reader-annotation-item--focused" : ""}`} key={annotation.id}>
      <div className="reader-annotation-item__head"><button className="ghost-button" aria-label={`定位第 ${annotation.page} 页批注`} onClick={() => onLocate(annotation)} type="button"><strong>第 {annotation.page} 页</strong></button><span>{annotation.rects.length ? `${annotation.rects.length} 个坐标片段` : "无坐标片段"}</span></div>
      <p>{displayAnnotationText(annotation)}</p><small>来源：{displayMaterialTitle(material)} / PDF 第 {annotation.page} 页</small>
      <div className="detail-actions"><Link className="secondary-button" to={`/notes?${noteQuery}`}>摘录到笔记</Link><button className="secondary-button danger" disabled={busy === `annotation-${annotation.id}`} onClick={() => onDelete(annotation.id)} type="button">删除批注</button></div>
    </article>;
  })}</div>;
}
