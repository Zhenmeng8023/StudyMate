import { FileDown, ScanSearch } from "lucide-react";
import type { GraphValidationIssuePayload } from "../../../api/client";
import { Button } from "../../../design-system/primitives";
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
          <p className="eyebrow">图谱工具</p>
          <h2>导入与校验</h2>
        </div>
      </div>

      <div className="graph-segmented" aria-label="图谱导入格式">
        {importModeLabels.map((item) => (
          <Button
            active={props.importMode === item.mode}
            key={item.mode}
            onClick={() => props.onImportModeChange(item.mode)}
            variant="ghost"
          >
            {item.label}
          </Button>
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
        <Button disabled={!props.canImport || props.saving} onClick={props.onImport} variant="secondary">
          <FileDown size={16} />
          导入草稿
        </Button>
        <Button disabled={!props.canValidate} onClick={props.onValidate} variant="secondary">
          <ScanSearch size={16} />
          校验图谱
        </Button>
      </div>

      <GraphValidationIssueList issues={props.validationIssues} />
    </div>
  );
}
