import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { AuthSession } from "../../api/types";
import { getManagedOfficialVersions, getOfficialVersions, type OfficialVersionHistoryPayload } from "../../api/library";

type Props = { materialId: string; session: AuthSession | null; managing: boolean; busy: boolean; onPublish?: () => void };
export function OfficialVersionHistory({ materialId, session, managing, busy, onPublish }: Props) {
  const [history, setHistory] = useState<OfficialVersionHistoryPayload | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const owner = session?.user.id;
  const token = session?.accessToken;
  const protectedHistory = managing && session?.user.role === "admin";
  useEffect(() => {
    let active = true;
    setHistory(null); setError("");
    const request = protectedHistory ? getManagedOfficialVersions(session!, materialId) : getOfficialVersions(materialId);
    void request.then((result) => {
      if (!active) return;
      if (result.currentMaterialId !== materialId || !Array.isArray(result.items)) throw new Error("版本记录暂不可用。");
      setHistory(result);
    }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "读取版本记录失败，请重试。"); });
    return () => { active = false; };
  }, [materialId, protectedHistory, owner, token, attempt]);
  const target = (id: string) => `/official-materials?${protectedHistory ? "manage=1&" : ""}selected=${encodeURIComponent(id)}`;
  const canPublish = protectedHistory && history?.items[0]?.id === materialId && onPublish;
  return <section className="official-version-history" aria-label="版本记录">
    <header><h3>版本记录</h3>{canPublish ? <button className="secondary-button" disabled={busy} onClick={onPublish} type="button">发布新版</button> : null}</header>
    {!history && !error ? <p role="status">正在读取版本记录…</p> : null}
    {error ? <p role="alert">{error}<button className="ghost-button" type="button" onClick={() => setAttempt((value) => value + 1)}>重新加载版本</button></p> : null}
    {history ? <>
      {history.latestPublishedId && history.latestPublishedId !== materialId ? <Link className="secondary-button" to={target(history.latestPublishedId)}>查看最新版本</Link> : null}
      <ol>{history.items.map((item) => <li key={item.id}>
        <div>{item.id === materialId ? <strong>{item.edition || item.title}<span>当前版本</span></strong> : <Link to={target(item.id)}>{item.edition || item.title}</Link>}
          <small>{new Date(item.createdAt).toLocaleDateString("zh-CN")}{protectedHistory ? ` · ${item.status === "approved" ? "已发布" : "已下架"}` : ""}</small></div>
        {item.changeSummary ? <p>{item.changeSummary}</p> : null}
      </li>)}</ol>
      <p className="muted-copy">各版本使用独立 PDF；旧版批注、笔记、阅读进度和收藏继续保留，不自动迁移到新版。</p>
    </> : null}
  </section>;
}
