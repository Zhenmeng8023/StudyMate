package service

import (
	admindto "studymate/backend/internal/modules/admin/dto"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	communityrepo "studymate/backend/internal/modules/community/repository"
	graphrepo "studymate/backend/internal/modules/graph/repository"
	materialrepo "studymate/backend/internal/modules/material/repository"
	userrepo "studymate/backend/internal/modules/user/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type Service struct {
	auditLogs *adminrepo.AuditLogRepository
	community *communityrepo.Repository
	materials *materialrepo.Repository
	graphs    *graphrepo.Repository
	users     *userrepo.Repository
}

func NewService(
	auditLogs *adminrepo.AuditLogRepository,
	community *communityrepo.Repository,
	materials *materialrepo.Repository,
	graphs *graphrepo.Repository,
	users *userrepo.Repository,
) *Service {
	return &Service{
		auditLogs: auditLogs,
		community: community,
		materials: materials,
		graphs:    graphs,
		users:     users,
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

func (s *Service) Overview() (*admindto.OverviewPayload, error) {
	userCount, err := s.users.CountAll()
	if err != nil {
		return nil, apperrors.Internal("读取用户概览失败")
	}

	postCount, err := s.community.CountAllPosts()
	if err != nil {
		return nil, apperrors.Internal("读取帖子概览失败")
	}

	materialCount, err := s.materials.CountAllMaterials()
	if err != nil {
		return nil, apperrors.Internal("读取资料概览失败")
	}

	graphCount, err := s.graphs.CountAllGraphs()
	if err != nil {
		return nil, apperrors.Internal("读取图谱概览失败")
	}

	pendingPosts, err := s.community.CountPendingPosts()
	if err != nil {
		return nil, apperrors.Internal("读取待审核帖子数量失败")
	}

	pendingMaterials, err := s.materials.CountPendingMaterials()
	if err != nil {
		return nil, apperrors.Internal("读取待审核资料数量失败")
	}

	return &admindto.OverviewPayload{
		UserCount:              userCount,
		PostCount:              postCount,
		MaterialCount:          materialCount,
		GraphCount:             graphCount,
		PendingModerationCount: pendingPosts + pendingMaterials,
	}, nil
}
