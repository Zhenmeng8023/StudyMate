package router

import (
	"github.com/gin-gonic/gin"
	cardhandler "studymate/backend/internal/modules/card/handler"
)

func RegisterRoutes(group *gin.RouterGroup, handler *cardhandler.Handler) {
	group.GET("/decks", handler.ListDecks)
	group.POST("/decks", handler.CreateDeck)
	group.GET("/decks/:id/cards", handler.ListCards)
	group.POST("/decks/:id/card-notes", handler.CreateCardNote)
	group.GET("/card-notes", handler.ListCardNotes)
	group.GET("/card-notes/:id", handler.GetCardNote)
	group.PATCH("/card-notes/:id", handler.UpdateCardNote)
	group.POST("/decks/:id/cards", handler.CreateCard)
	group.POST("/decks/:id/cards/bulk", handler.CreateCardsBulk)
	group.GET("/decks/:id/export", handler.ExportDeck)
	group.POST("/decks/:id/import", handler.ImportDeck)
	group.GET("/review/feedback", handler.ReviewFeedback)
	group.GET("/review/insights", handler.ReviewInsights)
	group.GET("/review/source-profile", handler.SourceProfile)
	group.GET("/review/today", handler.TodayQueue)
	group.POST("/cards/:id/review", handler.ReviewCard)
	group.POST("/cards/:id/review/undo", handler.UndoReview)
	group.PATCH("/cards/:id/status", handler.UpdateCardStatus)
	group.PATCH("/cards/:id/tags", handler.UpdateCardTags)
	group.DELETE("/cards/:id", handler.DeleteCard)
}
