package repository

import (
	"context"
	"my_project/internal/database/sqlc"
)

// PostRepository định nghĩa interface cho repository layer
type PostRepository interface {
	Create(ctx context.Context, arg sqlc.CreatePostParams) (sqlc.CreatePostRow, error)
	GetByID(ctx context.Context, id int32) (sqlc.Post, error)
	List(ctx context.Context, limit, offset int32) ([]sqlc.ListPostsRow, error)
	Update(ctx context.Context, arg sqlc.UpdatePostParams) (sqlc.Post, error)
	Delete(ctx context.Context, id int32) error
}

// postRepo implements PostRepository
type postRepo struct {
	q *sqlc.Queries
}

// NewPostRepository khởi tạo PostRepository mới
func NewPostRepository(q *sqlc.Queries) PostRepository {
	return &postRepo{q: q}
}

// Create tạo post mới
func (r *postRepo) Create(ctx context.Context, arg sqlc.CreatePostParams) (sqlc.CreatePostRow, error) {
	return r.q.CreatePost(ctx, arg)
}

// GetByID lấy post theo ID
func (r *postRepo) GetByID(ctx context.Context, id int32) (sqlc.Post, error) {
	return r.q.GetPostByID(ctx, id)
}

// List trả về danh sách posts có phân trang
func (r *postRepo) List(ctx context.Context, limit, offset int32) ([]sqlc.ListPostsRow, error) {
	params := sqlc.ListPostsParams{
		Limit:  limit,
		Offset: offset,
	}
	return r.q.ListPosts(ctx, params)
}

// Update cập nhật post
func (r *postRepo) Update(ctx context.Context, arg sqlc.UpdatePostParams) (sqlc.Post, error) {
	return r.q.UpdatePost(ctx, arg)
}

// Delete xóa post theo ID
func (r *postRepo) Delete(ctx context.Context, id int32) error {
	return r.q.DeletePost(ctx, id)
}
