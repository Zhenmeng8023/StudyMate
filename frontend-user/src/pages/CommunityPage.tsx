import { useEffect, useState } from "react";
import type { PostSummary } from "../api/client";
import { listPosts } from "../api/client";
import { displayPostBody, displayPostTitle, formatDate, SectionFrame, WorkspaceHeader } from "../app/appShared";

export function CommunityPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);

  useEffect(() => {
    void listPosts().then(setPosts).catch(() => setPosts([]));
  }, []);

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

        <SectionFrame subtitle="动态" title="最新分享">
          <div className="community-feed-toolbar">
            <span>公开分享</span>
            <span>{posts.length} 条内容</span>
          </div>
          <div className="list-stack">
            {posts.length ? posts.map((post) => (
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
            )) : (
              <article className="placeholder-card community-empty-card">
                <strong>社区还没有公开分享</strong>
                <p>新的资料推荐、知识整理和学习讨论会出现在这里。</p>
              </article>
            )}
          </div>
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
