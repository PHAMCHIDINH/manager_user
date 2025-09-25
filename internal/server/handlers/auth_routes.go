package handlers

import (
	"my_project/internal/controller"

	"github.com/gin-gonic/gin"
)

type AuthRoutes struct {
	authController *controller.AuthController
}

func NewAuthRoutes(authController *controller.AuthController) *AuthRoutes {
	return &AuthRoutes{authController}
}

func (ar *AuthRoutes) RegisterRoutes(router *gin.RouterGroup) {
	auth := router.Group("/auth")
	{
		auth.POST("/register", ar.authController.RegisterHandler)
		auth.POST("/login", ar.authController.LoginHandler)
	}
}
