package materialrouter

import (
	"github.com/gin-gonic/gin"
	materialhandler "studymate/backend/internal/modules/material/handler"
)

func RegisterPublicRoutes(group *gin.RouterGroup, handler *materialhandler.Handler) {
	group.GET("/official-materials", handler.ListOfficial)
	group.GET("/official-materials/:id/versions", handler.ListOfficialVersions)
	group.GET("/materials", handler.ListMaterials)
	group.GET("/materials/:id", handler.GetMaterial)
	group.GET("/materials/:id/attachment", handler.GetAttachment)
}

func RegisterProtectedRoutes(group *gin.RouterGroup, handler *materialhandler.Handler) {
	group.GET("/official-materials/manage", handler.ListOfficialManagement)
	group.GET("/official-materials/manage/:id/versions", handler.ListManagedOfficialVersions)
	group.GET("/official-materials/manage/:id", handler.GetManagedOfficialMaterial)
	group.POST("/official-materials/:id/versions", handler.CreateOfficialVersion)
	group.PUT("/official-materials/:id/status", handler.ChangeOfficialStatus)
	group.GET("/library/materials", handler.ListLibrary)
	group.POST("/library/materials", handler.CreatePersonal)
	group.GET("/library/materials/:id", handler.GetLibraryMaterial)
	group.GET("/library/materials/:id/attachment", handler.GetLibraryAttachment)
	group.PUT("/library/materials/:id", handler.UpdatePersonal)
	group.DELETE("/library/materials/:id", handler.DeletePersonal)
	group.PUT("/library/collections/:id", handler.Collect)
	group.DELETE("/library/collections/:id", handler.Uncollect)
	group.POST("/official-materials", handler.CreateOfficial)
	group.PUT("/official-materials/:id", handler.UpdateOfficial)
	group.DELETE("/official-materials/:id", handler.DeleteOfficial)
	group.POST("/materials", handler.CreateMaterial)
	group.PUT("/materials/:id", handler.UpdateMaterial)
	group.DELETE("/materials/:id", handler.DeleteMaterial)
	group.POST("/materials/:id/favorite", handler.ToggleFavorite)
	group.POST("/materials/:id/rating", handler.RateMaterial)
}
