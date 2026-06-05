package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	aidto "studymate/backend/internal/modules/ai/dto"
	carddto "studymate/backend/internal/modules/card/dto"
	readerdto "studymate/backend/internal/modules/reader/dto"
	readerservice "studymate/backend/internal/modules/reader/service"
	"studymate/backend/internal/pkg/response"
)

type readerService interface {
	GetState(ownerUserID string, materialID string) (*readerdto.ReaderStateResponse, error)
	UpdateProgress(ownerUserID string, materialID string, request readerdto.UpdateProgressRequest) (*readerdto.ReaderStateResponse, error)
	CreateAnnotation(ownerUserID string, materialID string, request readerdto.CreateAnnotationRequest) (*readerdto.AnnotationSummary, error)
	DeleteAnnotation(ownerUserID string, materialID string, annotationID string) error
	GenerateCardDrafts(ownerUserID string, materialID string, annotationIDs []string) ([]carddto.CardDraftPayload, error)
	GenerateGraphDrafts(ownerUserID string, materialID string, annotationIDs []string) ([]aidto.DraftPayload, error)
}

type Handler struct {
	service readerService
}

func NewHandler(service readerService) *Handler {
	return &Handler{service: service}
}

var _ readerService = (*readerservice.Service)(nil)

func (h *Handler) GetState(ctx *gin.Context) {
	result, err := h.service.GetState(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) UpdateProgress(ctx *gin.Context) {
	var request readerdto.UpdateProgressRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.UpdateProgress(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) CreateAnnotation(ctx *gin.Context) {
	var request readerdto.CreateAnnotationRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.CreateAnnotation(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) DeleteAnnotation(ctx *gin.Context) {
	if err := h.service.DeleteAnnotation(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), ctx.Param("annotationId")); err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, gin.H{"message": "annotation deleted"})
}

func (h *Handler) GenerateCardDrafts(ctx *gin.Context) {
	var request readerdto.GenerateAnnotationCardDraftsRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.GenerateCardDrafts(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request.AnnotationIDs)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) GenerateGraphDrafts(ctx *gin.Context) {
	var request readerdto.GenerateAnnotationCardDraftsRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.GenerateGraphDrafts(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request.AnnotationIDs)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}
