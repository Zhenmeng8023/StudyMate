package service

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"gorm.io/gorm"

	"studymate/backend/internal/config"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	"studymate/backend/internal/modules/auth/dto"
	authmodel "studymate/backend/internal/modules/auth/model"
	authrepo "studymate/backend/internal/modules/auth/repository"
	usermodel "studymate/backend/internal/modules/user/model"
	userrepo "studymate/backend/internal/modules/user/repository"
	"studymate/backend/internal/pkg/apperrors"
	"studymate/backend/internal/pkg/security"
)

type Service struct {
	users           *userrepo.Repository
	refreshTokens   *authrepo.RefreshTokenRepository
	auditLogs       *adminrepo.AuditLogRepository
	tokenManager    *security.TokenManager
	refreshTokenTTL time.Duration
}

func NewService(
	users *userrepo.Repository,
	refreshTokens *authrepo.RefreshTokenRepository,
	auditLogs *adminrepo.AuditLogRepository,
	tokenManager *security.TokenManager,
	refreshTokenTTL time.Duration,
) *Service {
	return &Service{
		users:           users,
		refreshTokens:   refreshTokens,
		auditLogs:       auditLogs,
		tokenManager:    tokenManager,
		refreshTokenTTL: refreshTokenTTL,
	}
}

func (s *Service) Register(request dto.RegisterRequest) (*dto.AuthResponse, error) {
	username := strings.TrimSpace(request.Username)
	email := strings.ToLower(strings.TrimSpace(request.Email))
	displayName := strings.TrimSpace(request.DisplayName)
	if displayName == "" {
		displayName = username
	}

	exists, err := s.users.ExistsByUsername(username)
	if err != nil {
		return nil, apperrors.Internal("检查用户名是否存在失败")
	}
	if exists {
		return nil, apperrors.New(http.StatusConflict, "username_taken", "用户名已存在")
	}

	exists, err = s.users.ExistsByEmail(email)
	if err != nil {
		return nil, apperrors.Internal("检查邮箱是否存在失败")
	}
	if exists {
		return nil, apperrors.New(http.StatusConflict, "email_taken", "邮箱已存在")
	}

	passwordHash, err := security.HashPassword(request.Password)
	if err != nil {
		return nil, apperrors.Internal("密码处理失败")
	}

	user := &usermodel.User{
		Username:     username,
		Email:        email,
		PasswordHash: passwordHash,
		DisplayName:  displayName,
		Role:         "user",
	}
	if err := s.users.Create(user); err != nil {
		return nil, apperrors.Internal("创建用户失败")
	}

	_ = s.auditLogs.Create(user.ID, "auth.register", "user", map[string]any{
		"email":    user.Email,
		"username": user.Username,
	})

	return s.issueTokens(user)
}

func (s *Service) Login(request dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.users.FindByLogin(strings.TrimSpace(request.Login))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusUnauthorized, "invalid_credentials", "账号或密码错误")
		}

		return nil, apperrors.Internal("查询账号失败")
	}

	if err := security.ComparePassword(user.PasswordHash, request.Password); err != nil {
		return nil, apperrors.New(http.StatusUnauthorized, "invalid_credentials", "账号或密码错误")
	}

	_ = s.auditLogs.Create(user.ID, "auth.login", "user", map[string]any{
		"role": user.Role,
	})

	return s.issueTokens(user)
}

func (s *Service) LoginAdmin(request dto.LoginRequest) (*dto.AuthResponse, error) {
	response, err := s.Login(request)
	if err != nil {
		return nil, err
	}

	if response.User.Role != "admin" {
		return nil, apperrors.New(http.StatusForbidden, "admin_only", "当前账号不是管理员")
	}

	return response, nil
}

func (s *Service) Refresh(request dto.RefreshRequest) (*dto.AuthResponse, error) {
	tokenHash := s.tokenManager.HashToken(request.RefreshToken)
	storedToken, err := s.refreshTokens.FindByHash(tokenHash)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusUnauthorized, "invalid_refresh_token", "刷新令牌无效")
		}

		return nil, apperrors.Internal("查询刷新令牌失败")
	}

	if storedToken.RevokedAt != nil || time.Now().After(storedToken.ExpiresAt) {
		return nil, apperrors.New(http.StatusUnauthorized, "refresh_token_expired", "刷新令牌已失效")
	}

	user, err := s.users.FindByID(storedToken.UserID)
	if err != nil {
		return nil, apperrors.New(http.StatusUnauthorized, "user_not_found", "关联用户不存在")
	}

	if err := s.refreshTokens.RevokeByHash(tokenHash); err != nil {
		return nil, apperrors.Internal("撤销旧刷新令牌失败")
	}

	_ = s.auditLogs.Create(user.ID, "auth.refresh", "user", nil)

	return s.issueTokens(user)
}

func (s *Service) Logout(request dto.LogoutRequest, actorID string) error {
	tokenHash := s.tokenManager.HashToken(request.RefreshToken)
	if err := s.refreshTokens.RevokeByHash(tokenHash); err != nil {
		return apperrors.Internal("注销会话失败")
	}

	_ = s.auditLogs.Create(actorID, "auth.logout", "user", nil)
	return nil
}

func (s *Service) EnsureBootstrapAdmin(cfg config.BootstrapConfig) error {
	if cfg.AdminEmail == "" || cfg.AdminUsername == "" || cfg.AdminPassword == "" {
		return nil
	}

	user, err := s.users.FindByEmail(strings.ToLower(strings.TrimSpace(cfg.AdminEmail)))
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return apperrors.Internal("检查管理员引导账号失败")
	}

	if user == nil && errors.Is(err, gorm.ErrRecordNotFound) {
		passwordHash, hashErr := security.HashPassword(cfg.AdminPassword)
		if hashErr != nil {
			return apperrors.Internal("初始化管理员密码失败")
		}

		adminUser := &usermodel.User{
			Username:     strings.TrimSpace(cfg.AdminUsername),
			Email:        strings.ToLower(strings.TrimSpace(cfg.AdminEmail)),
			PasswordHash: passwordHash,
			DisplayName:  "系统管理员",
			Role:         "admin",
		}

		if createErr := s.users.Create(adminUser); createErr != nil {
			return apperrors.Internal("创建管理员引导账号失败")
		}

		return nil
	}

	if user != nil && user.Role != "admin" {
		user.Role = "admin"
		if saveErr := s.users.Save(user); saveErr != nil {
			return apperrors.Internal("更新管理员角色失败")
		}
	}

	return nil
}

func (s *Service) issueTokens(user *usermodel.User) (*dto.AuthResponse, error) {
	accessToken, accessExpiresAt, err := s.tokenManager.GenerateAccessToken(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, apperrors.Internal("生成访问令牌失败")
	}

	refreshToken, refreshExpiresAt := s.tokenManager.GenerateRefreshToken()
	refreshTokenRecord := &authmodel.RefreshToken{
		UserID:    user.ID,
		TokenHash: s.tokenManager.HashToken(refreshToken),
		ExpiresAt: refreshExpiresAt,
	}
	if err := s.refreshTokens.Create(refreshTokenRecord); err != nil {
		return nil, apperrors.Internal("保存刷新令牌失败")
	}

	return &dto.AuthResponse{
		AccessToken:          accessToken,
		RefreshToken:         refreshToken,
		AccessTokenExpiresAt: accessExpiresAt.Format(time.RFC3339),
		User: dto.AuthUserResponse{
			ID:          user.ID,
			Username:    user.Username,
			Email:       user.Email,
			DisplayName: user.DisplayName,
			Role:        user.Role,
		},
	}, nil
}
