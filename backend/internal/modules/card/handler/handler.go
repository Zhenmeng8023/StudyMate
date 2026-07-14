package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	carddto "studymate/backend/internal/modules/card/dto"
	cardservice "studymate/backend/internal/modules/card/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service cardService
}

type cardService interface {
	ListDecks(ownerUserID string) ([]carddto.DeckPayload, error)
	CreateDeck(ownerUserID string, request carddto.CreateDeckRequest) (*carddto.DeckPayload, error)
	ListCards(ownerUserID string, deckID string) ([]carddto.CardPayload, error)
	CreateCard(ownerUserID string, deckID string, request carddto.CreateCardRequest) (*carddto.CardPayload, error)
	BulkCreateCards(ownerUserID string, deckID string, requests []carddto.CreateCardRequest) ([]carddto.CardPayload, error)
	TodayQueue(ownerUserID string) (*carddto.ReviewQueuePayload, error)
	ReviewCard(ownerUserID string, cardID string, request carddto.ReviewCardRequest) (*carddto.ReviewResultPayload, error)
	UpdateCardStatus(ownerUserID string, cardID string, request carddto.UpdateCardStatusRequest) (*carddto.CardPayload, error)
	UndoReview(ownerUserID string, cardID string, request carddto.UndoReviewRequest) (*carddto.UndoReviewResultPayload, error)
}

func NewHandler(service cardService) *Handler {
	return &Handler{service: service}
}

var _ cardService = (*cardservice.Service)(nil)

func (h *Handler) ListDecks(ctx *gin.Context) {
	result, err := h.service.ListDecks(ctx.GetString(middleware.ContextUserIDKey))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) CreateDeck(ctx *gin.Context) {
	var request carddto.CreateDeckRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.CreateDeck(ctx.GetString(middleware.ContextUserIDKey), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) ListCards(ctx *gin.Context) {
	result, err := h.service.ListCards(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) CreateCard(ctx *gin.Context) {
	var request carddto.CreateCardRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.CreateCard(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) CreateCardsBulk(ctx *gin.Context) {
	var request carddto.BulkCreateCardsRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.BulkCreateCards(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request.Cards)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) TodayQueue(ctx *gin.Context) {
	result, err := h.service.TodayQueue(ctx.GetString(middleware.ContextUserIDKey))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) ReviewCard(ctx *gin.Context) {
	var request carddto.ReviewCardRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.ReviewCard(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) UpdateCardStatus(ctx *gin.Context) {
	var request carddto.UpdateCardStatusRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.UpdateCardStatus(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) UndoReview(ctx *gin.Context) {
	var request carddto.UndoReviewRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.UndoReview(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}
