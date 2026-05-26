package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	notedto "studymate/backend/internal/modules/note/dto"
	noteservice "studymate/backend/internal/modules/note/service"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service *noteservice.Service
}

func NewHandler(service *noteservice.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListNotes(ctx *gin.Context) {
	result, err := h.service.ListNotes(ctx.GetString(middleware.ContextUserIDKey), ctx.Query("materialId"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) CreateNote(ctx *gin.Context) {
	var request notedto.CreateNoteRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.CreateNote(ctx.GetString(middleware.ContextUserIDKey), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) GetNote(ctx *gin.Context) {
	result, err := h.service.GetNote(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) UpdateNote(ctx *gin.Context) {
	var request notedto.UpdateNoteRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}

	result, err := h.service.UpdateNote(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), request)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) DeleteNote(ctx *gin.Context) {
	if err := h.service.DeleteNote(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id")); err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, gin.H{"message": "笔记已删�?"})
}

func (h *Handler) ListVersions(ctx *gin.Context) {
	result, err := h.service.ListVersions(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) RestoreVersion(ctx *gin.Context) {
	result, err := h.service.RestoreVersion(
		ctx.GetString(middleware.ContextUserIDKey),
		ctx.Param("id"),
		ctx.Param("versionId"),
	)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

