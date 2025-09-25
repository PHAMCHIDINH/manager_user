package errors

import (
	"fmt"
	"net/http"
)

// Custom error types
type AppError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Status  int    `json:"-"`
}

func (e *AppError) Error() string {
	return e.Message
}

// Error constructors
func NewBadRequestError(message string) *AppError {
	return &AppError{
		Code:    "BAD_REQUEST",
		Message: message,
		Status:  http.StatusBadRequest,
	}
}

func NewNotFoundError(message string) *AppError {
	return &AppError{
		Code:    "NOT_FOUND",
		Message: message,
		Status:  http.StatusNotFound,
	}
}

func NewInternalError(message string) *AppError {
	return &AppError{
		Code:    "INTERNAL_ERROR",
		Message: message,
		Status:  http.StatusInternalServerError,
	}
}

func NewValidationError(message string) *AppError {
	return &AppError{
		Code:    "VALIDATION_ERROR",
		Message: message,
		Status:  http.StatusBadRequest,
	}
}

func NewConflictError(message string) *AppError {
	return &AppError{
		Code:    "CONFLICT",
		Message: message,
		Status:  http.StatusConflict,
	}
}

// User-specific errors
func UserNotFound(id int64) *AppError {
	return NewNotFoundError(fmt.Sprintf("User with ID %d not found", id))
}

func UserEmailExists(email string) *AppError {
	return NewConflictError(fmt.Sprintf("User with email %s already exists", email))
}

func UserUsernameExists(username string) *AppError {
	return NewConflictError(fmt.Sprintf("Username %s is already taken", username))
}

func InvalidUserID() *AppError {
	return NewBadRequestError("Invalid user ID")
}
