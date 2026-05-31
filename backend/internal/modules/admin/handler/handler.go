package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	"studymate/backend/internal/modules/auth/dto"
	authservice "studymate/backend/internal/modules/auth/service"
	adminservice "studymate/backend/internal/modules/admin/service"
	userservice "studymate/backend/internal/modules/user/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	authService  *authservice.Service
	userService  *userservice.Service
	adminService *adminservice.Service
}

func NewHandler(authService *authservice.Service, userService *userservice.Service, adminService *adminservice.Service) *Handler {
	return &Handler{
		authService:  authService,
		userService:  userService,
		adminService: adminService,
	}
}

func (h *Handler) Login(ctx *gin.Context) {
	var request dto.LoginRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.authService.LoginAdmin(request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) Me(ctx *gin.Context) {
	userID := ctx.GetString(middleware.ContextUserIDKey)
	profile, err := h.userService.GetProfile(userID)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, profile)
}

func (h *Handler) Overview(ctx *gin.Context) {
	result, err := h.adminService.Overview()
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}
