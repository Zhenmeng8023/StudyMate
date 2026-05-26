package userrouter

import (
	"github.com/gin-gonic/gin"
	userhandler "studymate/backend/internal/modules/user/handler"
)

func RegisterRoutes(group *gin.RouterGroup, userHandler *userhandler.Handler) {
	group.GET("/users/me", userHandler.GetProfile)
	group.PUT("/users/me", userHandler.UpdateProfile)
}
