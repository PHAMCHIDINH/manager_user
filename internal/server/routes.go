package server

import (
	"net/http"
	"time"

	"my_project/internal/middleware"
	"my_project/internal/server/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	router := gin.New()
	router.Use(gin.Recovery())

	router.Use(cors.New(newCORSConfig()))
	router.Use(
		middleware.RequestIDMiddleware(),
		middleware.LoggingMiddleware(),
		middleware.ErrorHandlerMiddleware(),
	)

	api := router.Group("/api/v1")
	routeHandler := handlers.NewRouteHandler(s.UserController, s.AuthController, s.PostController)
	routeHandler.RegisterAllRoutes(api)

	return router
}

func newCORSConfig() cors.Config {
	return cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Accept", "Authorization", "Content-Type", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
}
