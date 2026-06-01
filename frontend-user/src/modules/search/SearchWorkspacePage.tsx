import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthSession, SearchGroupPayload, SearchResponsePayload, searchAll } from "../../api/client";

const groupLabels: Record<string, string> = {
  material: "资料",
  post: "社区",
  note: "笔记",
  graph: "图谱",
  card: "卡片"
};

function useSearchKeyword() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q")?.trim() ?? "";
  }, [location.search]);
}

function emptySearchResponse(query: string): SearchResponsePayload {
  return {
    query,
    total: 0,
    groups: ["material", "post", "note", "graph", "card"].map((type) => ({
      type,
      count: 0,
      results: []
    }))
  };
}

export function SearchWorkspacePage(props: { session: AuthSession | null }) {
  const keyword = useSearchKeyword();
  const [payload, setPayload] = useState<SearchResponsePayload>(() => emptySearchResponse(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("输入关键词后开始搜索。");

  useEffect(() => {
    let canceled = false;

    async function runSearch() {
      if (!keyword) {
        setPayload(emptySearchResponse(""));
        setMessage("在顶部搜索框输入关键词并按回车。");
        return;
      }

      setLoading(true);
      setMessage("正在搜索资料、社区，以及你可访问的笔记、图谱和卡片。");
      try {
        const nextPayload = await searchAll(props.session, { query: keyword, limit: 8 });
        if (canceled) {
          return;
        }
        setPayload(nextPayload);
        setMessage(`搜索完成，共 ${nextPayload.total} 条结果。`);
      } catch (error) {
        if (canceled) {
          return;
        }
        setPayload(emptySearchResponse(keyword));
        setMessage(error instanceof Error ? error.message : "搜索失败");
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    }

    void runSearch();
    return () => {
      canceled = true;
    };
  }, [keyword, props.session]);

  const groups = payload.groups.length ? payload.groups : emptySearchResponse(keyword).groups;

  return (
    <>
      <header className="workspace-header">
        <div>
          <p className="eyebrow">全站搜索</p>
          <h1>{keyword ? `"${keyword}"` : "输入关键词开始搜索"}</h1>
          <p className="header-copy">
            v1 搜索通过后端 MySQL fallback 返回分组结果；登录后会附带你的私有笔记、图谱和卡片。
          </p>
        </div>
      </header>

      <div className="search-workspace">
        <section className="section-frame">
          <div className="section-frame-head">
            <div>
              <p className="eyebrow">结果概览</p>
              <h2>{loading ? "加载中" : `${payload.total} 条结果`}</h2>
            </div>
          </div>
          <p className="panel-copy">{message}</p>
        </section>

        <section className="search-section-grid">
          {groups.map((group: SearchGroupPayload) => (
            <article className="section-frame slim" key={group.type}>
              <div className="section-frame-head">
                <div>
                  <p className="eyebrow">{groupLabels[group.type] ?? group.type}</p>
                  <h2>{group.count}</h2>
                </div>
              </div>
              <div className="search-result-list">
                {group.results.map((item) => (
                  <Link className="search-result-card" key={`${item.type}:${item.id}`} to={item.url}>
                    <strong>{item.title}</strong>
                    <span>{item.source}</span>
                    <p>{item.summary}</p>
                  </Link>
                ))}
                {keyword && group.results.length === 0 ? <p className="panel-copy">暂无匹配结果。</p> : null}
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
