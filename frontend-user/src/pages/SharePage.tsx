import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShareResolvePayload, resolveShareLink } from "../api/client";
import { DataState } from "../design-system/primitives";

type SharePreviewState =
  | {
      kind: "loading" | "error" | "empty";
      title: string;
      description: string;
    }
  | null;

export function SharePage() {
  const params = useParams();
  const token = params.token ?? "";
  const [payload, setPayload] = useState<ShareResolvePayload | null>(null);
  const [loadingShare, setLoadingShare] = useState(true);
  const [shareError, setShareError] = useState("");

  async function loadShare() {
    setLoadingShare(true);
    setShareError("");
    setPayload(null);

    try {
      setPayload(await resolveShareLink(token));
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "分享链接不可用");
    } finally {
      setLoadingShare(false);
    }
  }

  useEffect(() => {
    void loadShare();
  }, [token]);

  const shareState: SharePreviewState = loadingShare && !payload
    ? {
        kind: "loading",
        title: "正在读取分享内容",
        description: "正在解析这条只读分享链接和关联学习资产。"
      }
    : shareError
      ? {
          kind: "error",
          title: "分享内容暂时不可用",
          description: shareError
        }
      : payload
        ? null
        : {
            kind: "empty",
            title: "分享内容暂未就绪",
            description: "这条分享链接当前还没有可展示的只读内容。"
          };

  return (
    <div className="search-workspace share-workspace">
      <section className="section-frame share-preview-card">
        <p className="eyebrow">只读分享</p>
        <h1>{payload?.title ?? "StudyMate 分享"}</h1>
        {shareState ? (
          <DataState
            action={
              shareState.kind === "error" || shareState.kind === "empty" ? (
                <button className="secondary-button" onClick={() => void loadShare()} type="button">
                  重新加载
                </button>
              ) : undefined
            }
            description={shareState.description}
            kind={shareState.kind}
            title={shareState.title}
          />
        ) : payload ? (
          <>
            <p className="panel-copy">这是只读分享预览。</p>
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
          </>
        ) : null
        }
      </section>
    </div>
  );
}
