package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	graphdto "studymate/backend/internal/modules/graph/dto"
	graphservice "studymate/backend/internal/modules/graph/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service *graphservice.Service
}

func NewHandler(service *graphservice.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListGraphs(ctx *gin.Context) {
	result, err := h.service.ListGraphs(ctx.GetString(middleware.ContextUserIDKey))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) CreateGraph(ctx *gin.Context) {
	var request graphdto.CreateGraphRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.CreateGraph(ctx.GetString(middleware.ContextUserIDKey), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) GetGraph(ctx *gin.Context) {
	result, err := h.service.GetGraph(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) UpdateGraph(ctx *gin.Context) {
	var request graphdto.UpdateGraphRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.UpdateGraph(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) DeleteGraph(ctx *gin.Context) {
	if err := h.service.DeleteGraph(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id")); err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, gin.H{"message": "图谱已删除"})
}

func (h *Handler) BatchSave(ctx *gin.Context) {
	var request graphdto.GraphBatchSaveRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.BatchSave(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) ListSnapshots(ctx *gin.Context) {
	result, err := h.service.ListSnapshots(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) RestoreSnapshot(ctx *gin.Context) {
	var request graphdto.RestoreGraphRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.RestoreSnapshot(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) ImportMarkdown(ctx *gin.Context) {
	var request graphdto.ImportGraphRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.ImportMarkdown(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) ImportMermaid(ctx *gin.Context) {
	var request graphdto.ImportGraphRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.ImportMermaid(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) Validate(ctx *gin.Context) {
	result, err := h.service.ValidateGraph(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) GenerateCards(ctx *gin.Context) {
	var request graphdto.GraphCardDraftRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.GenerateCardDrafts(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) CommitCards(ctx *gin.Context) {
	var request graphdto.CommitGraphCardDraftsRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.CommitCardDrafts(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) CommitGraphChanges(ctx *gin.Context) {
	var request graphdto.CommitGraphChangeDraftsRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.CommitGraphChangeDrafts(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) ListTemplates(ctx *gin.Context) {
	response.Success(ctx, http.StatusOK, h.service.ListDiagramTemplates())
}
