package handlers

import (
	"my_project/internal/controller"
	"my_project/internal/middleware"

	"github.com/gin-gonic/gin"
)

type PostRoutes struct {
	postController *controller.PostController
}

func NewPostRoutes(pc *controller.PostController) *PostRoutes {
	return &PostRoutes{postController: pc}
}

func (pr *PostRoutes) RegisterRoutes(api *gin.RouterGroup) {
	posts := api.Group("/posts")
	posts.GET("", pr.postController.ListPostsHandler)
	posts.GET("/user/:userID", pr.postController.ListPostsByUserHandler)
	posts.GET("/:id", pr.postController.GetPostHandler)

	protected := posts.Group("")
	protected.Use(middleware.AuthMiddleware())
	protected.POST("", pr.postController.CreatePostHandler)
	protected.PUT("/:id", pr.postController.UpdatePostHandler)
	protected.DELETE("/:id", pr.postController.DeletePostHandler)
}
