package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	readerdto "studymate/backend/internal/modules/reader/dto"
	readerservice "studymate/backend/internal/modules/reader/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service *readerservice.Service
}

func NewHandler(service *readerservice.Service) *Handler {
	return &Handler{service: service}
}

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

	response.Success(ctx, http.StatusOK, gin.H{"message": "批注已删除"})
}

