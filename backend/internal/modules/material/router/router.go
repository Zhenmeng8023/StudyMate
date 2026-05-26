package materialrouter

import (
	"github.com/gin-gonic/gin"
	materialhandler "studymate/backend/internal/modules/material/handler"
)

func RegisterPublicRoutes(group *gin.RouterGroup, handler *materialhandler.Handler) {
	group.GET("/materials", handler.ListMaterials)
	group.GET("/materials/:id", handler.GetMaterial)
}

func RegisterProtectedRoutes(group *gin.RouterGroup, handler *materialhandler.Handler) {
	group.POST("/materials", handler.CreateMaterial)
	group.PUT("/materials/:id", handler.UpdateMaterial)
	group.DELETE("/materials/:id", handler.DeleteMaterial)
	group.POST("/materials/:id/favorite", handler.ToggleFavorite)
	group.POST("/materials/:id/rating", handler.RateMaterial)
}
