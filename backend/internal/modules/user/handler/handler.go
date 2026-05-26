package userhandler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	"studymate/backend/internal/modules/user/dto"
	"studymate/backend/internal/modules/user/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service *service.Service
}

func NewHandler(service *service.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetProfile(ctx *gin.Context) {
	userID := ctx.GetString(middleware.ContextUserIDKey)
	profile, err := h.service.GetProfile(userID)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, profile)
}

func (h *Handler) UpdateProfile(ctx *gin.Context) {
	userID := ctx.GetString(middleware.ContextUserIDKey)

	var request dto.UpdateProfileRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	profile, err := h.service.UpdateProfile(userID, request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, profile)
}
