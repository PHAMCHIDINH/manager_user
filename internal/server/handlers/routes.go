package handlers

import (
	"my_project/internal/controller"

	"github.com/gin-gonic/gin"
)

type RouteHandler struct {
	UserRoutes *UserRoutes
	AuthRoutes *AuthRoutes
	PostRoutes *PostRoutes
}

func NewRouteHandler(userController *controller.UserController, authController *controller.AuthController, postController *controller.PostController) *RouteHandler {
	return &RouteHandler{
		UserRoutes: NewUserRoutes(userController),
		AuthRoutes: NewAuthRoutes(authController),
		PostRoutes: NewPostRoutes(postController),
	}
}

func (rh *RouteHandler) RegisterAllRoutes(api *gin.RouterGroup) {
	rh.AuthRoutes.RegisterRoutes(api)
	rh.UserRoutes.RegisterRoutes(api)
	rh.PostRoutes.RegisterRoutes(api)
}

func RegisterAPIRoutes(api *gin.RouterGroup, userController *controller.UserController, authController *controller.AuthController, postController *controller.PostController) {
	routeHandler := NewRouteHandler(userController, authController, postController)
	routeHandler.RegisterAllRoutes(api)
}
