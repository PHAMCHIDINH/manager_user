package controller

import (
	"net/http"
	"strconv"

	"my_project/internal/database/sqlc"
	"my_project/internal/service"

	"github.com/gin-gonic/gin"
)

type PostController struct {
	service service.PostService
}

func NewPostController(s service.PostService) *PostController {
	return &PostController{service: s}
}

// GET /api/v1/posts?page=1&limit=10
func (pc *PostController) ListPostsHandler(c *gin.Context) {
	limit := int32(5)
	offset := int32(0)

	if l := c.Query("limit"); l != "" {
		if v, err := strconv.Atoi(l); err == nil {
			limit = int32(v)
		}
	}
	if p := c.Query("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil && v > 0 {
			offset = int32((v - 1) * int(limit))
		}
	}

	posts, err := pc.service.ListPosts(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch posts"})
		return
	}

	// Ensure the response is always an array instead of null
	if posts == nil {
		posts = []sqlc.ListPostsRow{}
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GET /api/v1/posts/user/:userID?page=1&limit=10
func (pc *PostController) ListPostsByUserHandler(c *gin.Context) {
	userIDStr := c.Param("userID")
	userID, err := strconv.ParseInt(userIDStr, 10, 32)
	if err != nil || userID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	limit := int32(5)
	offset := int32(0)

	if l := c.Query("limit"); l != "" {
		if v, err := strconv.Atoi(l); err == nil {
			limit = int32(v)
		}
	}
	if p := c.Query("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil && v > 0 {
			offset = int32((v - 1) * int(limit))
		}
	}

	posts, err := pc.service.ListPostsByUser(c.Request.Context(), int32(userID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user posts"})
		return
	}

	if posts == nil {
		posts = []sqlc.ListPostsByUserRow{}
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GET /api/v1/posts/:id
func (pc *PostController) GetPostHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	post, err := pc.service.GetPost(c.Request.Context(), int32(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}

// POST /api/v1/posts
func (pc *PostController) CreatePostHandler(c *gin.Context) {
	var req struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
		Status  string `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// Temporary: use user_id = 1 (seed user already in the database)
	// TODO: In production, pull user_id from the JWT token
	createParams := sqlc.CreatePostParams{
		UserID:  1, // Seed user available in the database
		Title:   req.Title,
		Content: req.Content,
	}

	post, err := pc.service.CreatePost(c.Request.Context(), createParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}
	c.JSON(http.StatusCreated, post)
}

// PUT /api/v1/posts/:id
func (pc *PostController) UpdatePostHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	var req sqlc.UpdatePostParams
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.ID = int32(id)

	post, err := pc.service.UpdatePost(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		return
	}
	c.JSON(http.StatusOK, post)
}

// DELETE /api/v1/posts/:id
func (pc *PostController) DeletePostHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	if err := pc.service.DeletePost(c.Request.Context(), int32(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete post"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "post deleted"})
}
