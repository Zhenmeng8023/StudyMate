package service

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"strings"
	"time"

	adminrepo "studymate/backend/internal/modules/admin/repository"
	sharedto "studymate/backend/internal/modules/share/dto"
	sharemodel "studymate/backend/internal/modules/share/model"
	sharerepo "studymate/backend/internal/modules/share/repository"
	"studymate/backend/internal/pkg/apperrors"

	"gorm.io/gorm"
)

var allowedTargets = map[string]string{
	"material": "/materials",
	"note":     "/notes",
	"graph":    "/graph",
	"deck":     "/review",
}

var allowedModes = map[string]bool{
	"private": true,
	"public":  true,
	"token":   true,
}

type Service struct {
	repository *sharerepo.Repository
	db         *gorm.DB
	auditLogs  *adminrepo.AuditLogRepository
}

func NewService(repository *sharerepo.Repository, db *gorm.DB, auditLogs *adminrepo.AuditLogRepository) *Service {
	return &Service{repository: repository, db: db, auditLogs: auditLogs}
}

func (s *Service) Create(ownerUserID string, request sharedto.CreateLinkRequest) (*sharedto.LinkPayload, error) {
	targetType := strings.ToLower(strings.TrimSpace(request.TargetType))
	if _, ok := allowedTargets[targetType]; !ok {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_share_target", "unsupported share target")
	}

	mode := strings.ToLower(strings.TrimSpace(request.Mode))
	if !allowedModes[mode] {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_share_mode", "unsupported share mode")
	}

	if strings.TrimSpace(request.TargetID) == "" {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_share_target_id", "target id is required")
	}

	var expiresAt *time.Time
	if strings.TrimSpace(request.ExpiresAt) != "" {
		parsed, err := time.Parse(time.RFC3339, request.ExpiresAt)
		if err != nil {
			return nil, apperrors.New(http.StatusBadRequest, "invalid_share_expiry", "expiresAt must be RFC3339")
		}
		expiresAt = &parsed
	}

	allowed, err := s.ownerCanShare(ownerUserID, targetType, request.TargetID)
	if err != nil {
		return nil, err
	}
	if !allowed {
		return nil, apperrors.New(http.StatusForbidden, "share_forbidden", "you cannot share this target")
	}

	token, err := randomToken()
	if err != nil {
		return nil, apperrors.Internal("create share token failed")
	}

	link := &sharemodel.ShareLink{
		OwnerUserID: ownerUserID,
		TargetType:  targetType,
		TargetID:    strings.TrimSpace(request.TargetID),
		Mode:        mode,
		Token:       token,
		Status:      "active",
		ExpiresAt:   expiresAt,
	}
	if err := s.repository.Create(link); err != nil {
		return nil, apperrors.Internal("create share link failed")
	}

	_ = s.auditLogs.Create(ownerUserID, "share.link.create", "share_link", map[string]any{
		"targetType": targetType,
		"targetId":   request.TargetID,
		"mode":       mode,
	})

	payload := buildLinkPayload(*link)
	return &payload, nil
}

func (s *Service) List(ownerUserID string) ([]sharedto.LinkPayload, error) {
	links, err := s.repository.ListByOwner(ownerUserID)
	if err != nil {
		return nil, apperrors.Internal("list share links failed")
	}

	payloads := make([]sharedto.LinkPayload, 0, len(links))
	for _, link := range links {
		payloads = append(payloads, buildLinkPayload(link))
	}
	return payloads, nil
}

func (s *Service) Revoke(ownerUserID string, linkID string) error {
	if err := s.repository.Revoke(ownerUserID, linkID, time.Now().UTC()); err != nil {
		if s.repository.IsNotFound(err) {
			return apperrors.New(http.StatusNotFound, "share_link_not_found", "share link not found")
		}
		return apperrors.Internal("revoke share link failed")
	}

	_ = s.auditLogs.Create(ownerUserID, "share.link.revoke", "share_link", map[string]any{"linkId": linkID})
	return nil
}

