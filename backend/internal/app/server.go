package app

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"studymate/backend/internal/config"
	"studymate/backend/internal/middleware"
	mysqlmigrations "studymate/backend/internal/migrations/mysql"
	adminhandler "studymate/backend/internal/modules/admin/handler"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	adminrouter "studymate/backend/internal/modules/admin/router"
	adminservice "studymate/backend/internal/modules/admin/service"
	aihandler "studymate/backend/internal/modules/ai/handler"
	airepo "studymate/backend/internal/modules/ai/repository"
	airouter "studymate/backend/internal/modules/ai/router"
	aiservice "studymate/backend/internal/modules/ai/service"
	authhandler "studymate/backend/internal/modules/auth/handler"
	authrepo "studymate/backend/internal/modules/auth/repository"
	authrouter "studymate/backend/internal/modules/auth/router"
	authservice "studymate/backend/internal/modules/auth/service"
	cardhandler "studymate/backend/internal/modules/card/handler"
	cardrepo "studymate/backend/internal/modules/card/repository"
	cardrouter "studymate/backend/internal/modules/card/router"
	cardservice "studymate/backend/internal/modules/card/service"
	communityhandler "studymate/backend/internal/modules/community/handler"
	communityrepo "studymate/backend/internal/modules/community/repository"
	communityrouter "studymate/backend/internal/modules/community/router"
	communityservice "studymate/backend/internal/modules/community/service"
	filehandler "studymate/backend/internal/modules/file/handler"
	filerepo "studymate/backend/internal/modules/file/repository"
	filerouter "studymate/backend/internal/modules/file/router"
	fileservice "studymate/backend/internal/modules/file/service"
	graphhandler "studymate/backend/internal/modules/graph/handler"
	graphrepo "studymate/backend/internal/modules/graph/repository"
	graphrouter "studymate/backend/internal/modules/graph/router"
	graphservice "studymate/backend/internal/modules/graph/service"
	materialhandler "studymate/backend/internal/modules/material/handler"
	materialrepo "studymate/backend/internal/modules/material/repository"
	materialrouter "studymate/backend/internal/modules/material/router"
	materialservice "studymate/backend/internal/modules/material/service"
	notehandler "studymate/backend/internal/modules/note/handler"
	noterepo "studymate/backend/internal/modules/note/repository"
	noterouter "studymate/backend/internal/modules/note/router"
	noteservice "studymate/backend/internal/modules/note/service"
	readerhandler "studymate/backend/internal/modules/reader/handler"
	readerrepo "studymate/backend/internal/modules/reader/repository"
	readerrouter "studymate/backend/internal/modules/reader/router"
	readerservice "studymate/backend/internal/modules/reader/service"
	userhandler "studymate/backend/internal/modules/user/handler"
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

	if err := mysqlmigrations.Apply(deps.SQL); err != nil {
		return nil, fmt.Errorf("apply mysql migrations failed: %w", err)
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
	aiRepository := airepo.NewRepository(deps.SQL)
	aiDocumentRepository := airepo.NewDocumentRepository(deps.Mongo)
	communityRepository := communityrepo.NewRepository(deps.SQL)
	materialRepository := materialrepo.NewRepository(deps.SQL)
	noteRepository := noterepo.NewRepository(deps.SQL)
	noteDocumentRepository := noterepo.NewDocumentRepository(deps.Mongo)
	graphRepository := graphrepo.NewRepository(deps.SQL)
	graphDocumentRepository := graphrepo.NewDocumentRepository(deps.Mongo)
	readerRepository := readerrepo.NewRepository(deps.SQL)
	cardRepository := cardrepo.NewRepository(deps.SQL)

	authService := authservice.NewService(
		userRepository,
		refreshTokenRepository,
		auditRepository,
		tokenManager,
		cfg.Auth.RefreshTokenTTL,
	)
	userService := userservice.NewService(userRepository, auditRepository)
	aiService := aiservice.NewService(aiRepository, aiDocumentRepository, auditRepository)
	fileService := fileservice.NewService(fileRepository, auditRepository, cfg.Storage.UploadDir)
	communityService := communityservice.NewService(communityRepository, auditRepository)
	materialService := materialservice.NewService(materialRepository, auditRepository)
	noteService := noteservice.NewService(noteRepository, noteDocumentRepository, materialRepository, auditRepository, aiService, cfg.Content.NoteReadModel)
	readerService := readerservice.NewService(readerRepository, materialRepository, auditRepository, aiService)
	cardService := cardservice.NewService(cardRepository, auditRepository, aiService)
	graphService := graphservice.NewService(graphRepository, graphDocumentRepository, auditRepository, cardService, aiService)
	adminModerationService := adminservice.NewService(
		auditRepository,
		communityRepository,
		materialRepository,
		graphRepository,
		userRepository,
	)

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
	aiHandler := aihandler.NewHandler(aiService)
	fileHandler := filehandler.NewHandler(fileService)
	adminHandler := adminhandler.NewHandler(authService, userService, adminModerationService)
	moderationHandler := adminhandler.NewModerationHandler(adminModerationService)
	communityHandler := communityhandler.NewHandler(communityService)
	materialHandler := materialhandler.NewHandler(materialService)
	noteHandler := notehandler.NewHandler(noteService)
	graphHandler := graphhandler.NewHandler(graphService)
	readerHandler := readerhandler.NewHandler(readerService)
	cardHandler := cardhandler.NewHandler(cardService)

	server.registerRoutes(
		tokenManager,
		authHandler,
		userHandler,
		aiHandler,
		fileHandler,
		adminHandler,
		moderationHandler,
		communityHandler,
		materialHandler,
		noteHandler,
		graphHandler,
		readerHandler,
		cardHandler,
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
	aiHandler *aihandler.Handler,
	fileHandler *filehandler.Handler,
	adminHandler *adminhandler.Handler,
	moderationHandler *adminhandler.ModerationHandler,
	communityHandler *communityhandler.Handler,
	materialHandler *materialhandler.Handler,
	noteHandler *notehandler.Handler,
	graphHandler *graphhandler.Handler,
	readerHandler *readerhandler.Handler,
	cardHandler *cardhandler.Handler,
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
	airouter.RegisterRoutes(protected, aiHandler)
	filerouter.RegisterRoutes(protected, fileHandler)
	communityrouter.RegisterProtectedRoutes(protected, communityHandler)
	materialrouter.RegisterProtectedRoutes(protected, materialHandler)
	noterouter.RegisterRoutes(protected, noteHandler)
	graphrouter.RegisterRoutes(protected, graphHandler)
	readerrouter.RegisterRoutes(protected, readerHandler)
	cardrouter.RegisterRoutes(protected, cardHandler)

	adminrouter.RegisterRoutes(api, adminHandler, moderationHandler, tokenManager)
}
