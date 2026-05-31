package repository

import (
	"time"

	"gorm.io/gorm"
	graphdto "studymate/backend/internal/modules/graph/dto"
	graphmodel "studymate/backend/internal/modules/graph/model"
)

const graphSourceRelationType = "source"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(graph *graphmodel.Graph) error {
	return r.db.Create(graph).Error
}

func (r *Repository) Save(graph *graphmodel.Graph) error {
	return r.db.Save(graph).Error
}

func (r *Repository) Delete(graph *graphmodel.Graph) error {
	return r.db.Delete(graph).Error
}

func (r *Repository) FindByID(graphID string) (*graphmodel.Graph, error) {
	var graph graphmodel.Graph
	if err := r.db.First(&graph, "id = ?", graphID).Error; err != nil {
		return nil, err
	}

	return &graph, nil
}

func (r *Repository) ListByOwner(ownerUserID string) ([]graphdto.GraphSummaryPayload, error) {
	var graphs []graphmodel.Graph
	if err := r.db.Where("owner_user_id = ?", ownerUserID).Order("updated_at desc").Find(&graphs).Error; err != nil {
		return nil, err
	}

	result := make([]graphdto.GraphSummaryPayload, 0, len(graphs))
	for _, graph := range graphs {
		result = append(result, BuildSummary(graph))
	}

	return result, nil
}

func (r *Repository) CountAllGraphs() (int64, error) {
	var count int64
	err := r.db.Model(&graphmodel.Graph{}).Count(&count).Error
	return count, err
}

func (r *Repository) CreateVersion(version *graphmodel.GraphVersion) error {
	return r.db.Create(version).Error
}

func (r *Repository) ListVersions(graphID string, limit int) ([]graphdto.GraphSnapshotPayload, error) {
	query := r.db.Model(&graphmodel.GraphVersion{}).Where("graph_id = ?", graphID).Order("version_number desc")
	if limit > 0 {
		query = query.Limit(limit)
	}

	var versions []graphmodel.GraphVersion
	if err := query.Find(&versions).Error; err != nil {
		return nil, err
	}

	result := make([]graphdto.GraphSnapshotPayload, 0, len(versions))
	for _, version := range versions {
		result = append(result, graphdto.GraphSnapshotPayload{
			ID:            version.ID,
			GraphID:       version.GraphID,
			VersionNumber: version.VersionNumber,
			Summary:       version.Summary,
			CreatedAt:     version.CreatedAt.Format(time.RFC3339),
		})
	}

	return result, nil
}

func (r *Repository) DeleteVersions(graphID string) error {
	return r.db.Where("graph_id = ?", graphID).Delete(&graphmodel.GraphVersion{}).Error
}

func (r *Repository) DeleteRelations(graphID string) error {
	return r.db.Where("graph_id = ?", graphID).Delete(&graphmodel.GraphRelation{}).Error
}

func (r *Repository) ReplaceSourceRelations(graphID string, relations []graphmodel.GraphRelation) error {
	if err := r.db.Where("graph_id = ? AND relation_type = ?", graphID, graphSourceRelationType).Delete(&graphmodel.GraphRelation{}).Error; err != nil {
		return err
	}

	if len(relations) == 0 {
		return nil
	}

	return r.db.Create(&relations).Error
}

func BuildSummary(graph graphmodel.Graph) graphdto.GraphSummaryPayload {
	return graphdto.GraphSummaryPayload{
		ID:             graph.ID,
		OwnerUserID:    graph.OwnerUserID,
		Title:          graph.Title,
		Description:    graph.Description,
		Visibility:     graph.Visibility,
		Status:         graph.Status,
		GraphType:      graph.GraphType,
		Mode:           graph.Mode,
		CurrentVersion: graph.CurrentVersion,
		NodeCount:      graph.NodeCount,
		EdgeCount:      graph.EdgeCount,
		CreatedAt:      graph.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      graph.UpdatedAt.Format(time.RFC3339),
	}
}
