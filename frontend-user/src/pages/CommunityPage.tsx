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
        description="社区先继续承接真实的公开内容列表，后面再接回发帖、评论、点赞和收藏的重设计界面。"
        eyebrow="社区"
        title="把学习内容的公开分享留在统一风格里"
      />
      <div className="community-layout">
        <SectionFrame slim subtitle="视图" title="当前入口">
          <div className="list-stack dense">
            <div className="quiet-action">
              <strong>推荐流</strong>
              <small>公开帖子和资料分享的统一入口。</small>
            </div>
            <div className="quiet-action">
              <strong>问答区</strong>
              <small>后面会把问题、回答和参考资料挂到同一条讨论链路上。</small>
            </div>
          </div>
        </SectionFrame>

        <SectionFrame subtitle="动态" title="最新分享">
          <div className="list-stack">
            {posts.map((post) => (
              <article className="story-card" key={post.id}>
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
        </SectionFrame>

        <SectionFrame slim subtitle="后续规划" title="下一步">
          <article className="placeholder-card">
            <strong>后面会接回更完整的发帖体验</strong>
            <p>包括分类、封面、资料引用卡片、评论层级和运营推荐位，风格与资料库保持统一。</p>
          </article>
        </SectionFrame>
      </div>
    </>
  );
}
