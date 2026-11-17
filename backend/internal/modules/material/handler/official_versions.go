package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"studymate/backend/internal/middleware"
	materialdto "studymate/backend/internal/modules/material/dto"
	"studymate/backend/internal/pkg/response"
)

func (h *Handler) CreateOfficialVersion(ctx *gin.Context) {
	var request materialdto.CreateOfficialVersionRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}
	item, err := h.service.CreateOfficialVersion(ctx.GetString(middleware.ContextUserIDKey), ctx.GetString(middleware.ContextRoleKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusCreated, item)
}
func (h *Handler) ListOfficialVersions(ctx *gin.Context)        { h.listOfficialVersions(ctx, false) }
func (h *Handler) ListManagedOfficialVersions(ctx *gin.Context) { h.listOfficialVersions(ctx, true) }
func (h *Handler) GetManagedOfficialMaterial(ctx *gin.Context) {
	result, err := h.service.GetManagedOfficialMaterial(ctx.GetString(middleware.ContextRoleKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	ctx.Header("Cache-Control", "private, no-store")
	response.Success(ctx, http.StatusOK, result)
}
func (h *Handler) listOfficialVersions(ctx *gin.Context, management bool) {
	result, err := h.service.ListOfficialVersions(ctx.GetString(middleware.ContextRoleKey), ctx.Param("id"), management)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	if management {
		ctx.Header("Cache-Control", "private, no-store")
	}
	response.Success(ctx, http.StatusOK, result)
}
