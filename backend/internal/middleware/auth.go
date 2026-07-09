package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	usermodel "studymate/backend/internal/modules/user/model"
	"studymate/backend/internal/pkg/apperrors"
	"studymate/backend/internal/pkg/response"
	"studymate/backend/internal/pkg/security"
)

const (
	ContextUserIDKey   = "currentUserID"
	ContextRoleKey     = "currentUserRole"
	ContextUsernameKey = "currentUsername"
)

type authUserRepository interface {
	FindByID(id string) (*usermodel.User, error)
}

func Authenticate(tokenManager *security.TokenManager, users authUserRepository) gin.HandlerFunc {
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

		user, err := users.FindByID(claims.UserID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				response.Error(ctx, apperrors.New(http.StatusUnauthorized, "user_not_found", "访问令牌关联的用户不存在"))
			} else {
				response.Error(ctx, apperrors.Internal("验证当前用户状态失败"))
			}
			ctx.Abort()
			return
		}

		if isUserDisabled(user) {
			response.Error(ctx, apperrors.New(http.StatusForbidden, "user_disabled", "当前账号已被禁用"))
			ctx.Abort()
			return
		}

		ctx.Set(ContextUserIDKey, user.ID)
		ctx.Set(ContextRoleKey, user.Role)
		ctx.Set(ContextUsernameKey, user.Username)
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

func isUserDisabled(user *usermodel.User) bool {
	return strings.EqualFold(strings.TrimSpace(user.Status), "disabled")
}
