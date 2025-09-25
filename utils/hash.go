package utils

import "golang.org/x/crypto/bcrypt"

// HashPassword hash mật khẩu người dùng
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword so sánh mật khẩu người dùng nhập với hash trong DB
func CheckPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}
