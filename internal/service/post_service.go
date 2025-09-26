package service

import (
	"context"

	"my_project/internal/database/sqlc"
	"my_project/internal/repository"
)

// PostService defines the business logic for posts
type PostService interface {
	CreatePost(ctx context.Context, arg sqlc.CreatePostParams) (sqlc.CreatePostRow, error)
	GetPost(ctx context.Context, id int32) (sqlc.Post, error)
	ListPosts(ctx context.Context, limit, offset int32) ([]sqlc.ListPostsRow, error)
	ListPostsByUser(ctx context.Context, userID int32, limit, offset int32) ([]sqlc.ListPostsByUserRow, error)
	UpdatePost(ctx context.Context, arg sqlc.UpdatePostParams) (sqlc.Post, error)
	DeletePost(ctx context.Context, id int32) error
}

type postService struct {
	postRepo repository.PostRepository
}

// NewPostService creates a new PostService instance
func NewPostService(repo repository.PostRepository) PostService {
	return &postService{postRepo: repo}
}

func (s *postService) CreatePost(ctx context.Context, arg sqlc.CreatePostParams) (sqlc.CreatePostRow, error) {
	return s.postRepo.Create(ctx, arg)
}

func (s *postService) GetPost(ctx context.Context, id int32) (sqlc.Post, error) {
	return s.postRepo.GetByID(ctx, id)
}

func (s *postService) ListPosts(ctx context.Context, limit, offset int32) ([]sqlc.ListPostsRow, error) {
	return s.postRepo.List(ctx, limit, offset)
}

func (s *postService) ListPostsByUser(ctx context.Context, userID int32, limit, offset int32) ([]sqlc.ListPostsByUserRow, error) {
	return s.postRepo.ListByUser(ctx, userID, limit, offset)
}

func (s *postService) UpdatePost(ctx context.Context, arg sqlc.UpdatePostParams) (sqlc.Post, error) {
	return s.postRepo.Update(ctx, arg)
}

func (s *postService) DeletePost(ctx context.Context, id int32) error {
	return s.postRepo.Delete(ctx, id)
}
