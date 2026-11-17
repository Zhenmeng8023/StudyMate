package service

import (
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"

	adminrepo "studymate/backend/internal/modules/admin/repository"
	"studymate/backend/internal/modules/file/dto"
	filemodel "studymate/backend/internal/modules/file/model"
	filerepo "studymate/backend/internal/modules/file/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type Service struct {
	files     *filerepo.Repository
	auditLogs *adminrepo.AuditLogRepository
	uploadDir string
}

func NewService(files *filerepo.Repository, auditLogs *adminrepo.AuditLogRepository, uploadDir string) *Service {
	return &Service{files: files, auditLogs: auditLogs, uploadDir: uploadDir}
}

func (s *Service) Upload(ownerUserID string, fileHeader *multipart.FileHeader) (*dto.FileResponse, error) {
	if fileHeader == nil {
		return nil, apperrors.New(http.StatusBadRequest, "file_required", "请选择要上传的文件")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return nil, apperrors.Internal("打开上传文件失败")
	}
	defer file.Close()
	extension, mimeType, err := validateUpload(fileHeader, file)
	if err != nil {
		return nil, err
	}

	dateDir := time.Now().Format("20060102")
	targetDir := filepath.Join(s.uploadDir, dateDir)
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		return nil, apperrors.Internal("创建上传目录失败")
	}

	storedName := uuid.NewString() + extension
	targetPath := filepath.Join(targetDir, storedName)

	output, err := os.OpenFile(targetPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		return nil, apperrors.Internal("创建目标文件失败")
	}

	committed := false
	defer func() {
		if !committed {
			_ = os.Remove(targetPath)
		}
	}()
	written, err := io.Copy(output, io.LimitReader(file, MaxUploadBytes+1))
	if err != nil {
		output.Close()
		return nil, apperrors.Internal("写入上传文件失败")
	}

	if err := output.Close(); err != nil {
		return nil, apperrors.Internal("关闭目标文件失败")
	}
	if written > MaxUploadBytes {
		return nil, uploadTooLarge()
	}

	record := &filemodel.FileRecord{
		OwnerUserID:  ownerUserID,
		OriginalName: fileHeader.Filename,
		StoredName:   storedName,
		MimeType:     mimeType,
		Size:         written,
		Path:         targetPath,
	}
	if err := s.files.Create(record); err != nil {
		return nil, apperrors.Internal("保存文件记录失败")
	}
	committed = true

	_ = s.auditLogs.Create(ownerUserID, "file.upload", "file", map[string]any{
		"fileId":   record.ID,
		"filename": record.OriginalName,
	})

	return s.toResponse(record), nil
}

func (s *Service) GetMetadata(fileID string) (*dto.FileResponse, error) {
	record, err := s.files.FindByID(fileID)
	if err != nil {
		return nil, apperrors.New(http.StatusNotFound, "file_not_found", "文件不存在")
	}

	return s.toResponse(record), nil
}

func (s *Service) GetRecord(fileID string) (*filemodel.FileRecord, error) {
	record, err := s.files.FindByID(fileID)
	if err != nil {
		return nil, apperrors.New(http.StatusNotFound, "file_not_found", "文件不存在")
	}

	return record, nil
}

func (s *Service) toResponse(record *filemodel.FileRecord) *dto.FileResponse {
	return &dto.FileResponse{
		ID:           record.ID,
		OwnerUserID:  record.OwnerUserID,
		OriginalName: record.OriginalName,
		MimeType:     record.MimeType,
		Size:         record.Size,
		Path:         "",
		CreatedAt:    record.CreatedAt.Format(time.RFC3339),
	}
}
