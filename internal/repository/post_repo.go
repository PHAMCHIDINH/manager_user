package repository

import (
	"context"

	"my_project/internal/database/sqlc"
)

// PostRepository defines the persistence operations for posts
type PostRepository interface {
	Create(ctx context.Context, arg sqlc.CreatePostParams) (sqlc.CreatePostRow, error)
	GetByID(ctx context.Context, id int32) (sqlc.Post, error)
	List(ctx context.Context, limit, offset int32) ([]sqlc.ListPostsRow, error)
	ListByUser(ctx context.Context, userID int32, limit, offset int32) ([]sqlc.ListPostsByUserRow, error)
	Update(ctx context.Context, arg sqlc.UpdatePostParams) (sqlc.Post, error)
	Delete(ctx context.Context, id int32) error
}

type postRepo struct {
	q *sqlc.Queries
}

// NewPostRepository creates a new PostRepository implementation
func NewPostRepository(q *sqlc.Queries) PostRepository {
	return &postRepo{q: q}
}

func (r *postRepo) Create(ctx context.Context, arg sqlc.CreatePostParams) (sqlc.CreatePostRow, error) {
	return r.q.CreatePost(ctx, arg)
}

func (r *postRepo) GetByID(ctx context.Context, id int32) (sqlc.Post, error) {
	return r.q.GetPostByID(ctx, id)
}

func (r *postRepo) List(ctx context.Context, limit, offset int32) ([]sqlc.ListPostsRow, error) {
	params := sqlc.ListPostsParams{
		Limit:  limit,
		Offset: offset,
	}
	return r.q.ListPosts(ctx, params)
}

func (r *postRepo) ListByUser(ctx context.Context, userID int32, limit, offset int32) ([]sqlc.ListPostsByUserRow, error) {
	params := sqlc.ListPostsByUserParams{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
	}
	return r.q.ListPostsByUser(ctx, params)
}

func (r *postRepo) Update(ctx context.Context, arg sqlc.UpdatePostParams) (sqlc.Post, error) {
	return r.q.UpdatePost(ctx, arg)
}

func (r *postRepo) Delete(ctx context.Context, id int32) error {
	return r.q.DeletePost(ctx, id)
}
