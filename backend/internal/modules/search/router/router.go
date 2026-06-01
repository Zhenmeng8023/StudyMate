package router

import (
	"github.com/gin-gonic/gin"
	searchhandler "studymate/backend/internal/modules/search/handler"
)

func RegisterRoutes(group *gin.RouterGroup, handler *searchhandler.Handler) {
	group.GET("/search", handler.Search)
}
