package repository

import (
	"encoding/json"
	"strings"
)

func MarshalSourceMetadata(metadata map[string]any) string {
	if len(metadata) == 0 {
		return ""
	}

	raw, err := json.Marshal(metadata)
	if err != nil {
		return ""
	}

	return string(raw)
}

func parseSourceMetadata(raw string) map[string]any {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return nil
	}

	var metadata map[string]any
	if err := json.Unmarshal([]byte(trimmed), &metadata); err != nil {
		return nil
	}
	if len(metadata) == 0 {
		return nil
	}

	return metadata
}
