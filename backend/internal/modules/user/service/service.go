package service

import (
	"net/http"
	"strings"

	adminrepo "studymate/backend/internal/modules/admin/repository"
	"studymate/backend/internal/modules/user/dto"
	userrepo "studymate/backend/internal/modules/user/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type Service struct {
	users     *userrepo.Repository
	auditLogs *adminrepo.AuditLogRepository
}

func NewService(users *userrepo.Repository, auditLogs *adminrepo.AuditLogRepository) *Service {
	return &Service{
		users:     users,
		auditLogs: auditLogs,
	}
}

func (s *Service) GetProfile(userID string) (*dto.ProfileResponse, error) {
	user, err := s.users.FindByID(userID)
	if err != nil {
		return nil, apperrors.New(http.StatusNotFound, "user_not_found", "用户不存在")
	}

	return &dto.ProfileResponse{
		ID:          user.ID,
		Username:    user.Username,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		Role:        user.Role,
	}, nil
}

func (s *Service) UpdateProfile(userID string, request dto.UpdateProfileRequest) (*dto.ProfileResponse, error) {
	user, err := s.users.FindByID(userID)
	if err != nil {
		return nil, apperrors.New(http.StatusNotFound, "user_not_found", "用户不存在")
	}

	email := strings.ToLower(strings.TrimSpace(request.Email))
	exists, err := s.users.ExistsByEmailExcludingUser(email, userID)
	if err != nil {
		return nil, apperrors.Internal("检查邮箱是否可用失败")
	}
	if exists {
		return nil, apperrors.New(http.StatusConflict, "email_taken", "邮箱已被其他账号使用")
	}

	user.DisplayName = strings.TrimSpace(request.DisplayName)
	user.Email = email
	if err := s.users.Save(user); err != nil {
		return nil, apperrors.Internal("更新用户资料失败")
	}

	_ = s.auditLogs.Create(user.ID, "user.update_profile", "user", map[string]any{
		"email": email,
	})

	return s.GetProfile(user.ID)
}
