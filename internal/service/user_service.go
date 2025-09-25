package service

import (
	"context"
	"errors"
	"my_project/internal/database/sqlc"
	"my_project/internal/repository"
	"my_project/utils"
)

type UserService interface {
	Register(ctx context.Context, username, email, password string) (sqlc.User, error)
	Login(ctx context.Context, email, password string) (string, sqlc.User, error)
	GetUser(ctx context.Context, id int64) (sqlc.User, error)
	ListUsers(ctx context.Context) ([]sqlc.User, error)
	DeleteUser(ctx context.Context, id int64) error
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

// Đăng ký
func (s *userService) Register(ctx context.Context, username, email, password string) (sqlc.User, error) {
	// Check email tồn tại
	_, err := s.userRepo.GetByEmail(ctx, email)
	if err == nil {
		return sqlc.User{}, errors.New("email already exists")
	}

	// Hash mật khẩu
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return sqlc.User{}, err
	}

	// Tạo user mới
	arg := sqlc.CreateUserParams{
		Username:     username,
		Email:        email,
		PasswordHash: hashedPassword,
		Role:         "user",
	}
	return s.userRepo.Create(ctx, arg)
}

// Login
func (s *userService) Login(ctx context.Context, email, password string) (string, sqlc.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return "", sqlc.User{}, errors.New("invalid credentials")
	}

	// Check mật khẩu
	if !utils.CheckPassword(user.PasswordHash, password) {
		return "", sqlc.User{}, errors.New("invalid credentials")
	}

	// Sinh JWT
	token, err := utils.CreateToken(user.ID, user.Email)
	if err != nil {
		return "", sqlc.User{}, err
	}

	return token, user, nil
}

func (s *userService) GetUser(ctx context.Context, id int64) (sqlc.User, error) {
	return s.userRepo.GetByID(ctx, int32(id))
}

func (s *userService) ListUsers(ctx context.Context) ([]sqlc.User, error) {
	return s.userRepo.List(ctx)
}

func (s *userService) DeleteUser(ctx context.Context, id int64) error {
	return s.userRepo.Delete(ctx, int32(id))
}
