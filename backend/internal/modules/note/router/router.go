package noterouter

import (
	"github.com/gin-gonic/gin"
	notehandler "studymate/backend/internal/modules/note/handler"
)

func RegisterRoutes(group *gin.RouterGroup, handler *notehandler.Handler) {
	group.GET("/notes", handler.ListNotes)
	group.POST("/notes", handler.CreateNote)
	group.GET("/notes/:id", handler.GetNote)
	group.PUT("/notes/:id", handler.UpdateNote)
	group.DELETE("/notes/:id", handler.DeleteNote)
	group.GET("/notes/:id/versions", handler.ListVersions)
	group.POST("/notes/:id/versions/:versionId/restore", handler.RestoreVersion)
}

