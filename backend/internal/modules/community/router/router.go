package communityrouter

import (
	"github.com/gin-gonic/gin"
	communityhandler "studymate/backend/internal/modules/community/handler"
)

func RegisterPublicRoutes(group *gin.RouterGroup, handler *communityhandler.Handler) {
	group.GET("/posts", handler.ListPosts)
	group.GET("/posts/:id", handler.GetPost)
}

func RegisterProtectedRoutes(group *gin.RouterGroup, handler *communityhandler.Handler) {
	group.POST("/posts", handler.CreatePost)
	group.POST("/posts/:id/comments", handler.CreateComment)
	group.POST("/posts/:id/like", handler.ToggleLike)
	group.POST("/posts/:id/favorite", handler.ToggleFavorite)
}
