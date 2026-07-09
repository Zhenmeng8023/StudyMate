package service

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	"studymate/backend/internal/pkg/apperrors"
)

func openAITaskActionTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}

	statements := []string{
		`CREATE TABLE ai_tasks (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			task_type TEXT NOT NULL,
			source_type TEXT,
			source_id TEXT,
			status TEXT NOT NULL,
			model TEXT,
			input_tokens INTEGER NOT NULL DEFAULT 0,
			output_tokens INTEGER NOT NULL DEFAULT 0,
			result_ref_type TEXT,
			result_ref_id TEXT,
			error_message TEXT,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL
		);`,
		`CREATE TABLE audit_logs (
			id TEXT PRIMARY KEY,
			actor_id TEXT NOT NULL,
			action TEXT NOT NULL,
			target TEXT NOT NULL,
			metadata TEXT,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for _, statement := range statements {
		if err := db.Exec(statement).Error; err != nil {
			t.Fatalf("exec schema: %v", err)
		}
	}

	return db
}

func TestHandleAITaskRejectsUnsupportedAction(t *testing.T) {
	db := openAITaskActionTestDB(t)
	service := &Service{
		db:        db,
		auditLogs: adminrepo.NewAuditLogRepository(db),
	}

	err := service.HandleAITask("admin-1", "task-1", "archive")
	if err == nil {
		t.Fatal("expected invalid ai action error")
	}

	appErr, ok := err.(*apperrors.Error)
	if !ok {
		t.Fatalf("expected AppError, got %T", err)
	}
	if appErr.Status != 400 || appErr.Code != "invalid_ai_task_action" {
		t.Fatalf("expected invalid_ai_task_action, got %#v", appErr)
	}
}

func TestHandleAITaskRetriesFailedTaskAndClearsError(t *testing.T) {
	db := openAITaskActionTestDB(t)
	service := &Service{
		db:        db,
		auditLogs: adminrepo.NewAuditLogRepository(db),
	}

	now := time.Date(2026, 7, 9, 12, 0, 0, 0, time.UTC)
	if err := db.Exec(`
		INSERT INTO ai_tasks (id, user_id, task_type, status, model, error_message, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, "task-1", "user-1", "reader.generate_cards", "failed", "local-draft-engine", "timeout", now, now).Error; err != nil {
		t.Fatalf("insert ai task: %v", err)
	}

	if err := service.HandleAITask("admin-1", "task-1", "retry"); err != nil {
		t.Fatalf("HandleAITask retry returned error: %v", err)
	}

	var task struct {
		Status       string
		ErrorMessage string
	}
	if err := db.Table("ai_tasks").Select("status, error_message").Take(&task, "id = ?", "task-1").Error; err != nil {
		t.Fatalf("load ai task: %v", err)
	}
	if task.Status != "pending" || task.ErrorMessage != "" {
		t.Fatalf("expected pending task with cleared error, got %#v", task)
	}

	var audit struct {
		ActorID  string
		Action   string
		Target   string
		Metadata string
	}
	if err := db.Table("audit_logs").Select("actor_id, action, target, metadata").Take(&audit).Error; err != nil {
		t.Fatalf("load audit log: %v", err)
	}
	if audit.ActorID != "admin-1" || audit.Action != "admin.handle.ai_task" || audit.Target != "ai_task" {
		t.Fatalf("unexpected audit row: %#v", audit)
	}

	var metadata map[string]string
	if err := json.Unmarshal([]byte(audit.Metadata), &metadata); err != nil {
		t.Fatalf("decode audit metadata: %v", err)
	}
	if metadata["taskId"] != "task-1" || metadata["action"] != "retry" || metadata["previousStatus"] != "failed" || metadata["status"] != "pending" {
		t.Fatalf("unexpected audit metadata: %#v", metadata)
	}
}

func TestHandleAITaskCancelsPendingTask(t *testing.T) {
	db := openAITaskActionTestDB(t)
	service := &Service{
		db:        db,
		auditLogs: adminrepo.NewAuditLogRepository(db),
	}

	now := time.Date(2026, 7, 9, 12, 0, 0, 0, time.UTC)
	if err := db.Exec(`
		INSERT INTO ai_tasks (id, user_id, task_type, status, model, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, "task-2", "user-1", "graph.generate_cards", "pending", "local-draft-engine", now, now).Error; err != nil {
		t.Fatalf("insert ai task: %v", err)
	}

	if err := service.HandleAITask("admin-1", "task-2", "cancel"); err != nil {
		t.Fatalf("HandleAITask cancel returned error: %v", err)
	}

	var task struct {
		Status string
	}
	if err := db.Table("ai_tasks").Select("status").Take(&task, "id = ?", "task-2").Error; err != nil {
		t.Fatalf("load ai task: %v", err)
	}
	if task.Status != "cancelled" {
		t.Fatalf("expected cancelled task, got %#v", task)
	}
}
