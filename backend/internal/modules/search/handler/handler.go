package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	searchservice "studymate/backend/internal/modules/search/service"
	"studymate/backend/internal/pkg/response"
	"studymate/backend/internal/pkg/security"
)

type Handler struct {
	service      *searchservice.Service
	tokenManager *security.TokenManager
}

func NewHandler(service *searchservice.Service, tokenManager *security.TokenManager) *Handler {
	return &Handler{service: service, tokenManager: tokenManager}
}

func (h *Handler) Search(ctx *gin.Context) {
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))
	userID := h.optionalUserID(ctx)
	payload, err := h.service.Search(ctx.Query("q"), strings.Split(ctx.Query("types"), ","), limit, userID)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, payload)
}

func (h *Handler) optionalUserID(ctx *gin.Context) string {
	header := strings.TrimSpace(ctx.GetHeader("Authorization"))
	if header == "" || !strings.HasPrefix(header, "Bearer ") || h.tokenManager == nil {
		return ""
	}
	claims, err := h.tokenManager.ParseAccessToken(strings.TrimSpace(strings.TrimPrefix(header, "Bearer ")))
	if err != nil {
		return ""
	}
	return claims.UserID
}
