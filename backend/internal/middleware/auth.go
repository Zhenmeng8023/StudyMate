package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/pkg/response"
	"studymate/backend/internal/pkg/security"
)

const (
	ContextUserIDKey   = "currentUserID"
	ContextRoleKey     = "currentUserRole"
	ContextUsernameKey = "currentUsername"
)

func Authenticate(tokenManager *security.TokenManager) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		header := strings.TrimSpace(ctx.GetHeader("Authorization"))
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			response.Unauthorized(ctx, "缺少有效的访问令牌")
			ctx.Abort()
			return
		}

		tokenString := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
		claims, err := tokenManager.ParseAccessToken(tokenString)
		if err != nil {
			response.Unauthorized(ctx, "访问令牌无效或已过期")
			ctx.Abort()
			return
		}

		ctx.Set(ContextUserIDKey, claims.UserID)
		ctx.Set(ContextRoleKey, claims.Role)
		ctx.Set(ContextUsernameKey, claims.Username)
		ctx.Next()
	}
}

func RequireRole(role string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		currentRole := ctx.GetString(ContextRoleKey)
		if currentRole != role {
			ctx.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "forbidden",
					"message": "当前账号没有访问该资源的权限",
				},
			})
			ctx.Abort()
			return
		}

		ctx.Next()
	}
}
