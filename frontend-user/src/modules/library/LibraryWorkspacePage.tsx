import { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import type { AuthSession } from "../../api/client";
import { ConfirmDialog, DataState, Tag } from "../../design-system/primitives";
import { LibraryDocumentDetail } from "./LibraryDocumentDetail";
import { LibraryDocumentEditor } from "./LibraryDocumentEditor";
import { documentFileKind, type LibraryMode } from "./libraryDocument";
import { useLibraryWorkspace } from "./useLibraryWorkspace";
import { LibraryBookshelf } from "./LibraryBookshelf";
import { LibraryStoragePanel } from "./LibraryStoragePanel";
import { OfficialCatalogControls } from "./OfficialCatalogControls";
import type { LibraryBookSort, LibraryReadingFilter } from "./libraryReading";
import "./library.css";

export function LibraryWorkspacePage(props: { mode: LibraryMode; session: AuthSession | null }) {
  return <LibraryWorkspaceContent key={`${props.mode}:${props.session?.user.id || "anonymous"}:${props.session?.user.role || "guest"}`} {...props} />;
}

function LibraryWorkspaceContent(props: { mode: LibraryMode; session: AuthSession | null }) {
  const location = useLocation();
  const parameters = new URLSearchParams(location.search);
  const workspace = useLibraryWorkspace(props.mode, props.session, parameters.get("selected") || "", parameters.get("manage") === "1");
  const official = props.mode === "official";
  const canCreate = Boolean(props.session && (!official || props.session.user.role === "admin"));
  const removeCollection = workspace.remove?.action === "uncollect";
  const restoring = workspace.remove?.action === "restore";
  const removeLabel = removeCollection ? "确认移出" : restoring ? "确认重新上架" : official ? "确认下架" : "确认删除";
  const cancelRemove = useCallback(() => { if (!workspace.busy) workspace.setRemove(null); }, [workspace.busy, workspace.setRemove]);

  if (!official && !props.session) return <DataState action={<Link to="/login">登录</Link>} description="登录后管理私有文件、阅读进度和个人批注。" kind="unauthorized" title="请登录个人知识库" />;

  return (
    <div className={`document-library-workspace${official ? "" : " document-library-workspace--bookshelf"}`}>
      <header className="library-workspace-header">
        <div><p className="eyebrow">{official ? "精选学习来源" : "MY BOOKSHELF · 我的学习空间"}</p><h1>{official ? "官方资料库" : "个人知识库"}</h1><p>{official ? "平台维护的学习资料，收藏后在个人空间继续阅读与批注。" : "把读过的、想读的，放进自己的书架。上传 PDF，开始下一次阅读。"}</p></div>
        <div className="detail-actions">
          <Link className="secondary-button" to={official ? "/library" : "/official-materials"}>{official ? "我的知识库" : "浏览官方资料"}</Link>
          {canCreate ? <button className="primary-button" disabled={Boolean(workspace.busy)} onClick={() => workspace.startEditor()} type="button">{official ? "发布官方资料" : "上传资料"}</button> : null}
          {official && props.session?.user.role === "admin" ? <button className="secondary-button" aria-pressed={workspace.managing} disabled={Boolean(workspace.busy)} onClick={workspace.toggleManagement} type="button">{workspace.managing ? "返回公开目录" : "管理官方资料"}</button> : null}
        </div>
      </header>
      {props.session && (!official || canCreate) ? <LibraryStoragePanel key={props.session.user.id} session={props.session} revision={workspace.storageRevision} /> : null}
      {workspace.message ? <p className="library-feedback" role="status">{workspace.message}</p> : null}
      {workspace.selectionError ? <p className="library-feedback" role="alert">{workspace.selectionError}</p> : null}
      {workspace.editor ? <LibraryDocumentEditor
        busy={workspace.busy === "save"} error={workspace.editorError} key={workspace.editor.material?.id || "new"}
        material={workspace.editor.material} mode={props.mode} onCancel={() => workspace.setEditor(null)}
        onSave={(draft, file) => void workspace.save(draft, file)}
      /> : null}
      <div className="library-workspace-grid">
        <section className="library-document-list" aria-label={official ? "官方资料列表" : "个人资料列表"}>
          {official ? <OfficialCatalogControls query={workspace.catalogQuery} categories={workspace.categories} total={workspace.catalogTotal} loading={workspace.loading} managing={Boolean(workspace.managing)} onChange={workspace.changeCatalog} /> : <div className="library-filters">
            <label>搜索资料<input onChange={(event) => workspace.setKeyword(event.target.value)} placeholder="标题、标签或文件名" type="search" value={workspace.keyword} /></label>
            {!official ? <label>文件夹筛选<select onChange={(event) => workspace.setFolder(event.target.value)} value={workspace.folder}><option value="">全部文件夹</option>{workspace.folders.map((folder) => <option key={folder} value={folder}>{folder}</option>)}</select></label> : null}
            {!official ? <label>阅读状态<select value={workspace.readingFilter} onChange={(event) => workspace.setReadingFilter(event.target.value as LibraryReadingFilter)}><option value="all">全部状态</option><option value="unread">未开始</option><option value="reading">阅读中</option><option value="completed">已读完</option></select></label> : null}
            {!official ? <label>书架排序<select value={workspace.bookSort} onChange={(event) => workspace.setBookSort(event.target.value as LibraryBookSort)}><option value="updated">最近更新</option><option value="recently-read">最近阅读</option><option value="title">书名排序</option></select></label> : null}
            <span>{workspace.visibleItems.length} {official ? "份资料" : "本藏书"}</span>
          </div>}
          {workspace.loading ? <DataState description="正在读取资料与收藏状态。" kind="loading" title="加载资料中" /> : null}
          {workspace.loadError ? <DataState action={<button className="secondary-button" onClick={() => void workspace.load()} type="button">重新加载</button>} description={workspace.loadError} kind={workspace.items.length ? "stale" : "error"} title="资料列表需要刷新" /> : null}
          {!workspace.loading && !workspace.loadError && !workspace.visibleItems.length ? <DataState
            action={!official && canCreate ? <button className="primary-button" onClick={() => workspace.startEditor()} type="button">上传第一份资料</button> : undefined}
            description={workspace.items.length ? "尝试其他关键词或文件夹。" : official ? "官方资料发布后会出现在这里。" : "上传 PDF，或从官方资料库收藏学习资料。"}
            kind="empty" title={workspace.items.length ? "没有匹配的资料" : official ? "暂无官方资料" : "知识库还是空的"}
          /> : null}
          {!official ? <LibraryBookshelf session={props.session} books={workspace.visibleItems} selectedId={workspace.selected?.id || ""} onSelect={workspace.setSelectedId} /> : <div className="library-file-rows">{workspace.visibleItems.map((material) => <button
            aria-current={workspace.selected?.id === material.id ? "true" : undefined}
            className={workspace.selected?.id === material.id ? "library-file-row active" : "library-file-row"}
            key={material.id} onClick={() => workspace.setSelectedId(material.id)} type="button"
          >
            <span className="library-file-kind">{documentFileKind(material)}</span>
            <span><strong>{material.title}</strong><small>{material.attachmentName}</small><small>{material.tags?.join(" · ")}</small></span>
            <Tag tone="muted">{material.libraryScope === "official" ? official ? "官方" : "官方收藏" : "私有"}</Tag>
            {workspace.managing ? <Tag tone="muted">{material.status === "approved" ? "已发布" : "已下架"}</Tag> : null}
          </button>)}</div>}
        </section>
        {workspace.selected ? <LibraryDocumentDetail
          busy={Boolean(workspace.busy)} collected={workspace.collectedIds.includes(workspace.selected.id)}
          material={workspace.selected} mode={props.mode} session={props.session}
          onCollect={() => void workspace.collect(workspace.selected!)} onDownload={() => void workspace.download(workspace.selected!)}
          onEdit={() => workspace.startEditor(workspace.selected!)}
          onRemove={() => workspace.requestRemove(workspace.selected!, "delete")}
          onUncollect={() => workspace.requestRemove(workspace.selected!, "uncollect")}
          onRestore={() => workspace.requestRemove(workspace.selected!, "restore")}
        /> : null}
      </div>
      <ConfirmDialog
        confirmLabel={removeLabel} confirming={workspace.busy === "remove"}
        description={removeCollection ? "仅移除收藏，不会删除官方原文件或个人学习记录。" : restoring ? "重新上架后恢复公开访问，原有收藏、阅读进度与批注仍使用同一资料身份。" : official ? <><p>下架后用户将无法继续访问该官方资料，既有学习记录保留。</p><label className="official-archive-reason">下架原因<textarea maxLength={500} value={workspace.archiveReason} disabled={workspace.busy === "remove"} onChange={(event) => workspace.setArchiveReason(event.target.value)} /></label></> : "删除个人资料后将无法从知识库继续访问。请确认已保存需要保留的原文件。"}
        confirmDisabled={Boolean(official && !removeCollection && !restoring && !workspace.archiveReason.trim())}
        errorMessage={workspace.removeError} isOpen={Boolean(workspace.remove)}
        onCancel={cancelRemove} onConfirm={() => void workspace.confirmRemove()}
        title={removeCollection ? "移出个人知识库" : restoring ? "重新上架官方资料" : official ? "下架官方资料" : "删除个人资料"}
      />
    </div>
  );
}
