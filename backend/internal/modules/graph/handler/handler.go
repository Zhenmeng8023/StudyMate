package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	carddto "studymate/backend/internal/modules/card/dto"
	graphdto "studymate/backend/internal/modules/graph/dto"
	"studymate/backend/internal/pkg/apperrors"
	"studymate/backend/internal/pkg/response"
)

type graphService interface {
	ListGraphs(ownerUserID string) ([]graphdto.GraphSummaryPayload, error)
	CreateGraph(ownerUserID string, request graphdto.CreateGraphRequest) (*graphdto.GraphDetailPayload, error)
	GetGraph(ownerUserID string, graphID string) (*graphdto.GraphDetailPayload, error)
	UpdateGraph(ownerUserID string, graphID string, request graphdto.UpdateGraphRequest) (*graphdto.GraphSummaryPayload, error)
	DeleteGraph(ownerUserID string, graphID string) error
	BatchSave(ownerUserID string, graphID string, request graphdto.GraphBatchSaveRequest) (*graphdto.GraphDetailPayload, error)
	ListSnapshots(ownerUserID string, graphID string) ([]graphdto.GraphSnapshotPayload, error)
	RestoreSnapshot(ownerUserID string, graphID string, request graphdto.RestoreGraphRequest) (*graphdto.GraphDetailPayload, error)
	ImportMarkdown(ownerUserID string, graphID string, request graphdto.ImportGraphRequest) (*graphdto.GraphDetailPayload, error)
	ImportMermaid(ownerUserID string, graphID string, request graphdto.ImportGraphRequest) (*graphdto.GraphDetailPayload, error)
	PreviewLayout(ownerUserID string, graphID string, request graphdto.PreviewGraphLayoutRequest) (*graphdto.GraphLayoutPreviewPayload, error)
	ValidateGraph(ownerUserID string, graphID string) (*graphdto.GraphValidationResponse, error)
	GenerateCardDrafts(ownerUserID string, graphID string, request graphdto.GraphCardDraftRequest) ([]graphdto.GraphCardDraftPayload, error)
	CommitCardDrafts(ownerUserID string, graphID string, request graphdto.CommitGraphCardDraftsRequest) ([]carddto.CardPayload, error)
	CommitGraphChangeDrafts(ownerUserID string, graphID string, request graphdto.CommitGraphChangeDraftsRequest) (*graphdto.GraphDetailPayload, error)
	ListDiagramTemplates() []graphdto.DiagramTemplatePayload
}

type Handler struct {
	service graphService
}

func NewHandler(service graphService) *Handler {
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
		response.Error(ctx, badGraphRequest())
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
		response.Error(ctx, badGraphRequest())
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
		response.Error(ctx, badGraphRequest())
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
		response.Error(ctx, badGraphRequest())
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
		response.Error(ctx, badGraphRequest())
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
		response.Error(ctx, badGraphRequest())
		return
	}

	result, err := h.service.ImportMermaid(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) PreviewLayout(ctx *gin.Context) {
	var request graphdto.PreviewGraphLayoutRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, badGraphRequest())
		return
	}

	result, err := h.service.PreviewLayout(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
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
		response.Error(ctx, badGraphRequest())
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
		response.Error(ctx, badGraphRequest())
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
		response.Error(ctx, badGraphRequest())
		return
	}

	result, err := h.service.CommitGraphChangeDrafts(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func badGraphRequest() error {
	return apperrors.New(http.StatusBadRequest, "invalid_graph_request", "图谱请求参数无效")
}

func (h *Handler) ListTemplates(ctx *gin.Context) {
	response.Success(ctx, http.StatusOK, h.service.ListDiagramTemplates())
}
