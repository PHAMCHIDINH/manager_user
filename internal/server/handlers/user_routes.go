package handlers

import (
	"my_project/internal/controller"

	"github.com/gin-gonic/gin"
)

type UserRoutes struct {
	userController *controller.UserController
}

func NewUserRoutes(userController *controller.UserController) *UserRoutes {
	return &UserRoutes{userController}
}

func (ur *UserRoutes) RegisterRoutes(router *gin.RouterGroup) {
	users := router.Group("/users")
	{
		users.GET("", ur.userController.ListUsersHandler)
		users.GET("/:id", ur.userController.GetUserHandler)
		users.POST("", ur.userController.CreateUserHandler) // tạo user mới (admin)
		users.DELETE("/:id", ur.userController.DeleteUserHandler)
	}
}
