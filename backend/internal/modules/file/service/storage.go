package service

import (
	"net/http"
	"time"

	"studymate/backend/internal/modules/file/dto"
	"studymate/backend/internal/pkg/apperrors"
)

const DefaultUserQuotaBytes int64 = 1024 * 1024 * 1024

func quotaExceeded() error {
	return apperrors.New(http.StatusConflict, "storage_quota_exceeded", "个人存储空间不足，请检查已上传文件或联系管理员调整配额")
}

func (s *Service) GetStorage(ownerID string) (*dto.StorageResponse, error) {
	if ownerID == "" {
		return nil, apperrors.New(http.StatusUnauthorized, "unauthorized", "请先登录")
	}
	usage, files, err := s.files.Storage(ownerID)
	if err != nil {
		return nil, apperrors.Internal("读取存储占用失败")
	}
	result := &dto.StorageResponse{UsedBytes: usage.UsedBytes, QuotaBytes: s.quotaBytes, RemainingBytes: max(0, s.quotaBytes-usage.UsedBytes), FileCount: usage.FileCount, UnlinkedBytes: usage.UnlinkedBytes, UnlinkedFileCount: usage.UnlinkedFileCount, UnlinkedFiles: make([]dto.StorageFile, 0, len(files))}
	for _, file := range files {
		result.UnlinkedFiles = append(result.UnlinkedFiles, dto.StorageFile{ID: file.ID, OriginalName: file.OriginalName, Size: max(0, file.Size), CreatedAt: file.CreatedAt.Format(time.RFC3339)})
	}
	return result, nil
}
