package service

import (
	"net/http"
	"net/url"
	"slices"
	"strings"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	"studymate/backend/internal/pkg/apperrors"
	"time"
	"unicode/utf8"
)

func normalizeOfficialMetadata(input materialdto.OfficialMetadata) (materialdto.OfficialMetadata, error) {
	result := input
	result.MaterialType = strings.TrimSpace(result.MaterialType)
	if result.MaterialType == "" {
		result.MaterialType = "other"
	}
	result.LicenseStatus = strings.TrimSpace(result.LicenseStatus)
	if result.LicenseStatus == "" {
		result.LicenseStatus = "unknown"
	}
	result.Author = strings.TrimSpace(result.Author)
	result.Edition = strings.TrimSpace(result.Edition)
	result.SourceURL = strings.TrimSpace(result.SourceURL)
	if !slices.Contains([]string{"book", "paper", "lecture", "exercises", "course", "other"}, result.MaterialType) || !slices.Contains([]string{"unknown", "self_owned", "authorized", "open_license", "public_domain"}, result.LicenseStatus) {
		return result, apperrors.New(400, "invalid_official_metadata", "资料类型或授权状态不合法")
	}
	if utf8.RuneCountInString(result.Author) > 200 || utf8.RuneCountInString(result.Edition) > 120 || len(result.SourceURL) > 2048 || (result.PublicationYear != 0 && (result.PublicationYear < 1000 || result.PublicationYear > time.Now().Year()+1)) {
		return result, apperrors.New(400, "invalid_official_metadata", "作者、版本、来源或年份不合法")
	}
	if result.SourceURL != "" {
		parsed, err := url.Parse(result.SourceURL)
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" || parsed.User != nil {
			return result, apperrors.New(400, "invalid_source_url", "来源地址仅支持有效的 HTTP 或 HTTPS 链接")
		}
	}
	return result, nil
}

func applyOfficialMetadata(material *materialmodel.Material, input materialdto.OfficialMetadata) {
	material.MaterialType = input.MaterialType
	material.Author = input.Author
	material.SourceURL = input.SourceURL
	material.PublicationYear = input.PublicationYear
	material.Edition = input.Edition
	material.LicenseStatus = input.LicenseStatus
}

func (s *Service) ListOfficialCatalog(role string, query materialdto.OfficialCatalogQuery, management bool) (*materialdto.OfficialCatalogPage, error) {
	if management && role != "admin" {
		return nil, apperrors.New(http.StatusForbidden, "admin_required", "仅管理员可以管理官方资料")
	}
	if query.Page < 1 || query.Page > 1000000 || query.PageSize < 1 || query.PageSize > 50 || utf8.RuneCountInString(query.Q) > 200 || utf8.RuneCountInString(query.Category) > 64 {
		return nil, apperrors.New(400, "invalid_catalog_query", "分页或检索参数不合法")
	}
	if query.Sort == "" {
		query.Sort = "updated"
	}
	if query.Sort != "updated" && query.Sort != "title" {
		return nil, apperrors.New(400, "invalid_catalog_query", "排序参数不合法")
	}
	if query.MaterialType != "" {
		if _, err := normalizeOfficialMetadata(materialdto.OfficialMetadata{MaterialType: query.MaterialType}); err != nil {
			return nil, err
		}
	}
	if management {
		if query.Status == "" {
			query.Status = "all"
		}
		if query.Status != "all" && query.Status != "approved" && query.Status != "archived" && query.Status != "hidden" {
			return nil, apperrors.New(400, "invalid_catalog_query", "状态参数不合法")
		}
	} else {
		query.Status = "approved"
	}
	result, err := s.repository.ListOfficialCatalog(query)
	if err != nil {
		return nil, apperrors.Internal("读取官方资料目录失败")
	}
	return result, nil
}

func (s *Service) ChangeOfficialStatus(userID, role, id string, request materialdto.OfficialStatusRequest) (*materialdto.MaterialSummary, error) {
	if role != "admin" {
		return nil, apperrors.New(403, "admin_required", "仅管理员可以管理官方资料")
	}
	reason := strings.TrimSpace(request.Reason)
	if (request.Status != "approved" && request.Status != "archived") || utf8.RuneCountInString(reason) > 500 || (request.Status == "archived" && reason == "") {
		return nil, apperrors.New(400, "invalid_official_status", "下架需填写原因（最多500字），状态必须为发布或下架")
	}
	var updated *materialmodel.Material
	err := s.repository.LibraryTransaction(func(repo *materialrepo.Repository, audit *adminrepo.AuditLogRepository) error {
		material, err := repo.LockOfficial(id)
		if err != nil {
			return apperrors.New(404, "material_not_found", "官方资料不存在")
		}
		if request.Status == "approved" {
			if material.AttachmentFileID == "" {
				return apperrors.New(400, "pdf_attachment_required", "重新上架需要有效的 PDF 附件")
			}
			transactionService := &Service{repository: repo}
			if err := transactionService.validatePDFAttachment(material.OwnerUserID, material.AttachmentFileID); err != nil {
				return err
			}
		}
		previous := material.Status
		next := *material
		next.Status = request.Status
		next.ArchiveReason = reason
		if request.Status == "approved" {
			next.ArchiveReason = ""
		}
		if err := repo.UpdateOfficialStatus(&next); err != nil {
			return err
		}
		if err := audit.Create(userID, "material.official.status", "material", map[string]any{"materialId": id, "previousStatus": previous, "status": next.Status, "reason": reason}); err != nil {
			return err
		}
		updated = &next
		return nil
	})
	if err != nil {
		if app := apperrors.As(err); app.Status < 500 {
			return nil, err
		}
		return nil, apperrors.Internal("更新官方资料状态及审计失败")
	}
	return s.repository.BuildSummary(updated)
}
