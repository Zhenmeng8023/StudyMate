package handler

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	"studymate/backend/internal/modules/file/service"
	"studymate/backend/internal/pkg/apperrors"
	"studymate/backend/internal/pkg/response"
)

type Handler struct {
	service *service.Service
}

func NewHandler(service *service.Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Upload(ctx *gin.Context) {
	userID := ctx.GetString(middleware.ContextUserIDKey)
	fileHeader, err := ctx.FormFile("file")
	if err != nil {
		response.Error(ctx, apperrors.New(http.StatusBadRequest, "file_required", "请选择要上传的文件"))
		return
	}

	result, err := h.service.Upload(userID, fileHeader)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusCreated, result)
}

func (h *Handler) GetMetadata(ctx *gin.Context) {
	currentUserID := ctx.GetString(middleware.ContextUserIDKey)
	currentRole := ctx.GetString(middleware.ContextRoleKey)

	record, err := h.service.GetRecord(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	if record.OwnerUserID != currentUserID && currentRole != "admin" {
		response.Error(ctx, apperrors.New(http.StatusForbidden, "forbidden", "不能查看其他用户的文件信息"))
		return
	}

	result, err := h.service.GetMetadata(record.ID)
	if err != nil {
		response.Error(ctx, err)
		return
	}

	response.Success(ctx, http.StatusOK, result)
}

func (h *Handler) Download(ctx *gin.Context) {
	currentUserID := ctx.GetString(middleware.ContextUserIDKey)
	currentRole := ctx.GetString(middleware.ContextRoleKey)

	record, err := h.service.GetRecord(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, err)
		return
	}

	if record.OwnerUserID != currentUserID && currentRole != "admin" {
		response.Error(ctx, apperrors.New(http.StatusForbidden, "forbidden", "不能下载其他用户的文件"))
		return
	}

	if _, err := os.Stat(record.Path); err != nil {
		response.Error(ctx, apperrors.New(http.StatusNotFound, "file_missing", "文件内容不存在"))
		return
	}

	ctx.FileAttachment(record.Path, record.OriginalName)
}
