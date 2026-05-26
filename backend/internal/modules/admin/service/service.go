package service

import (
	admindto "studymate/backend/internal/modules/admin/dto"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	communityrepo "studymate/backend/internal/modules/community/repository"
	materialrepo "studymate/backend/internal/modules/material/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type Service struct {
	auditLogs *adminrepo.AuditLogRepository
	community *communityrepo.Repository
	materials *materialrepo.Repository
}

func NewService(
	auditLogs *adminrepo.AuditLogRepository,
	community *communityrepo.Repository,
	materials *materialrepo.Repository,
) *Service {
	return &Service{
		auditLogs: auditLogs,
		community: community,
		materials: materials,
	}
}

func (s *Service) ListModerationItems() ([]admindto.ModerationItem, error) {
	postItems, err := s.community.ListPostsForModerationItems()
	if err != nil {
		return nil, apperrors.Internal("读取待审核帖子失败")
	}

	materialItems, err := s.materials.ListModerationItems()
	if err != nil {
		return nil, apperrors.Internal("读取待审核资料失败")
	}

	items := append(postItems, materialItems...)

	return items, nil
}

func (s *Service) ModeratePost(actorID string, postID string, status string, reason string) error {
	post, err := s.community.FindPostByID(postID)
	if err != nil {
		return apperrors.New(404, "post_not_found", "帖子不存在")
	}
	post.Status = status
	if err := s.community.SavePost(post); err != nil {
		return apperrors.Internal("更新帖子审核状态失败")
	}

	_ = s.auditLogs.Create(actorID, "admin.moderate.post", "post", map[string]any{
		"postId": postID,
		"status": status,
		"reason": reason,
	})
	return nil
}

func (s *Service) ModerateMaterial(actorID string, materialID string, status string, reason string) error {
	material, err := s.materials.FindByID(materialID)
	if err != nil {
		return apperrors.New(404, "material_not_found", "资料不存在")
	}
	material.Status = status
	if err := s.materials.Save(material); err != nil {
		return apperrors.Internal("更新资料审核状态失败")
	}

	_ = s.auditLogs.Create(actorID, "admin.moderate.material", "material", map[string]any{
		"materialId": materialID,
		"status":     status,
		"reason":     reason,
	})
	return nil
}
