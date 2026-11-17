import { Link } from "react-router-dom";
import type { AuthSession, MaterialPayload } from "../../api/client";
import { Tag } from "../../design-system/primitives";
import { documentFileKind, materialTypeLabels, licenseStatusLabels, safeSourceUrl, type LibraryMode } from "./libraryDocument";
import { getLibraryReadingState, readingTarget } from "./libraryReading";
import { LibraryReadingStatus } from "./LibraryReadingStatus";

export function LibraryDocumentDetail(props: {
  material: MaterialPayload;
  mode: LibraryMode;
  session: AuthSession | null;
  collected: boolean;
  busy: boolean;
  onDownload: () => void;
  onCollect: () => void;
  onRemove: () => void;
  onUncollect: () => void;
  onEdit: () => void;
  onRestore?: () => void;
}) {
  const { material, session } = props;
  const official = material.libraryScope === "official";
  const own = props.mode === "personal" && !official && material.ownerUserId === session?.user.id;
  const managesOfficial = props.mode === "official" && session?.user.role === "admin";
  const kind = documentFileKind(material);
  const published = !official || material.status === "approved";
  const source = safeSourceUrl(material.sourceUrl);
  return (
    <section className="library-document-detail" aria-label="资料详情">
      <div className="chip-row"><Tag>{official ? "官方资料" : "仅自己可见"}</Tag><Tag tone="muted">{kind}</Tag>{props.mode === "personal" && official ? <Tag>官方收藏</Tag> : null}</div>
      <h2>{material.title}</h2>
      <p>{material.description}</p>
      <dl className="library-document-metadata">
        <div><dt>原文件</dt><dd>{material.attachmentName || "未关联附件"}</dd></div>
        <div><dt>分类</dt><dd>{material.category}</dd></div>
        {official ? <>
          <div><dt>资料类型</dt><dd>{materialTypeLabels[material.materialType || "other"] || "其他"}</dd></div>
          <div><dt>作者／机构</dt><dd>{material.author || "未补充"}</dd></div>
          <div><dt>来源</dt><dd>{source ? <a href={source} target="_blank" rel="noopener noreferrer">查看来源</a> : "未补充有效来源"}</dd></div>
          <div><dt>出版年份</dt><dd>{material.publicationYear || "未补充"}</dd></div>
          <div><dt>版本说明</dt><dd>{material.edition || "未补充"}</dd></div>
          <div><dt>授权状态</dt><dd>{licenseStatusLabels[material.licenseStatus || "unknown"] || licenseStatusLabels.unknown}</dd></div>
          {managesOfficial ? <div><dt>发布状态</dt><dd>{published ? "已发布" : "已下架"}</dd></div> : null}
        </> : null}
        {own ? <div><dt>文件夹</dt><dd>{material.folderName || "未分类"}</dd></div> : null}
        <div><dt>更新于</dt><dd>{new Date(material.updatedAt).toLocaleDateString("zh-CN")}</dd></div>
      </dl>
      <div className="chip-row">{(material.tags || []).map((tag) => <Tag key={tag} tone="muted">{tag}</Tag>)}</div>
      {!published ? <p className="library-format-notice">已下架：{material.archiveReason || "未记录原因"}。重新上架后恢复公开访问。</p> : null}
      {props.mode === "personal" && kind === "PDF" ? <LibraryReadingStatus book={material} /> : null}
      {kind === "Word" ? <p className="library-format-notice">Word 文件暂不支持在线预览，请下载原文件查看。</p> : kind !== "PDF" ? <p className="library-format-notice">此格式暂不支持在线预览，请下载原文件查看。</p> : null}
      <div className="detail-actions">
        {published ? <>
        {material.attachmentFileId && kind === "PDF" ? <Link className="primary-button" to={session ? readingTarget(material) : "/login"}>{session ? getLibraryReadingState(material).kind !== "unread" ? "继续阅读" : "开始阅读" : "登录后阅读与批注"}</Link> : null}
        {material.attachmentFileId ? session ? <button className="secondary-button" disabled={props.busy} onClick={props.onDownload} type="button">下载原文件</button> : <a className="secondary-button" href={`/api/v1/materials/${encodeURIComponent(material.id)}/attachment?download=1`}>下载原文件</a> : null}
        {official ? session ? <button className="secondary-button" disabled={props.busy} onClick={props.collected ? props.onUncollect : props.onCollect} type="button">{props.collected ? "移出个人知识库" : "加入个人知识库"}</button> : <Link className="secondary-button" to="/login">登录后加入知识库</Link> : null}
        </> : null}
        {own || managesOfficial ? <button className="secondary-button" disabled={props.busy} onClick={props.onEdit} type="button">编辑资料</button> : null}
        {own || managesOfficial && published ? <button className="secondary-button danger" disabled={props.busy} onClick={props.onRemove} type="button">{managesOfficial ? "下架官方资料" : "删除资料"}</button> : null}
        {managesOfficial && !published ? <button className="primary-button" disabled={props.busy} onClick={props.onRestore} type="button">重新上架</button> : null}
      </div>
      <p className="muted-copy">{official ? "收藏保留官方来源，个人阅读进度与批注独立保存。" : "原文件保存在服务器；阅读进度与批注独立保存，下载原文件不包含批注。"}</p>
    </section>
  );
}
