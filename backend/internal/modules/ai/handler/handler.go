package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	aidto "studymate/backend/internal/modules/ai/dto"
	"studymate/backend/internal/pkg/response"
)

type aiService interface {
	ListTasks(userID string) ([]aidto.TaskPayload, error)
	UsageSummary(userID string) (*aidto.UsageSummaryPayload, error)
	ListDrafts(userID string) ([]aidto.DraftPayload, error)
}

type Handler struct {
	service aiService
}

func NewHandler(service aiService) *Handler {
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
