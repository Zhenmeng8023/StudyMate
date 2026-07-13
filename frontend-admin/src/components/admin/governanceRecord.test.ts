import { describe, expect, it } from "vitest";
import {
  formatGovernanceCell,
  formatGovernanceFieldLabel,
  getGovernanceColumns,
  getGovernanceRecordTitle
} from "./governanceRecord";

describe("governanceRecord helpers", () => {
  it("formats governance cells and record titles through the shared record contract", () => {
    expect(formatGovernanceCell("success")).toBe("success");
    expect(formatGovernanceCell(true)).toBe("是");
    expect(formatGovernanceCell("")).toBe("-");

    expect(
      getGovernanceRecordTitle({
        id: "audit-1",
        action: "moderation.approve",
        status: "success"
      })
    ).toBe("moderation.approve");
  });

  it("formats known field labels and falls back to camel-case splitting", () => {
    expect(formatGovernanceFieldLabel("handledBy")).toBe("处理人");
    expect(formatGovernanceFieldLabel("customFieldName")).toBe("custom Field Name");
  });

  it("orders governance columns through the shared preferred schema and keeps the first seven", () => {
    const columns = getGovernanceColumns([
      {
        id: "task-1",
        customField: "extra",
        errorMessage: "timeout",
        handledBy: "operator",
        model: "draft-engine",
        sourceId: "material-1",
        sourceType: "material",
        status: "failed",
        taskType: "reader.generate_cards",
        title: "AI 卡片任务",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);

    expect(columns).toEqual([
      "title",
      "taskType",
      "status",
      "handledBy",
      "model",
      "errorMessage",
      "sourceType"
    ]);
  });
});
