package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	sharedto "studymate/backend/internal/modules/share/dto"
	shareservice "studymate/backend/internal/modules/share/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service shareService
}

type shareService interface {
	Create(ownerUserID string, request sharedto.CreateLinkRequest) (*sharedto.LinkPayload, error)
	List(ownerUserID string) ([]sharedto.LinkPayload, error)
	Revoke(ownerUserID string, linkID string) error
	Resolve(token string) (*sharedto.PublicResolvePayload, error)
}

func NewHandler(service shareService) *Handler {
	return &Handler{service: service}
}

var _ shareService = (*shareservice.Service)(nil)

func (h *Handler) Create(ctx *gin.Context) {
	var request sharedto.CreateLinkRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	payload, err := h.service.Create(ctx.GetString(middleware.ContextUserIDKey), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusCreated, payload)
}

func (h *Handler) List(ctx *gin.Context) {
	payload, err := h.service.List(ctx.GetString(middleware.ContextUserIDKey))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, payload)
}

func (h *Handler) Revoke(ctx *gin.Context) {
	if err := h.service.Revoke(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id")); err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, gin.H{"status": "revoked"})
}

func (h *Handler) Resolve(ctx *gin.Context) {
	payload, err := h.service.Resolve(ctx.Param("token"))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, payload)
}
