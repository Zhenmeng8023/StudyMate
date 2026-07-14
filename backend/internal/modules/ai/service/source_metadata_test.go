package service

import (
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	aimodel "studymate/backend/internal/modules/ai/model"
	airepo "studymate/backend/internal/modules/ai/repository"
	carddto "studymate/backend/internal/modules/card/dto"
)

func TestRecordReaderCardDraftsPreservesTaskSourceMetadata(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&adminmodel.AuditLog{}, &aimodel.AITask{}, &aimodel.AIUsageLog{}); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := airepo.NewRepository(db)
	service := NewService(repository, nil, adminrepo.NewAuditLogRepository(db))

	_, err = service.RecordReaderCardDrafts("user-1", "material-1", []carddto.CardDraftPayload{
		{
			SourceType:  "annotation",
			SourceID:    "annotation-1",
			SourceLabel: "Annotated paragraph",
			SourceMetadata: map[string]any{
				"materialId":   "material-1",
				"annotationId": "annotation-1",
				"page":         12,
			},
			Front: "What does this annotation highlight?",
			Back:  "The proof invariant.",
		},
	})
	if err != nil {
		t.Fatalf("record reader card drafts: %v", err)
	}

	tasks, err := service.ListTasks("user-1")
	if err != nil {
		t.Fatalf("list tasks: %v", err)
	}
	if len(tasks) != 1 {
		t.Fatalf("expected one task, got %d", len(tasks))
	}

	task := tasks[0]
	if task.SourceType != "material" || task.SourceID != "material-1" {
		t.Fatalf("expected material task source, got %#v", task)
	}
	if task.SourceMetadata == nil {
		t.Fatalf("expected task source metadata to be present")
	}
	if task.SourceMetadata["materialId"] != "material-1" || task.SourceMetadata["annotationId"] != "annotation-1" {
		t.Fatalf("expected task metadata to preserve annotation context, got %#v", task.SourceMetadata)
	}
	page, ok := task.SourceMetadata["page"].(float64)
	if !ok || page != 12 {
		t.Fatalf("expected page 12 in task metadata, got %#v", task.SourceMetadata["page"])
	}
}
