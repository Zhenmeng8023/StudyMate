import type { GraphValidationIssuePayload } from "../../../api/client";
import type { GraphSettingsSection } from "../lib/graphSettingsPanel";
import { buildGraphValidationPanelSummary } from "../lib/graphValidationPanel";
import type { ContextMenuState } from "../lib/workspaceControllerHelpers";

const graphShortcutItems = [
  { key: "Shift", description: "\u7a7a\u767d\u5904\u62d6\u52a8\u6846\u9009\u8282\u70b9" },
  { key: "Shift / Ctrl", description: "\u70b9\u51fb\u8282\u70b9\u589e\u52a0\u591a\u9009" },
  { key: "Ctrl/Cmd + A", description: "\u5168\u9009\u5f53\u524d\u53ef\u89c1\u8282\u70b9" },
  { key: "Ctrl/Cmd + S", description: "\u7acb\u5373\u4fdd\u5b58\u56fe\u8c31" },
  { key: "Ctrl/Cmd + Z / Y", description: "\u64a4\u9500\u6216\u91cd\u505a" },
  { key: "F", description: "\u805a\u7126\u5355\u4e2a\u9009\u4e2d\u8282\u70b9" },
  { key: "G", description: "\u4e3a\u5f53\u524d\u9009\u62e9\u5efa\u7acb\u5206\u7ec4" },
  { key: "L", description: "\u8fdb\u5165\u6216\u9000\u51fa\u8fde\u7ebf\u6a21\u5f0f" },
  { key: "0", description: "\u91cd\u7f6e\u753b\u5e03\u89c6\u91ce" },
  { key: "Delete", description: "\u5220\u9664\u9009\u4e2d\u8282\u70b9\u6216\u8fde\u7ebf" },
  { key: "?", description: "\u6253\u5f00\u6216\u5173\u95ed\u5feb\u6377\u952e\u9762\u677f" },
  { key: "Esc", description: "\u9000\u51fa\u8fde\u7ebf\u3001\u6846\u9009\u548c\u63d0\u793a\u9762\u677f" }
] as const;

