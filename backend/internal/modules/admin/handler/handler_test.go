package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestAdminLimitUsesQueryOrDefault(t *testing.T) {
	gin.SetMode(gin.TestMode)

	cases := []struct {
		name     string
		path     string
		expected int
	}{
		{name: "default", path: "/admin/users", expected: 50},
		{name: "explicit", path: "/admin/users?limit=20", expected: 20},
		{name: "invalid", path: "/admin/users?limit=abc", expected: 0},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
			ctx.Request = httptest.NewRequest(http.MethodGet, tc.path, nil)

			if got := adminLimit(ctx); got != tc.expected {
				t.Fatalf("expected %d, got %d", tc.expected, got)
			}
		})
	}
}
