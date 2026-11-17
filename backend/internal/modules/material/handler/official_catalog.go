package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"studymate/backend/internal/middleware"
	materialdto "studymate/backend/internal/modules/material/dto"
	"studymate/backend/internal/pkg/apperrors"
	"studymate/backend/internal/pkg/response"
)

func (h *Handler) ListOfficialManagement(ctx *gin.Context) { h.listOfficialCatalog(ctx, true) }

func (h *Handler) listOfficialCatalog(ctx *gin.Context, management bool) {
	page, err := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	if err != nil {
		response.Error(ctx, apperrors.New(400, "invalid_catalog_query", "页码不合法"))
		return
	}
	size, err := strconv.Atoi(ctx.DefaultQuery("pageSize", "20"))
	if err != nil {
		response.Error(ctx, apperrors.New(400, "invalid_catalog_query", "分页大小不合法"))
		return
	}
	query := materialdto.OfficialCatalogQuery{Page: page, PageSize: size, Q: ctx.Query("q"), Category: ctx.Query("category"), MaterialType: ctx.Query("materialType"), Sort: ctx.Query("sort"), Status: ctx.Query("status")}
	result, err := h.service.ListOfficialCatalog(ctx.GetString(middleware.ContextRoleKey), query, management)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	if management {
		ctx.Header("Cache-Control", "private, no-store")
	}
	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) ChangeOfficialStatus(ctx *gin.Context) {
	var request materialdto.OfficialStatusRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}
	result, err := h.service.ChangeOfficialStatus(ctx.GetString(middleware.ContextUserIDKey), ctx.GetString(middleware.ContextRoleKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, result)
}
