import type { ReviewInsightDailyPayload } from "../../api/client";
import "./review-history.css";

export function ReviewHistoryTable({ days }: { days: ReviewInsightDailyPayload[] }) {
  if (!days.length) return null;
  const hasReviews = days.some((day) => day.reviewCount > 0);
  return (
    <div className="dashboard-learning-history">
      {!hasReviews ? <p>最近七天尚未复习，开始今日复习后会在这里记录进展。</p> : null}
      <div className="dashboard-learning-history__scroll" tabIndex={0} role="region" aria-label="每日学习记录，可横向滚动">
        <table aria-label="最近七天每日学习记录">
          <thead><tr><th scope="col">日期（UTC）</th><th scope="col">复习次数</th><th scope="col">Again</th><th scope="col">新增薄弱来源</th><th scope="col">持续薄弱</th></tr></thead>
          <tbody>{days.map((day) => (
            <tr key={day.date}><th scope="row">{day.date}</th><td>{day.reviewCount}</td><td>{day.ratingCounts.again ?? 0}</td><td>{day.weakNewCount}</td><td>{day.weakCarryCount}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <small>新增指近七天内首次出现薄弱评分的来源；同一来源每天只统计一次。掌握度为估算值。</small>
    </div>
  );
}
