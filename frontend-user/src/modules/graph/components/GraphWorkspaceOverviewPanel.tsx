import { Trash2 } from "lucide-react";
import type { GraphDetailPayload } from "../../../api/client";
import type { GraphSettingsSection } from "../lib/graphSettingsPanel";
import { GraphSettingsPanel } from "./GraphWorkspacePanels";

export function GraphWorkspaceOverviewPanel(props: {
  graphDetail: GraphDetailPayload | null;
  onDelete: () => void;
  onDescriptionChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  saving: boolean;
  settingsSections: GraphSettingsSection[];
}) {
  return (
    <div className="graph-inspector-stack">
      <section className="graph-inspector-section">
        <div className="graph-inspector-section__head">
          <div>
            <p className="eyebrow">图谱概览</p>
            <h3>当前画布</h3>
          </div>
          {props.graphDetail ? (
            <span className="graph-overview-version">v{props.graphDetail.currentVersion}</span>
          ) : null}
        </div>

        {props.graphDetail ? (
          <div className="graph-form-stack">
            <div className="graph-overview-metrics" aria-label="图谱统计">
              <span><strong>{props.graphDetail.nodeCount}</strong> 节点</span>
              <span><strong>{props.graphDetail.edgeCount}</strong> 连线</span>
            </div>
            <label>
              <span>标题</span>
              <input aria-label="图谱标题" onChange={(event) => props.onTitleChange(event.target.value)} value={props.graphDetail.title} />
            </label>
            <label>
              <span>说明</span>
              <textarea aria-label="图谱说明" onChange={(event) => props.onDescriptionChange(event.target.value)} rows={4} value={props.graphDetail.description} />
            </label>
            <button className="secondary-button danger" disabled={props.saving} onClick={props.onDelete} type="button">
              <Trash2 size={16} />
              删除当前图谱
            </button>
          </div>
        ) : (
          <article className="graph-meta-card muted">
            <strong>尚未打开图谱</strong>
            <p>从资源面板中选择已有图谱，或新建一个空白图谱开始整理。</p>
          </article>
        )}
      </section>

      <section className="graph-inspector-section">
        <div className="graph-inspector-section__head">
          <div>
            <p className="eyebrow">工作区偏好</p>
            <h3>设置与说明</h3>
          </div>
        </div>
        <GraphSettingsPanel sections={props.settingsSections} />
      </section>
    </div>
  );
}
