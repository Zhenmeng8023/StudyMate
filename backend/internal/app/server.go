package app

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"studymate/backend/internal/config"
	"studymate/backend/internal/middleware"
	adminhandler "studymate/backend/internal/modules/admin/handler"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	adminrouter "studymate/backend/internal/modules/admin/router"
	adminservice "studymate/backend/internal/modules/admin/service"
	authhandler "studymate/backend/internal/modules/auth/handler"
	authmodel "studymate/backend/internal/modules/auth/model"
	authrepo "studymate/backend/internal/modules/auth/repository"
	authrouter "studymate/backend/internal/modules/auth/router"
	authservice "studymate/backend/internal/modules/auth/service"
	communityhandler "studymate/backend/internal/modules/community/handler"
	communitymodel "studymate/backend/internal/modules/community/model"
	communityrepo "studymate/backend/internal/modules/community/repository"
	communityrouter "studymate/backend/internal/modules/community/router"
	communityservice "studymate/backend/internal/modules/community/service"
	filehandler "studymate/backend/internal/modules/file/handler"
	filemodel "studymate/backend/internal/modules/file/model"
	filerepo "studymate/backend/internal/modules/file/repository"
	filerouter "studymate/backend/internal/modules/file/router"
	fileservice "studymate/backend/internal/modules/file/service"
	materialhandler "studymate/backend/internal/modules/material/handler"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	materialrouter "studymate/backend/internal/modules/material/router"
	materialservice "studymate/backend/internal/modules/material/service"
	notehandler "studymate/backend/internal/modules/note/handler"
	notemodel "studymate/backend/internal/modules/note/model"
	noterepo "studymate/backend/internal/modules/note/repository"
	noterouter "studymate/backend/internal/modules/note/router"
	noteservice "studymate/backend/internal/modules/note/service"
	readerhandler "studymate/backend/internal/modules/reader/handler"
	readermodel "studymate/backend/internal/modules/reader/model"
	readerrepo "studymate/backend/internal/modules/reader/repository"
	readerrouter "studymate/backend/internal/modules/reader/router"
	readerservice "studymate/backend/internal/modules/reader/service"
	userhandler "studymate/backend/internal/modules/user/handler"
	usermodel "studymate/backend/internal/modules/user/model"
	userrepo "studymate/backend/internal/modules/user/repository"
	userrouter "studymate/backend/internal/modules/user/router"
	userservice "studymate/backend/internal/modules/user/service"
	"studymate/backend/internal/pkg/database"
	"studymate/backend/internal/pkg/security"
)

type Server struct {
	config config.Config
	router *gin.Engine
	deps   *database.Dependencies
}

