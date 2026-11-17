package handler

import (
	"mime"
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	materialdto "studymate/backend/internal/modules/material/dto"
	"studymate/backend/internal/pkg/response"
)

func (h *Handler) ListLibrary(ctx *gin.Context) {
	items, err := h.service.ListLibrary(ctx.GetString(middleware.ContextUserIDKey))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, items)
}

func (h *Handler) ListOfficial(ctx *gin.Context) {
	items, err := h.service.ListOfficial()
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, items)
}

func (h *Handler) GetLibraryMaterial(ctx *gin.Context) {
	item, err := h.service.GetLibraryMaterial(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, item)
}

func (h *Handler) CreatePersonal(ctx *gin.Context) { h.createLibrary(ctx, "personal") }
func (h *Handler) CreateOfficial(ctx *gin.Context) { h.createLibrary(ctx, "official") }

func (h *Handler) createLibrary(ctx *gin.Context, scope string) {
	var request materialdto.CreateMaterialRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}
	userID, role := ctx.GetString(middleware.ContextUserIDKey), ctx.GetString(middleware.ContextRoleKey)
	var item *materialdto.MaterialSummary
	var err error
	if scope == "official" {
		item, err = h.service.CreateOfficial(userID, role, request)
	} else {
		item, err = h.service.CreatePersonal(userID, request)
	}
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusCreated, item)
}

func (h *Handler) UpdatePersonal(ctx *gin.Context) { h.updateLibrary(ctx, "personal") }
func (h *Handler) UpdateOfficial(ctx *gin.Context) { h.updateLibrary(ctx, "official") }

func (h *Handler) updateLibrary(ctx *gin.Context, scope string) {
	var request materialdto.UpdateMaterialRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		response.Error(ctx, err)
		return
	}
	item, err := h.service.UpdateLibraryMaterial(ctx.GetString(middleware.ContextUserIDKey), ctx.GetString(middleware.ContextRoleKey), ctx.Param("id"), scope, request)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, item)
}

func (h *Handler) DeletePersonal(ctx *gin.Context) { h.deleteLibrary(ctx, "personal") }
func (h *Handler) DeleteOfficial(ctx *gin.Context) { h.deleteLibrary(ctx, "official") }

func (h *Handler) deleteLibrary(ctx *gin.Context, scope string) {
	err := h.service.DeleteLibraryMaterial(ctx.GetString(middleware.ContextUserIDKey), ctx.GetString(middleware.ContextRoleKey), ctx.Param("id"), scope)
	if err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, gin.H{"message": "资料已归档"})
}

func (h *Handler) Collect(ctx *gin.Context)   { h.setCollection(ctx, true) }
func (h *Handler) Uncollect(ctx *gin.Context) { h.setCollection(ctx, false) }

func (h *Handler) setCollection(ctx *gin.Context, active bool) {
	if err := h.service.SetCollection(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"), active); err != nil {
		response.Error(ctx, err)
		return
	}
	response.Success(ctx, http.StatusOK, gin.H{"active": active})
}

func (h *Handler) GetLibraryAttachment(ctx *gin.Context) {
	attachment, err := h.service.GetLibraryAttachment(ctx.GetString(middleware.ContextUserIDKey), ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}
	disposition := "inline"
	if ctx.Query("download") == "1" {
		disposition = "attachment"
	}
	ctx.Header("Content-Type", attachment.File.MimeType)
	ctx.Header("X-Content-Type-Options", "nosniff")
	ctx.Header("Cache-Control", "private, no-store")
	ctx.Header("Content-Disposition", mime.FormatMediaType(disposition, map[string]string{"filename": attachment.File.OriginalName}))
	ctx.File(attachment.File.Path)
}
