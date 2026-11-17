package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	searchdto "studymate/backend/internal/modules/search/dto"
	searchservice "studymate/backend/internal/modules/search/service"
	usermodel "studymate/backend/internal/modules/user/model"
	"studymate/backend/internal/pkg/response"
	"studymate/backend/internal/pkg/security"
)

type searchService interface {
	Search(query string, types []string, limit int, offset int, userID string) (*searchdto.Response, error)
}

type userLookup interface {
	FindByID(id string) (*usermodel.User, error)
}

type Handler struct {
	service      searchService
	tokenManager *security.TokenManager
	users        userLookup
}

func NewHandler(service searchService, tokenManager *security.TokenManager, users ...userLookup) *Handler {
	handler := &Handler{service: service, tokenManager: tokenManager}
	if len(users) > 0 {
		handler.users = users[0]
	}
	return handler
}

var _ searchService = (*searchservice.Service)(nil)

func (h *Handler) Search(ctx *gin.Context) {
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))
	userID := h.optionalUserID(ctx)
	var types []string
	if rawTypes := strings.TrimSpace(ctx.Query("types")); rawTypes != "" {
		types = strings.Split(rawTypes, ",")
	}
	payload, err := h.service.Search(ctx.Query("q"), types, limit, offset, userID)
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
	if h.users != nil {
		user, err := h.users.FindByID(claims.UserID)
		if err != nil || user == nil || user.ID != claims.UserID || user.Status != "active" {
			return ""
		}
	}
	return claims.UserID
}
