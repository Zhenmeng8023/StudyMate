import { FileDown, ScanSearch } from "lucide-react";
import type { GraphValidationIssuePayload } from "../../../api/client";
import type { ImportMode } from "../lib/workspaceControllerHelpers";
import { GraphValidationIssueList } from "./GraphWorkspacePanels";

const importModeLabels: Array<{ mode: ImportMode; label: string }> = [
  { mode: "markdown", label: "Markdown" },
  { mode: "mermaid", label: "Mermaid" },
  { mode: "json", label: "JSON" }
];

export function GraphWorkspaceImportPanel(props: {
  canImport: boolean;
  canValidate: boolean;
  importMode: ImportMode;
  importSource: string;
  onImport: () => void;
  onImportModeChange: (mode: ImportMode) => void;
  onImportSourceChange: (source: string) => void;
  onValidate: () => void;
  saving: boolean;
  validationIssues: GraphValidationIssuePayload[];
}) {
  return (
    <div className="graph-rail-section">
      <div className="section-frame-head compact">
        <div>
          <p className="eyebrow">导入与校验</p>
          <h2>Phase 5 / 8</h2>
        </div>
      </div>

      <div className="graph-segmented" aria-label="图谱导入格式">
        {importModeLabels.map((item) => (
          <button
            className={props.importMode === item.mode ? "ghost-button active" : "ghost-button"}
            key={item.mode}
            onClick={() => props.onImportModeChange(item.mode)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <textarea
        aria-label="图谱导入内容"
        className="graph-import-input"
        onChange={(event) => props.onImportSourceChange(event.target.value)}
        rows={8}
        value={props.importSource}
      />

      <div className="graph-inline-actions">
        <button
          className="secondary-button"
          disabled={!props.canImport || props.saving}
          onClick={props.onImport}
          type="button"
        >
          <FileDown size={16} />
          导入草稿
        </button>
        <button className="secondary-button" disabled={!props.canValidate} onClick={props.onValidate} type="button">
          <ScanSearch size={16} />
          校验图谱
        </button>
      </div>

      <GraphValidationIssueList issues={props.validationIssues} />
    </div>
  );
}
