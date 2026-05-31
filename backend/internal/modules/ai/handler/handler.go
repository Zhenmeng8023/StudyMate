package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	aiservice "studymate/backend/internal/modules/ai/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service *aiservice.Service
}

func NewHandler(service *aiservice.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListTasks(ctx *gin.Context) {
	result, err := h.service.ListTasks(ctx.GetString(middleware.ContextUserIDKey))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) UsageSummary(ctx *gin.Context) {
	result, err := h.service.UsageSummary(ctx.GetString(middleware.ContextUserIDKey))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) ListDrafts(ctx *gin.Context) {
	result, err := h.service.ListDrafts(ctx.GetString(middleware.ContextUserIDKey))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}
