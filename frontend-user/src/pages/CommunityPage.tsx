import { useEffect, useState } from "react";
import type { PostSummary } from "../api/client";
import { listPosts } from "../api/client";
import { displayPostBody, displayPostTitle, formatDate, SectionFrame, WorkspaceHeader } from "../app/appShared";
import { DataState } from "../design-system/primitives";

type CommunityFeedState =
  | {
      kind: "loading" | "error" | "empty" | "stale";
      title: string;
      description: string;
    }
  | null;

export function CommunityPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

  async function loadPosts(options?: { preserveExisting?: boolean }) {
    const preserveExisting = options?.preserveExisting ?? false;
    setLoadingPosts(true);
    setPostsError("");

    if (!preserveExisting) {
      setPosts([]);
    }

    try {
      setPosts(await listPosts());
    } catch (error) {
      setPostsError(error instanceof Error ? error.message : "读取社区动态失败。");
      if (!preserveExisting) {
        setPosts([]);
      }
    } finally {
      setLoadingPosts(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  const feedState: CommunityFeedState = loadingPosts && posts.length === 0
    ? {
        kind: "loading",
        title: "正在加载社区动态",
        description: "准备最近公开分享出来的学习内容。"
      }
    : postsError && posts.length > 0
      ? {
          kind: "stale",
          title: "社区动态需要刷新",
          description: postsError
        }
      : postsError
        ? {
            kind: "error",
            title: "社区动态暂时不可用",
            description: postsError
          }
        : posts.length > 0
          ? null
          : {
              kind: "empty",
              title: "社区还没有公开分享",
              description: "新的资料推荐、知识整理和学习讨论会出现在这里。"
            };

  return (
    <>
      <WorkspaceHeader
        description="浏览来自学习者的资料、观点和知识整理成果；从有价值的分享继续展开自己的学习路径。"
        eyebrow="学习社区"
        title="发现值得继续讨论的学习内容"
      />
      <div className="community-layout community-workspace">
        <SectionFrame slim subtitle="视图" title="当前入口">
          <div className="list-stack dense">
            <div className="quiet-action">
              <strong>推荐流</strong>
              <small>公开帖子和资料分享的统一入口。</small>
            </div>
            <div className="quiet-action">
              <strong>问答区</strong>
              <small>按主题浏览分享内容，并保留清晰的作者、时间与互动线索。</small>
            </div>
          </div>
        </SectionFrame>

        <SectionFrame
          subtitle="动态"
          title="最新分享"
          action={
            <button className="secondary-button" onClick={() => void loadPosts({ preserveExisting: posts.length > 0 })} type="button">
              刷新社区动态
            </button>
          }
        >
          {feedState && feedState.kind !== "stale" ? (
            <DataState
              action={
                feedState.kind === "error" ? (
                  <button className="secondary-button" onClick={() => void loadPosts()} type="button">
                    重新加载
                  </button>
                ) : undefined
              }
              description={feedState.description}
              kind={feedState.kind}
              title={feedState.title}
            />
          ) : (
            <>
              {feedState?.kind === "stale" ? (
                <DataState
                  action={
                    <button className="secondary-button" onClick={() => void loadPosts({ preserveExisting: true })} type="button">
                      重新加载
                    </button>
                  }
                  description={feedState.description}
                  kind={feedState.kind}
                  title={feedState.title}
                />
              ) : null}

              <div className="community-feed-toolbar">
                <span>公开分享</span>
                <span>{posts.length} 条内容</span>
              </div>
              <div className="list-stack">
                {posts.map((post) => (
                  <article className="story-card community-post-card" key={post.id}>
                    <div className="story-card-head">
                      <strong>{displayPostTitle(post)}</strong>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <p>{displayPostBody(post)}</p>
                    <div className="story-card-meta">
                      <span>点赞 {post.likesCount}</span>
                      <span>收藏 {post.favoritesCount}</span>
                      <span>评论 {post.commentsCount}</span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </SectionFrame>

        <SectionFrame slim subtitle="社区指南" title="内容说明">
          <article className="placeholder-card">
            <strong>让分享回到学习目标</strong>
            <p>资料引用、讨论和收藏会围绕可追溯的学习来源呈现，便于后续复盘与延伸阅读。</p>
          </article>
        </SectionFrame>
      </div>
    </>
  );
}
