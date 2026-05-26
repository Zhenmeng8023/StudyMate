package service

import (
	"errors"
	"net/http"

	"gorm.io/gorm"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	communitydto "studymate/backend/internal/modules/community/dto"
	communitymodel "studymate/backend/internal/modules/community/model"
	communityrepo "studymate/backend/internal/modules/community/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type Service struct {
	repository *communityrepo.Repository
	auditLogs  *adminrepo.AuditLogRepository
}

func NewService(repository *communityrepo.Repository, auditLogs *adminrepo.AuditLogRepository) *Service {
	return &Service{
		repository: repository,
		auditLogs:  auditLogs,
	}
}

func (s *Service) ListPosts() ([]communitydto.PostSummary, error) {
	posts, err := s.repository.ListApprovedPosts()
	if err != nil {
		return nil, apperrors.Internal("读取帖子列表失败")
	}
	return posts, nil
}

func (s *Service) CreatePost(authorUserID string, request communitydto.CreatePostRequest) (*communitydto.PostDetail, error) {
	post := &communitymodel.Post{
		AuthorUserID: authorUserID,
		Title:        request.Title,
		Body:         request.Body,
		Kind:         request.Kind,
		Status:       "pending",
	}
	if err := s.repository.CreatePost(post); err != nil {
		return nil, apperrors.Internal("创建帖子失败")
	}

	_ = s.auditLogs.Create(authorUserID, "community.post.create", "post", map[string]any{
		"postId": post.ID,
	})

	return s.repository.BuildPostDetail(post)
}

func (s *Service) GetPost(postID string) (*communitydto.PostDetail, error) {
	post, err := s.repository.FindPostByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "post_not_found", "帖子不存在")
		}
		return nil, apperrors.Internal("读取帖子失败")
	}
	if post.Status != "approved" {
		return nil, apperrors.New(http.StatusNotFound, "post_not_visible", "帖子暂未公开")
	}
	return s.repository.BuildPostDetail(post)
}

func (s *Service) CreateComment(authorUserID string, postID string, request communitydto.CreateCommentRequest) (*communitydto.PostDetail, error) {
	post, err := s.repository.FindPostByID(postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "post_not_found", "帖子不存在")
		}
		return nil, apperrors.Internal("读取帖子失败")
	}
	if post.Status != "approved" {
		return nil, apperrors.New(http.StatusBadRequest, "post_not_open", "当前帖子还不能评论")
	}

	comment := &communitymodel.Comment{
		PostID:       postID,
		AuthorUserID: authorUserID,
		Body:         request.Body,
		Status:       "approved",
	}
	if err := s.repository.CreateComment(comment); err != nil {
		return nil, apperrors.Internal("发表评论失败")
	}

	_ = s.auditLogs.Create(authorUserID, "community.comment.create", "comment", map[string]any{
		"postId": postID,
	})

	return s.repository.BuildPostDetail(post)
}

func (s *Service) ToggleLike(userID string, postID string) (*communitydto.ToggleResponse, error) {
	post, err := s.repository.FindPostByID(postID)
	if err != nil || post.Status != "approved" {
		return nil, apperrors.New(http.StatusNotFound, "post_not_found", "帖子不存在")
	}

	active, count, err := s.repository.ToggleLike(postID, userID)
	if err != nil {
		return nil, apperrors.Internal("更新点赞状态失败")
	}

	return &communitydto.ToggleResponse{Active: active, Count: count}, nil
}

func (s *Service) ToggleFavorite(userID string, postID string) (*communitydto.ToggleResponse, error) {
	post, err := s.repository.FindPostByID(postID)
	if err != nil || post.Status != "approved" {
		return nil, apperrors.New(http.StatusNotFound, "post_not_found", "帖子不存在")
	}

	active, count, err := s.repository.ToggleFavorite(postID, userID)
	if err != nil {
		return nil, apperrors.Internal("更新收藏状态失败")
	}

	return &communitydto.ToggleResponse{Active: active, Count: count}, nil
}