func NewServer(cfg config.Config) (*Server, error) {
	deps, err := database.Connect(cfg)
	if err != nil {
		return nil, err
	}

	if err := deps.SQL.AutoMigrate(
		&usermodel.User{},
		&authmodel.RefreshToken{},
		&filemodel.FileRecord{},
		&adminmodel.AuditLog{},
		&communitymodel.Post{},
		&communitymodel.Comment{},
		&communitymodel.PostLike{},
		&communitymodel.PostFavorite{},
		&materialmodel.Material{},
		&materialmodel.MaterialFavorite{},
		&materialmodel.MaterialRating{},
		&notemodel.Note{},
		&notemodel.NoteVersion{},
		&notemodel.NoteRelation{},
		&readermodel.ReadingProgress{},
		&readermodel.PDFAnnotation{},
	); err != nil {
		return nil, fmt.Errorf("auto-migrate failed: %w", err)
	}

	tokenManager := security.NewTokenManager(
		cfg.Auth.JWTSecret,
		cfg.Auth.AccessTokenTTL,
		cfg.Auth.RefreshTokenTTL,
	)

	userRepository := userrepo.NewRepository(deps.SQL)
	refreshTokenRepository := authrepo.NewRefreshTokenRepository(deps.SQL)
	fileRepository := filerepo.NewRepository(deps.SQL)
	auditRepository := adminrepo.NewAuditLogRepository(deps.SQL)
	communityRepository := communityrepo.NewRepository(deps.SQL)
	materialRepository := materialrepo.NewRepository(deps.SQL)
	noteRepository := noterepo.NewRepository(deps.SQL)
	readerRepository := readerrepo.NewRepository(deps.SQL)

	authService := authservice.NewService(
		userRepository,
		refreshTokenRepository,
		auditRepository,
		tokenManager,
		cfg.Auth.RefreshTokenTTL,
	)
	userService := userservice.NewService(userRepository, auditRepository)
	fileService := fileservice.NewService(fileRepository, auditRepository, cfg.Storage.UploadDir)
	communityService := communityservice.NewService(communityRepository, auditRepository)
	materialService := materialservice.NewService(materialRepository, auditRepository)
	noteService := noteservice.NewService(noteRepository, materialRepository, auditRepository)
	readerService := readerservice.NewService(readerRepository, materialRepository, auditRepository)
	adminModerationService := adminservice.NewService(auditRepository, communityRepository, materialRepository)

	if err := authService.EnsureBootstrapAdmin(cfg.Bootstrap); err != nil {
		return nil, err
	}

	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:8001",
			"http://localhost:8002",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	server := &Server{
		config: cfg,
		router: router,
		deps:   deps,
	}

	authHandler := authhandler.NewHandler(authService)
	userHandler := userhandler.NewHandler(userService)
	fileHandler := filehandler.NewHandler(fileService)
	adminHandler := adminhandler.NewHandler(authService, userService)
	moderationHandler := adminhandler.NewModerationHandler(adminModerationService)
	communityHandler := communityhandler.NewHandler(communityService)
	materialHandler := materialhandler.NewHandler(materialService)
	noteHandler := notehandler.NewHandler(noteService)
	readerHandler := readerhandler.NewHandler(readerService)

	server.registerRoutes(
		tokenManager,
		authHandler,
		userHandler,
		fileHandler,
		adminHandler,
		moderationHandler,
		communityHandler,
		materialHandler,
		noteHandler,
		readerHandler,
	)

	return server, nil
}

func (s *Server) Run() error {
	return s.router.Run(":" + s.config.App.Port)
}

func (s *Server) registerRoutes(
	tokenManager *security.TokenManager,
	authHandler *authhandler.Handler,
	userHandler *userhandler.Handler,
	fileHandler *filehandler.Handler,
	adminHandler *adminhandler.Handler,
	moderationHandler *adminhandler.ModerationHandler,
	communityHandler *communityhandler.Handler,
	materialHandler *materialhandler.Handler,
	noteHandler *notehandler.Handler,
	readerHandler *readerhandler.Handler,
) {
	s.router.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"app":    s.config.App.Name,
			"env":    s.config.App.Env,
			"deps":   s.deps.Status,
		})
	})

	api := s.router.Group("/api/v1")
	api.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"scope":  "api",
			"deps":   s.deps.Status,
		})
	})

	authGroup := api.Group("")
	authrouter.RegisterPublicRoutes(authGroup, authHandler)
	communityrouter.RegisterPublicRoutes(authGroup, communityHandler)
	materialrouter.RegisterPublicRoutes(authGroup, materialHandler)

	protected := api.Group("")
	protected.Use(middleware.Authenticate(tokenManager))
	authrouter.RegisterProtectedRoutes(protected, authHandler)
	userrouter.RegisterRoutes(protected, userHandler)
	filerouter.RegisterRoutes(protected, fileHandler)
	communityrouter.RegisterProtectedRoutes(protected, communityHandler)
	materialrouter.RegisterProtectedRoutes(protected, materialHandler)
	noterouter.RegisterRoutes(protected, noteHandler)
	readerrouter.RegisterRoutes(protected, readerHandler)

	adminrouter.RegisterRoutes(api, adminHandler, moderationHandler, tokenManager)
}
