package graphrouter

import (
	"github.com/gin-gonic/gin"
	graphhandler "studymate/backend/internal/modules/graph/handler"
)

func RegisterRoutes(group *gin.RouterGroup, handler *graphhandler.Handler) {
	group.GET("/diagram/templates", handler.ListTemplates)
	group.GET("/graphs", handler.ListGraphs)
	group.POST("/graphs", handler.CreateGraph)
	group.GET("/graphs/:id", handler.GetGraph)
	group.PUT("/graphs/:id", handler.UpdateGraph)
	group.DELETE("/graphs/:id", handler.DeleteGraph)
	group.POST("/graphs/:id/batch-save", handler.BatchSave)
	group.GET("/graphs/:id/snapshots", handler.ListSnapshots)
	group.POST("/graphs/:id/restore", handler.RestoreSnapshot)
	group.POST("/graphs/:id/import/markdown", handler.ImportMarkdown)
	group.POST("/graphs/:id/import/mermaid", handler.ImportMermaid)
	group.POST("/graphs/:id/validate", handler.Validate)
	group.POST("/graphs/:id/ai/generate-cards", handler.GenerateCards)
	group.POST("/graphs/:id/ai/commit-cards", handler.CommitCards)
	group.POST("/graphs/:id/ai/commit-changes", handler.CommitGraphChanges)
}
