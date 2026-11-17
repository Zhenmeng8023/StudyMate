package service

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"unicode/utf8"

	"studymate/backend/internal/pkg/apperrors"
)

const MaxUploadBytes int64 = 50 * 1024 * 1024

func uploadTooLarge() error {
	return apperrors.New(http.StatusRequestEntityTooLarge, "file_too_large", "文件不能超过 50 MiB")
}

func validateUpload(header *multipart.FileHeader, file multipart.File) (string, string, error) {
	if header.Size > MaxUploadBytes {
		return "", "", uploadTooLarge()
	}
	if header.Size <= 0 || len(header.Filename) > 255 || !utf8.ValidString(header.Filename) || strings.ContainsAny(header.Filename, "\r\n\x00") {
		return "", "", apperrors.New(http.StatusBadRequest, "invalid_file", "文件为空或文件名不合法")
	}
	ext := strings.ToLower(filepath.Ext(header.Filename))
	prefix := make([]byte, 512)
	n, err := io.ReadFull(file, prefix)
	if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF {
		return "", "", apperrors.Internal("读取上传文件失败")
	}
	prefix = prefix[:n]
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return "", "", apperrors.Internal("读取上传文件失败")
	}
	if ext != ".pdf" || !bytes.HasPrefix(prefix, []byte("%PDF-")) {
		return "", "", apperrors.New(http.StatusBadRequest, "unsupported_file_type", "仅支持上传有效的 PDF 文件")
	}
	return ext, "application/pdf", nil
}
