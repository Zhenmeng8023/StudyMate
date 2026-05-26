package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	"studymate/backend/internal/modules/auth/dto"
	"studymate/backend/internal/modules/auth/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service *service.Service
}

func NewHandler(service *service.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Register(ctx *gin.Context) {
	var request dto.RegisterRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.Register(request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) Login(ctx *gin.Context) {
	var request dto.LoginRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.Login(request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) Refresh(ctx *gin.Context) {
	var request dto.RefreshRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.Refresh(request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) Logout(ctx *gin.Context) {
	var request dto.LogoutRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	actorID := ctx.GetString(middleware.ContextUserIDKey)
	if err := h.service.Logout(request, actorID); err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, gin.H{"message": "退出成功"})
}
