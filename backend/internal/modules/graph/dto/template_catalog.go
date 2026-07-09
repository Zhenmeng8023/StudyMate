package dto

import "strings"

type DiagramTemplateCatalogEntry struct {
	DiagramTemplatePayload
	SourceType string
}

func DefaultDiagramTemplateCatalog() []DiagramTemplateCatalogEntry {
	return []DiagramTemplateCatalogEntry{
		{
			DiagramTemplatePayload: DiagramTemplatePayload{
				ID:          "learning-material-map",
				Name:        "学习资料梳理",
				Category:    "learning-material",
				Description: "把资料、批注、笔记和待理解概念组织成一条可追踪学习链。",
				Mode:        "learning",
				SampleLines: []string{"资料主线", "关键批注", "沉淀笔记", "待理解概念"},
			},
			SourceType: "system",
		},
		{
			DiagramTemplatePayload: DiagramTemplatePayload{
				ID:          "book-notes-map",
				Name:        "读书笔记",
				Category:    "book-notes",
				Description: "围绕书籍章节、章节摘要、核心观点和问题反思沉淀长期笔记。",
				Mode:        "learning",
				SampleLines: []string{"书籍/章节", "章节摘要", "核心观点", "问题与反思"},
			},
			SourceType: "system",
		},
		{
			DiagramTemplatePayload: DiagramTemplatePayload{
				ID:          "concept-network",
				Name:        "概念网络",
				Category:    "concept-network",
				Description: "把核心概念、前置概念、相关概念和 AI 解释草稿连接起来。",
				Mode:        "learning",
				SampleLines: []string{"核心概念", "前置概念", "相关概念", "AI 解释草稿"},
			},
			SourceType: "system",
		},
		{
			DiagramTemplatePayload: DiagramTemplatePayload{
				ID:          "review-card-prep",
				Name:        "复习卡片准备",
				Category:    "review-card",
				Description: "从复习来源笔记整理可提问知识点、卡片草稿和易混淆点。",
				Mode:        "learning",
				SampleLines: []string{"复习来源笔记", "可提问知识点", "卡片草稿", "易混淆点"},
			},
			SourceType: "system",
		},
		{
			DiagramTemplatePayload: DiagramTemplatePayload{
				ID:          "uml-class-diagram",
				Name:        "UML 类图",
				Category:    "uml",
				Description: "梳理类、接口、属性、方法和依赖关系，适合软件设计课程复盘。",
				Mode:        "diagram",
				SampleLines: []string{"领域模型", "核心类", "接口契约", "依赖关系"},
			},
			SourceType: "system",
		},
		{
			DiagramTemplatePayload: DiagramTemplatePayload{
				ID:          "erd-schema-diagram",
				Name:        "ERD 数据模型",
				Category:    "erd",
				Description: "从实体、字段、主键和关系整理数据库结构，后续可承接 SQL DDL 导入草稿。",
				Mode:        "diagram",
				SampleLines: []string{"业务实体", "关键字段", "主键约束", "实体关系"},
			},
			SourceType: "system",
		},
		{
			DiagramTemplatePayload: DiagramTemplatePayload{
				ID:          "c4-context-diagram",
				Name:        "C4 上下文图",
				Category:    "c4",
				Description: "表达系统、用户、外部依赖和边界，适合架构学习和项目复盘。",
				Mode:        "diagram",
				SampleLines: []string{"目标系统", "使用者", "外部系统", "系统边界"},
			},
			SourceType: "system",
		},
		{
			DiagramTemplatePayload: DiagramTemplatePayload{
				ID:          "flowchart-process",
				Name:        "流程图",
				Category:    "flowchart",
				Description: "把步骤、判断、输入输出和异常路径整理成可复习的流程图。",
				Mode:        "diagram",
				SampleLines: []string{"开始", "关键步骤", "判断分支", "结束/回滚"},
			},
			SourceType: "system",
		},
	}
}

func FindDiagramTemplateCatalogEntry(templateID string) (DiagramTemplateCatalogEntry, bool) {
	for _, entry := range DefaultDiagramTemplateCatalog() {
		if entry.ID == templateID {
			return entry, true
		}
	}

	return DiagramTemplateCatalogEntry{}, false
}

func NormalizeDiagramTemplateStatus(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "enabled", "published":
		return "published"
	case "disabled", "unpublished":
		return "unpublished"
	default:
		return "published"
	}
}