func (s *Service) Resolve(token string) (*sharedto.PublicResolvePayload, error) {
	link, err := s.repository.FindActiveByToken(strings.TrimSpace(token), time.Now().UTC())
	if err != nil {
		if s.repository.IsNotFound(err) {
			return nil, apperrors.New(http.StatusNotFound, "share_link_not_found", "share link not found")
		}
		return nil, apperrors.Internal("resolve share link failed")
	}

	target, err := s.describeTarget(*link)
	if err != nil {
		return nil, err
	}

	return &sharedto.PublicResolvePayload{
		Token:      link.Token,
		Mode:       link.Mode,
		TargetType: link.TargetType,
		TargetID:   link.TargetID,
		Title:      target.Title,
		Summary:    target.Summary,
		URL:        target.URL,
		ReadOnly:   true,
		Metadata: map[string]any{
			"status": target.Status,
			"source": target.Source,
		},
	}, nil
}

type targetSummary struct {
	Title   string
	Summary string
	URL     string
	Status  string
	Source  string
}

func (s *Service) ownerCanShare(ownerUserID string, targetType string, targetID string) (bool, error) {
	var count int64
	var err error
	switch targetType {
	case "material":
		err = s.db.Table("materials").Where("id = ? AND owner_user_id = ?", targetID, ownerUserID).Count(&count).Error
	case "note":
		err = s.db.Table("notes").Where("id = ? AND owner_user_id = ?", targetID, ownerUserID).Count(&count).Error
	case "graph":
		err = s.db.Table("graphs").Where("id = ? AND owner_user_id = ?", targetID, ownerUserID).Count(&count).Error
	case "deck":
		err = s.db.Table("decks").Where("id = ? AND owner_user_id = ?", targetID, ownerUserID).Count(&count).Error
	}
	if err != nil {
		return false, apperrors.Internal("verify share ownership failed")
	}
	return count > 0, nil
}

func (s *Service) describeTarget(link sharemodel.ShareLink) (*targetSummary, error) {
	var row targetSummary
	var err error
	switch link.TargetType {
	case "material":
		err = s.db.Table("materials").Select("title, description AS summary, status, 'material' AS source").
			Where("id = ?", link.TargetID).Scan(&row).Error
		row.URL = "/materials?selected=" + link.TargetID
	case "note":
		err = s.db.Table("notes").Select("title, summary, 'active' AS status, 'note' AS source").
			Where("id = ?", link.TargetID).Scan(&row).Error
		row.URL = "/notes?selected=" + link.TargetID
	case "graph":
		err = s.db.Table("graphs").Select("title, description AS summary, status, 'graph' AS source").
			Where("id = ?", link.TargetID).Scan(&row).Error
		row.URL = "/graph?graphId=" + link.TargetID
	case "deck":
		err = s.db.Table("decks").Select("title, description AS summary, 'active' AS status, 'deck' AS source").
			Where("id = ?", link.TargetID).Scan(&row).Error
		row.URL = "/review"
	}
	if err != nil {
		return nil, apperrors.Internal("load shared target failed")
	}
	if row.Title == "" {
		return nil, apperrors.New(http.StatusNotFound, "shared_target_not_found", "shared target not found")
	}
	return &row, nil
}

func randomToken() (string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(raw), nil
}

func buildLinkPayload(link sharemodel.ShareLink) sharedto.LinkPayload {
	payload := sharedto.LinkPayload{
		ID:          link.ID,
		OwnerUserID: link.OwnerUserID,
		TargetType:  link.TargetType,
		TargetID:    link.TargetID,
		Mode:        link.Mode,
		Token:       link.Token,
		Status:      link.Status,
		URL:         "/share/" + link.Token,
		CreatedAt:   link.CreatedAt.UTC().Format(time.RFC3339),
	}
	if link.ExpiresAt != nil {
		payload.ExpiresAt = link.ExpiresAt.UTC().Format(time.RFC3339)
	}
	if link.RevokedAt != nil {
		payload.RevokedAt = link.RevokedAt.UTC().Format(time.RFC3339)
	}
	return payload
}
