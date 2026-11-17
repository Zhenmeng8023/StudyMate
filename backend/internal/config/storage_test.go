package config

import (
	"strings"
	"testing"
)

func TestUploadQuotaConfiguration(t *testing.T) {
	for _, tc := range []struct {
		value    string
		expected int64
	}{
		{"", 1073741824}, {"200", 200}, {"0", -1}, {"-1", -1}, {"bad", -1}, {" ", -1}, {"9223372036854775808", -1},
	} {
		t.Run(tc.value, func(t *testing.T) {
			t.Setenv("UPLOAD_USER_QUOTA_BYTES", tc.value)
			cfg := Load()
			if cfg.Storage.UserQuotaBytes != tc.expected {
				t.Fatalf("quota=%d", cfg.Storage.UserQuotaBytes)
			}
			if tc.expected < 0 {
				err := ValidateServerConfig(cfg)
				if err == nil || !strings.Contains(err.Error(), "UPLOAD_USER_QUOTA_BYTES") {
					t.Fatalf("expected quota validation, got %v", err)
				}
			}
		})
	}
}
