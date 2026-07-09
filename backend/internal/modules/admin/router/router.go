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
	protected.GET("/users", adminHandler.Users)
	protected.POST("/users/:id/disable", adminHandler.DisableUser)
	protected.POST("/users/:id/activate", adminHandler.ActivateUser)
	protected.GET("/materials", adminHandler.Materials)
	protected.GET("/reports", adminHandler.Reports)
	protected.POST("/reports/:id/resolve", adminHandler.ResolveReport)
	protected.POST("/reports/:id/dismiss", adminHandler.DismissReport)
	protected.GET("/tags", adminHandler.Tags)
	protected.GET("/ai/tasks", adminHandler.AITasks)
	protected.POST("/ai/tasks/:id/retry", adminHandler.RetryAITask)
	protected.POST("/ai/tasks/:id/cancel", adminHandler.CancelAITask)
	protected.GET("/ai/usage", adminHandler.AIUsage)
	protected.GET("/audit-logs", adminHandler.AuditLogs)
	protected.GET("/files", adminHandler.Files)
	protected.GET("/moderation", moderationHandler.List)
	protected.POST("/moderation/posts/:id/approve", moderationHandler.ApprovePost)
	protected.POST("/moderation/posts/:id/reject", moderationHandler.RejectPost)
	protected.POST("/moderation/posts/:id/hide", moderationHandler.HidePost)
	protected.POST("/moderation/materials/:id/approve", moderationHandler.ApproveMaterial)
	protected.POST("/moderation/materials/:id/reject", moderationHandler.RejectMaterial)
	protected.POST("/moderation/materials/:id/hide", moderationHandler.HideMaterial)
}
