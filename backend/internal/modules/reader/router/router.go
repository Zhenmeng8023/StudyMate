package readerrouter

import (
	"github.com/gin-gonic/gin"
	readerhandler "studymate/backend/internal/modules/reader/handler"
)

func RegisterRoutes(group *gin.RouterGroup, handler *readerhandler.Handler) {
	group.GET("/materials/:id/reader", handler.GetState)
	group.PUT("/materials/:id/reader/progress", handler.UpdateProgress)
	group.POST("/materials/:id/reader/annotations", handler.CreateAnnotation)
	group.POST("/materials/:id/reader/annotations/generate-cards", handler.GenerateCardDrafts)
	group.POST("/materials/:id/reader/annotations/generate-graph-drafts", handler.GenerateGraphDrafts)
	group.DELETE("/materials/:id/reader/annotations/:annotationId", handler.DeleteAnnotation)
}
