package router

import (
	"github.com/gin-gonic/gin"
	sharehandler "studymate/backend/internal/modules/share/handler"
)

func RegisterProtectedRoutes(group *gin.RouterGroup, handler *sharehandler.Handler) {
	group.GET("/share-links", handler.List)
	group.POST("/share-links", handler.Create)
	group.DELETE("/share-links/:id", handler.Revoke)
}

func RegisterPublicRoutes(group *gin.RouterGroup, handler *sharehandler.Handler) {
	group.GET("/share/:token", handler.Resolve)
}
