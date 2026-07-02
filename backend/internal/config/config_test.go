package config

import (
	"strings"
	"testing"
)

func TestLoadUsesSafeEmptyFallbacksForSensitiveValues(t *testing.T) {
	t.Setenv("JWT_SECRET", "")
	t.Setenv("MYSQL_DSN", "")

	cfg := Load()

	if cfg.Auth.JWTSecret != "" {
		t.Fatalf("expected JWT secret fallback to be empty, got %q", cfg.Auth.JWTSecret)
	}

	if cfg.Database.MySQLDSN != "" {
		t.Fatalf("expected MYSQL_DSN fallback to be empty, got %q", cfg.Database.MySQLDSN)
	}
}

func TestValidateMySQLConfigRequiresDriverAndDSN(t *testing.T) {
	cfg := Config{
		Database: DatabaseConfig{
			Driver:   "",
			MySQLDSN: "",
		},
	}

	err := ValidateMySQLConfig(cfg)
	if err == nil {
		t.Fatal("expected mysql validation error")
	}

	message := err.Error()
	if !strings.Contains(message, "DB_DRIVER is required") {
		t.Fatalf("expected DB_DRIVER requirement in %q", message)
	}

	if !strings.Contains(message, "MYSQL_DSN is required") {
		t.Fatalf("expected MYSQL_DSN requirement in %q", message)
	}
}

func TestValidateServerConfigRejectsPlaceholderSecretAndPartialBootstrap(t *testing.T) {
	cfg := Config{
		Auth: AuthConfig{
			JWTSecret: "change-me-in-local-env",
		},
		Database: DatabaseConfig{
			Driver:   "mysql",
			MySQLDSN: "studymate:real-secret@tcp(127.0.0.1:3306)/studymate?charset=utf8mb4&parseTime=True&loc=Local",
		},
		Bootstrap: BootstrapConfig{
			AdminUsername: "admin",
			AdminEmail:    "admin@studymate.local",
			AdminPassword: "",
		},
	}

	err := ValidateServerConfig(cfg)
	if err == nil {
		t.Fatal("expected server validation error")
	}

	message := err.Error()
	if !strings.Contains(message, "JWT_SECRET must be replaced") {
		t.Fatalf("expected placeholder JWT secret error in %q", message)
	}

	if !strings.Contains(message, "set all ADMIN_BOOTSTRAP_* values or leave all of them empty") {
		t.Fatalf("expected bootstrap completeness error in %q", message)
	}
}

func TestValidateServerConfigAllowsOptionalBootstrapWhenEmpty(t *testing.T) {
	cfg := Config{
		Auth: AuthConfig{
			JWTSecret: "local-dev-secret-not-placeholder",
		},
		Database: DatabaseConfig{
			Driver:   "mysql",
			MySQLDSN: "studymate:real-secret@tcp(127.0.0.1:3306)/studymate?charset=utf8mb4&parseTime=True&loc=Local",
		},
	}

	if err := ValidateServerConfig(cfg); err != nil {
		t.Fatalf("expected valid config, got %v", err)
	}
}
