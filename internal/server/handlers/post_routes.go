package handlers

import (
	"my_project/internal/controller"

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
	{
		posts.GET("", pr.postController.ListPostsHandler)
		posts.GET("/:id", pr.postController.GetPostHandler)
		posts.POST("", pr.postController.CreatePostHandler)
		posts.PUT("/:id", pr.postController.UpdatePostHandler)
		posts.DELETE("/:id", pr.postController.DeletePostHandler)
	}
}
