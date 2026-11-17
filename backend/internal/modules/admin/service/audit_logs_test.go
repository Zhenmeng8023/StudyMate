package service

import (
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func TestListAuditLogsFiltersByActionTargetAndActor(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	if err := db.Exec(`
		CREATE TABLE audit_logs (
			id TEXT PRIMARY KEY,
			actor_id TEXT NULL,
			action TEXT NOT NULL,
			target TEXT NOT NULL,
			metadata TEXT NOT NULL,
			created_at DATETIME NOT NULL
		)
	`).Error; err != nil {
		t.Fatalf("create audit logs table: %v", err)
	}
	for _, statement := range []string{
		"INSERT INTO audit_logs (id, actor_id, action, target, metadata, created_at) VALUES ('audit-1', 'admin-1', 'admin.handle.report', 'report', '{}', '2026-07-20T01:00:00Z')",
		"INSERT INTO audit_logs (id, actor_id, action, target, metadata, created_at) VALUES ('audit-2', 'admin-2', 'admin.handle.ai_task', 'ai_task', '{}', '2026-07-20T01:01:00Z')",
		"INSERT INTO audit_logs (id, actor_id, action, target, metadata, created_at) VALUES ('audit-3', 'admin-1', 'admin.handle.user', 'user', '{}', '2026-07-20T01:02:00Z')",
	} {
		if err := db.Exec(statement).Error; err != nil {
			t.Fatalf("seed audit logs: %v", err)
		}
	}

	service := NewService(db, nil, nil, nil, nil, nil)
	rows, err := service.ListAuditLogsWithFilters(50, AuditLogFilters{
		Action:  " admin.handle.report ",
		ActorID: "admin-1",
		Target:  "report",
	})
	if err != nil {
		t.Fatalf("list audit logs: %v", err)
	}
	if len(rows) != 1 || rows[0].ID != "audit-1" {
		t.Fatalf("expected only the matching audit row, got %#v", rows)
	}
}
