import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShareResolvePayload, resolveShareLink } from "../api/client";

export function SharePage() {
  const params = useParams();
  const token = params.token ?? "";
  const [payload, setPayload] = useState<ShareResolvePayload | null>(null);
  const [message, setMessage] = useState("正在读取分享链接...");

  useEffect(() => {
    let canceled = false;

    async function loadShare() {
      try {
        const nextPayload = await resolveShareLink(token);
        if (canceled) {
          return;
        }
        setPayload(nextPayload);
        setMessage("这是只读分享预览。");
      } catch (error) {
        if (canceled) {
          return;
        }
        setMessage(error instanceof Error ? error.message : "分享链接不可用");
      }
    }

    void loadShare();
    return () => {
      canceled = true;
    };
  }, [token]);

  return (
    <div className="search-workspace">
      <section className="section-frame">
        <p className="eyebrow">Share</p>
        <h1>{payload?.title ?? "StudyMate 分享"}</h1>
        <p className="panel-copy">{message}</p>
        {payload ? (
          <div className="search-result-list">
            <article className="search-result-card">
              <strong>{payload.title}</strong>
              <span>
                {payload.targetType} / {payload.mode} / 只读
              </span>
              <p>{payload.summary}</p>
              <Link to={payload.url}>打开原始页面</Link>
            </article>
          </div>
        ) : null}
      </section>
    </div>
  );
}
