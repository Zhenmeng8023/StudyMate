package adminrouter

import (
	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	"studymate/backend/internal/modules/admin/handler"
	"studymate/backend/internal/pkg/security"
)

func RegisterRoutes(
	group *gin.RouterGroup,
	adminHandler *handler.Handler,
	moderationHandler *handler.ModerationHandler,
	tokenManager *security.TokenManager,
) {
	group.POST("/admin/login", adminHandler.Login)

	protected := group.Group("/admin")
	protected.Use(middleware.Authenticate(tokenManager), middleware.RequireRole("admin"))
	protected.GET("/me", adminHandler.Me)
	protected.GET("/overview", adminHandler.Overview)
	protected.GET("/moderation", moderationHandler.List)
	protected.POST("/moderation/posts/:id/approve", moderationHandler.ApprovePost)
	protected.POST("/moderation/posts/:id/reject", moderationHandler.RejectPost)
	protected.POST("/moderation/posts/:id/hide", moderationHandler.HidePost)
	protected.POST("/moderation/materials/:id/approve", moderationHandler.ApproveMaterial)
	protected.POST("/moderation/materials/:id/reject", moderationHandler.RejectMaterial)
	protected.POST("/moderation/materials/:id/hide", moderationHandler.HideMaterial)
}
