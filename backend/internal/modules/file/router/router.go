package filerouter

import (
	"github.com/gin-gonic/gin"
	"studymate/backend/internal/modules/file/handler"
)

func RegisterRoutes(group *gin.RouterGroup, fileHandler *handler.Handler) {
	group.POST("/files", fileHandler.Upload)
	group.GET("/files/:id", fileHandler.GetMetadata)
	group.GET("/files/:id/download", fileHandler.Download)
}
