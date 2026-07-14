package router

import (
	"github.com/gin-gonic/gin"
	cardhandler "studymate/backend/internal/modules/card/handler"
)

func RegisterRoutes(group *gin.RouterGroup, handler *cardhandler.Handler) {
	group.GET("/decks", handler.ListDecks)
	group.POST("/decks", handler.CreateDeck)
	group.GET("/decks/:id/cards", handler.ListCards)
	group.POST("/decks/:id/cards", handler.CreateCard)
	group.POST("/decks/:id/cards/bulk", handler.CreateCardsBulk)
	group.GET("/review/today", handler.TodayQueue)
	group.POST("/cards/:id/review", handler.ReviewCard)
	group.POST("/cards/:id/review/undo", handler.UndoReview)
	group.PATCH("/cards/:id/status", handler.UpdateCardStatus)
}
