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
	limit := int32(10)
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

	// Đảm bảo luôn trả về array thay vì null
	if posts == nil {
		posts = []sqlc.ListPostsRow{}
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

	// Tạm thời sử dụng user_id = 1 (user đã có trong database)
	// TODO: Trong production, lấy user_id từ JWT token
	createParams := sqlc.CreatePostParams{
		UserID:  1, // User ID có sẵn trong database
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
	id, err := strconv.ParseInt(idStr, 10, 64)
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
