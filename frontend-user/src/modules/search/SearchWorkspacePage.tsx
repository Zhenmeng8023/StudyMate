import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AuthSession,
  GraphSummaryPayload,
  MaterialPayload,
  NotePayload,
  PostSummary,
  listGraphs,
  listMaterials,
  listNotes,
  listPosts
} from "../../api/client";

function useSearchKeyword() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q")?.trim() ?? "";
  }, [location.search]);
}

function includesKeyword(values: Array<string | undefined>, keyword: string) {
  return values.some((value) => value?.toLowerCase().includes(keyword));
}

export function SearchWorkspacePage(props: { session: AuthSession | null }) {
  const keyword = useSearchKeyword();
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [notes, setNotes] = useState<NotePayload[]>([]);
  const [graphs, setGraphs] = useState<GraphSummaryPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("正在加载搜索索引...");

  useEffect(() => {
    let canceled = false;

    async function loadSearchSources() {
      setLoading(true);
      setMessage("正在加载搜索索引...");
      try {
        const [materialItems, postItems, noteItems, graphItems] = await Promise.all([
          listMaterials(),
          listPosts(),
          props.session ? listNotes(props.session) : Promise.resolve([]),
          props.session ? listGraphs(props.session) : Promise.resolve([])
        ]);

        if (canceled) {
          return;
        }

        setMaterials(materialItems);
        setPosts(postItems);
        setNotes(noteItems);
        setGraphs(graphItems);
        setMessage("搜索数据已同步");
      } catch (error) {
        if (canceled) {
          return;
        }
        setMessage(error instanceof Error ? error.message : "搜索数据加载失败");
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    }

    void loadSearchSources();
    return () => {
      canceled = true;
    };
  }, [props.session]);

  const normalized = keyword.toLowerCase();

  const materialResults = useMemo(() => {
    if (!normalized) {
      return [];
    }
    return materials.filter((item) =>
      includesKeyword([item.title, item.description, item.category, ...item.tags], normalized)
    );
  }, [materials, normalized]);

  const postResults = useMemo(() => {
    if (!normalized) {
      return [];
    }
    return posts.filter((item) => includesKeyword([item.title, item.body, item.authorName], normalized));
  }, [normalized, posts]);

  const noteResults = useMemo(() => {
    if (!normalized) {
      return [];
    }
    return notes.filter((item) =>
      includesKeyword([item.title, item.summary, item.content, item.folderName, ...item.tags], normalized)
    );
  }, [normalized, notes]);

  const graphResults = useMemo(() => {
    if (!normalized) {
      return [];
    }
    return graphs.filter((item) => includesKeyword([item.title, item.description], normalized));
  }, [graphs, normalized]);

  const totalResults = materialResults.length + postResults.length + noteResults.length + graphResults.length;

  return (
    <>
      <header className="workspace-header">
        <div>
          <p className="eyebrow">全站搜索</p>
          <h1>{keyword ? `“${keyword}”` : "输入关键词开始搜索"}</h1>
          <p className="header-copy">
            当前搜索覆盖帖子、资料，以及已登录用户可访问的笔记和图谱。
          </p>
        </div>
      </header>

      <div className="search-workspace">
        <section className="section-frame">
          <div className="section-frame-head">
            <div>
              <p className="eyebrow">结果概览</p>
              <h2>{loading ? "加载中" : `${totalResults} 条结果`}</h2>
            </div>
          </div>
          <p className="panel-copy">{message}</p>
          {!keyword ? <p className="panel-copy">在顶部搜索框输入关键词并按回车。</p> : null}
        </section>

        <section className="search-section-grid">
          <article className="section-frame slim">
            <div className="section-frame-head">
              <div>
                <p className="eyebrow">资料</p>
                <h2>{materialResults.length}</h2>
              </div>
            </div>
            <div className="search-result-list">
              {materialResults.slice(0, 8).map((item) => (
                <Link className="search-result-card" key={item.id} to="/materials">
                  <strong>{item.title}</strong>
                  <span>{item.category || "资料"}</span>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </article>

          <article className="section-frame slim">
            <div className="section-frame-head">
              <div>
                <p className="eyebrow">社区</p>
                <h2>{postResults.length}</h2>
              </div>
            </div>
            <div className="search-result-list">
              {postResults.slice(0, 8).map((item) => (
                <Link className="search-result-card" key={item.id} to={`/community?selected=${item.id}`}>
                  <strong>{item.title}</strong>
                  <span>{item.authorName}</span>
                  <p>{item.body}</p>
                </Link>
              ))}
            </div>
          </article>

          <article className="section-frame slim">
            <div className="section-frame-head">
              <div>
                <p className="eyebrow">笔记</p>
                <h2>{noteResults.length}</h2>
              </div>
            </div>
            <div className="search-result-list">
              {noteResults.slice(0, 8).map((item) => (
                <Link className="search-result-card" key={item.id} to={`/notes?selected=${item.id}`}>
                  <strong>{item.title}</strong>
                  <span>{item.folderName || "笔记"}</span>
                  <p>{item.summary || item.content}</p>
                </Link>
              ))}
            </div>
          </article>

          <article className="section-frame slim">
            <div className="section-frame-head">
              <div>
                <p className="eyebrow">图谱</p>
                <h2>{graphResults.length}</h2>
              </div>
            </div>
            <div className="search-result-list">
              {graphResults.slice(0, 8).map((item) => (
                <Link className="search-result-card" key={item.id} to="/graph">
                  <strong>{item.title}</strong>
                  <span>{item.nodeCount} 节点 · {item.edgeCount} 连线</span>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </article>
        </section>
      </div>
    </>
  );
}
