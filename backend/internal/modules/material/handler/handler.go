package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialservice "studymate/backend/internal/modules/material/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service *materialservice.Service
}

func NewHandler(service *materialservice.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListMaterials(ctx *gin.Context) {
	materials, err := h.service.ListMaterials()
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, materials)
}

func (h *Handler) CreateMaterial(ctx *gin.Context) {
	var request materialdto.CreateMaterialRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}
	result, err := h.service.CreateMaterial(ctx.GetString(middleware.ContextUserIDKey), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) GetMaterial(ctx *gin.Context) {
	result, err := h.service.GetMaterial(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) UpdateMaterial(ctx *gin.Context) {
	var request materialdto.UpdateMaterialRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}
	result, err := h.service.UpdateMaterial(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) DeleteMaterial(ctx *gin.Context) {
	if err := h.service.DeleteMaterial(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id")); err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, gin.H{"message": "资料已删除"})
}

func (h *Handler) ToggleFavorite(ctx *gin.Context) {
	result, err := h.service.ToggleFavorite(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) RateMaterial(ctx *gin.Context) {
	var request materialdto.RateMaterialRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}
	result, err := h.service.RateMaterial(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request.Score)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, result)
}
