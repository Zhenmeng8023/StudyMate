package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	communitydto "studymate/backend/internal/modules/community/dto"
	communityservice "studymate/backend/internal/modules/community/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service *communityservice.Service
}

func NewHandler(service *communityservice.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListPosts(ctx *gin.Context) {
	posts, err := h.service.ListPosts()
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, posts)
}

func (h *Handler) CreatePost(ctx *gin.Context) {
	var request communitydto.CreatePostRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}
	result, err := h.service.CreatePost(ctx.GetString(middleware.ContextUserIDKey), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) GetPost(ctx *gin.Context) {
	post, err := h.service.GetPost(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, post)
}

func (h *Handler) CreateComment(ctx *gin.Context) {
	var request communitydto.CreateCommentRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}
	result, err := h.service.CreateComment(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) ToggleLike(ctx *gin.Context) {
	result, err := h.service.ToggleLike(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) ToggleFavorite(ctx *gin.Context) {
	result, err := h.service.ToggleFavorite(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, result)
}
