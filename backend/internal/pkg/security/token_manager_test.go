package security

import (
	"testing"
	"time"
)

func TestTokenManagerRoundTrip(t *testing.T) {
	manager := NewTokenManager("secret", time.Hour, 24*time.Hour)
	token, _, err := manager.GenerateAccessToken("user-1", "alice", "admin")
	if err != nil {
		t.Fatalf("generate access token failed: %v", err)
	}

	claims, err := manager.ParseAccessToken(token)
	if err != nil {
		t.Fatalf("parse access token failed: %v", err)
	}

	if claims.UserID != "user-1" || claims.Username != "alice" || claims.Role != "admin" {
		t.Fatalf("unexpected claims: %#v", claims)
	}
}