export function GraphKeyboardGuidePanel(props: { onClose: () => void }) {
  return (
    <div
      aria-label="图谱快捷键"
      className="graph-shortcut-panel"
      role="dialog"
    >
      <div className="graph-shortcut-head">
        <strong>{`\u5feb\u6377\u952e`}</strong>
        <button
          aria-label="关闭快捷键说明"
          className="ghost-button"
          onClick={props.onClose}
          type="button"
        >
          {`\u5173\u95ed`}
        </button>
      </div>
      <div className="graph-shortcut-list">
        {graphShortcutItems.map((item) => (
          <article className="graph-shortcut-item" key={item.key}>
            <kbd>{item.key}</kbd>
            <span>{item.description}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

export function GraphContextMenuPanel(props: {
  contextMenu: ContextMenuState;
  hasSourceTarget: boolean;
  isLinkStartSelected: boolean;
  onCreateCanvasMaterialNode: () => void;
  onCreateCanvasNoteNode: () => void;
  onCreateCanvasTextNode: () => void;
  onCreateGroup: () => void;
  onDeleteEdge: () => void;
  onDeleteNode: () => void;
  onDuplicateNode: () => void;
  onExportPng: () => void;
  onFocusNode: () => void;
  onOpenSource: () => void;
  onToggleEdgeKind: () => void;
  onToggleLinkStart: () => void;
}) {
  const { contextMenu } = props;
  if (!contextMenu) {
    return null;
  }

  return (
    <div
      aria-label="图谱上下文菜单"
      className="graph-context-menu"
      role="menu"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      {contextMenu.nodeId ? (
        <>
          <button className="graph-context-item" onClick={props.onFocusNode} type="button">
            {`\u805a\u7126\u8282\u70b9`}
          </button>
          <button className="graph-context-item" onClick={props.onDuplicateNode} type="button">
            {`\u590d\u5236\u8282\u70b9`}
          </button>
          <button className="graph-context-item" onClick={props.onCreateGroup} type="button">
            {`\u5efa\u7acb\u5206\u7ec4`}
          </button>
          <button className="graph-context-item" onClick={props.onToggleLinkStart} type="button">
            {props.isLinkStartSelected
              ? `\u53d6\u6d88\u8fde\u7ebf\u8d77\u70b9`
              : `\u8bbe\u4e3a\u8fde\u7ebf\u8d77\u70b9`}
          </button>
          {props.hasSourceTarget ? (
            <button className="graph-context-item" onClick={props.onOpenSource} type="button">
              {`\u6253\u5f00\u6765\u6e90`}
            </button>
          ) : null}
          <button className="graph-context-item danger" onClick={props.onDeleteNode} type="button">
            {`\u5220\u9664\u8282\u70b9`}
          </button>
        </>
      ) : contextMenu.edgeId ? (
        <>
          <button className="graph-context-item" onClick={props.onToggleEdgeKind} type="button">
            {`\u5207\u6362\u8fde\u7ebf\u6837\u5f0f`}
          </button>
          <button className="graph-context-item danger" onClick={props.onDeleteEdge} type="button">
            {`\u5220\u9664\u8fde\u7ebf`}
          </button>
        </>
      ) : (
        <>
          <button className="graph-context-item" onClick={props.onCreateCanvasTextNode} type="button">
            {`\u65b0\u5efa\u6982\u5ff5\u8282\u70b9`}
          </button>
          <button className="graph-context-item" onClick={props.onCreateCanvasNoteNode} type="button">
            {`\u65b0\u5efa\u7b14\u8bb0\u8282\u70b9`}
          </button>
          <button className="graph-context-item" onClick={props.onCreateCanvasMaterialNode} type="button">
            {`\u65b0\u5efa\u8d44\u6599\u8282\u70b9`}
          </button>
          <button className="graph-context-item" onClick={props.onExportPng} type="button">
            {`\u5bfc\u51fa PNG`}
          </button>
        </>
      )}
    </div>
  );
}

export function GraphValidationIssueList(props: { issues: GraphValidationIssuePayload[] }) {
  const summary = buildGraphValidationPanelSummary(props.issues);
  if (props.issues.length === 0) {
    return (
      <article className="graph-meta-card muted">
        <strong>{`\u9a8c\u8bc1\u7ed3\u679c`}</strong>
        <p>{summary.statusLabel}</p>
        <p>{`\u8fd9\u91cc\u4f1a\u663e\u793a\u60ac\u7a7a\u8fde\u7ebf\u3001\u7a7a\u6807\u9898\u7b49\u56fe\u8c31\u7ed3\u6784\u95ee\u9898\u3002`}</p>
      </article>
    );
  }

  return (
    <div className="graph-form-stack tight">
      <article className="graph-meta-card">
        <strong>{summary.statusLabel}</strong>
        <div className="graph-source-summary-list">
          {summary.ruleGroups.map((group) => (
            <span className={`graph-source-summary-pill ${group.severity}`} key={group.ruleType}>
              {group.ruleType} · {group.count}
            </span>
          ))}
        </div>
      </article>
      <div className="graph-issue-list">
        {props.issues.map((issue) => (
          <article
            className={`graph-issue-item ${issue.severity}`}
            key={`${issue.ruleType}-${issue.targetId || issue.message}`}
          >
            <strong>{issue.ruleType}</strong>
            <span>{issue.message}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

export function GraphSettingsPanel(props: { sections: GraphSettingsSection[] }) {
  return (
    <div aria-label="图谱设置" className="graph-settings-panel" role="region">
      {props.sections.map((section) => (
        <article
          className={section.tone === "warning" ? "graph-meta-card warning" : "graph-meta-card"}
          key={section.key}
        >
          <span className="eyebrow">{section.eyebrow}</span>
          <strong>{section.title}</strong>
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
