package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	admindto "studymate/backend/internal/modules/admin/dto"
	adminservice "studymate/backend/internal/modules/admin/service"
	"studymate/backend/internal/pkg/response"
)

type ModerationHandler struct {
	service *adminservice.Service
}

func NewModerationHandler(service *adminservice.Service) *ModerationHandler {
	return &ModerationHandler{service: service}
}

func (h *ModerationHandler) List(ctx *gin.Context) {
	items, err := h.service.ListModerationItems()
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, items)
}

func (h *ModerationHandler) ApprovePost(ctx *gin.Context) {
	h.moderatePost(ctx, "approved")
}

func (h *ModerationHandler) RejectPost(ctx *gin.Context) {
	h.moderatePost(ctx, "rejected")
}

func (h *ModerationHandler) HidePost(ctx *gin.Context) {
	h.moderatePost(ctx, "hidden")
}

func (h *ModerationHandler) ApproveMaterial(ctx *gin.Context) {
	h.moderateMaterial(ctx, "approved")
}

func (h *ModerationHandler) RejectMaterial(ctx *gin.Context) {
	h.moderateMaterial(ctx, "rejected")
}

func (h *ModerationHandler) HideMaterial(ctx *gin.Context) {
	h.moderateMaterial(ctx, "hidden")
}

func (h *ModerationHandler) moderatePost(ctx *gin.Context, status string) {
	var request admindto.ModerationActionRequest
	_ = ctx.ShouldBindJSON(&request)
	if err := h.service.ModeratePost(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), status, request.Reason); err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, gin.H{"status": status})
}

func (h *ModerationHandler) moderateMaterial(ctx *gin.Context, status string) {
	var request admindto.ModerationActionRequest
	_ = ctx.ShouldBindJSON(&request)
	if err := h.service.ModerateMaterial(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), status, request.Reason); err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, gin.H{"status": status})
}
