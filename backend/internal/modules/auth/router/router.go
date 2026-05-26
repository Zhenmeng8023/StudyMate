package authrouter

import (
	"github.com/gin-gonic/gin"
	"studymate/backend/internal/modules/auth/handler"
)

func RegisterPublicRoutes(group *gin.RouterGroup, authHandler *handler.Handler) {
	group.POST("/auth/register", authHandler.Register)
	group.POST("/auth/login", authHandler.Login)
	group.POST("/auth/refresh", authHandler.Refresh)
}

func RegisterProtectedRoutes(group *gin.RouterGroup, authHandler *handler.Handler) {
	group.POST("/auth/logout", authHandler.Logout)
}
