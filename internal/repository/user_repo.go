package repository

import (
	"context"
	"my_project/internal/database/sqlc"
)

type UserRepository interface {
	Create(ctx context.Context, arg sqlc.CreateUserParams) (sqlc.User, error)
	GetByID(ctx context.Context, id int32) (sqlc.User, error)
	GetByEmail(ctx context.Context, email string) (sqlc.User, error)
	List(ctx context.Context) ([]sqlc.User, error)
	Delete(ctx context.Context, id int32) error
}

type userRepo struct {
	q *sqlc.Queries
}
func NewUserRepository(q *sqlc.Queries) UserRepository {
	return &userRepo{q}
}

func (r *userRepo) Create(ctx context.Context, arg sqlc.CreateUserParams) (sqlc.User, error) {
	return r.q.CreateUser(ctx, arg)
}

func (r *userRepo) GetByID(ctx context.Context, id int32) (sqlc.User, error) {
	return r.q.GetUserByID(ctx, id)
}

func (r *userRepo) GetByEmail(ctx context.Context, email string) (sqlc.User, error) {
	return r.q.GetUserByEmail(ctx, email)
}

func (r *userRepo) List(ctx context.Context) ([]sqlc.User, error) {
	return r.q.ListUsers(ctx)
}

func (r *userRepo) Delete(ctx context.Context, id int32) error {
	return r.q.DeleteUser(ctx, id)
}
