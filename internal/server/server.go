package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"my_project/internal/controller"
	"my_project/internal/database"
	"my_project/internal/repository"
	"my_project/internal/service"
)

type Server struct {
	port int
	db   database.Service

	// Dependencies
	UserRepository repository.UserRepository
	UserService    service.UserService
	UserController *controller.UserController
	PostController *controller.PostController
	AuthController *controller.AuthController
}

func NewServer() (*Server, error) {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	if port == 0 {
		port = 8080
	}

	// Initialize database
	db := database.New()

	// Test database connection
	health := db.Health()
	if health["status"] != "up" {
		return nil, fmt.Errorf("database connection failed: %s", health["error"])
	}

	// Initialize dependencies with Clean Architecture
	userRepo := repository.NewUserRepository(db.GetQueries())
	userService := service.NewUserService(userRepo)
	userController := controller.NewUserController(userService)

	postRepo := repository.NewPostRepository(db.GetQueries())
	postService := service.NewPostService(postRepo)
	postController := controller.NewPostController(postService)

	authController := controller.NewAuthController(userService)

	fmt.Printf("✅ Database connected successfully\n")
	fmt.Printf("✅ All dependencies initialized\n")

	return &Server{
		port:           port,
		db:             db,
		UserRepository: userRepo,
		UserService:    userService,
		UserController: userController,
		PostController: postController,
		AuthController: authController,
	}, nil
}

func (s *Server) Start() error {
	router := s.RegisterRoutes()

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", s.port),
		Handler:      router,
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("🛑 Shutting down server...")

		// Create shutdown context with timeout
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Shutdown server gracefully
		if err := server.Shutdown(ctx); err != nil {
			log.Printf("❌ Server forced to shutdown: %v", err)
		}

		// Close database connection
		if err := s.db.Close(); err != nil {
			log.Printf("❌ Database close error: %v", err)
		}

		log.Println("✅ Server exited successfully")
	}()

	fmt.Printf("🚀 Server starting on port %d\n", s.port)
	fmt.Printf("📋 Health check: http://localhost:%d/health\n", s.port)
	fmt.Printf("🔧 API endpoints: http://localhost:%d/api/v1\n", s.port)

	err := server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("server failed to start: %w", err)
	}

	return nil
}
