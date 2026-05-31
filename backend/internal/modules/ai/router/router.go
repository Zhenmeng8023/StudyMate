package router

import (
	"github.com/gin-gonic/gin"
	aihandler "studymate/backend/internal/modules/ai/handler"
)

func RegisterRoutes(group *gin.RouterGroup, handler *aihandler.Handler) {
	group.GET("/ai/tasks", handler.ListTasks)
	group.GET("/ai/usage", handler.UsageSummary)
	group.GET("/ai/drafts", handler.ListDrafts)
}
