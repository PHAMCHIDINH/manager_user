package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"my_project/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/time/rate"
)

// AuthMiddleware verifies JWT and stores user context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid token"})
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		claims, err := utils.ParseToken(tokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		userID, err := extractUserID(claims)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token payload"})
			return
		}

		c.Set("userID", userID)
		c.Set("user", claims)
		c.Next()
	}
}

func extractUserID(claims jwt.MapClaims) (int32, error) {
	raw, ok := claims["sub"]
	if !ok {
		return 0, fmt.Errorf("missing subject claim")
	}

	switch v := raw.(type) {
	case float64:
		return int32(v), nil
	case int:
		return int32(v), nil
	case int32:
		return v, nil
	case int64:
		return int32(v), nil
	case string:
		parsed, err := strconv.ParseInt(v, 10, 32)
		if err != nil {
			return 0, err
		}
		return int32(parsed), nil
	default:
		return 0, fmt.Errorf("unsupported subject type %T", v)
	}
}

// TimeoutMiddleware: há»§y request náº¿u quĂ¡ háº¡n
func TimeoutMiddleware(duration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), duration)
		defer cancel()

		c.Request = c.Request.WithContext(ctx)
		done := make(chan struct{})

		go func() {
			c.Next()
			close(done)
		}()

		select {
		case <-ctx.Done():
			c.AbortWithStatusJSON(http.StatusGatewayTimeout, gin.H{"error": "request timeout"})
		case <-done:
		}
	}
}

// RequestIDMiddleware: gáº¯n ID duy nháº¥t cho má»—i request
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := uuid.NewString()
		c.Writer.Header().Set("X-Request-ID", requestID)
		c.Set("RequestID", requestID)
		c.Next()
	}
}

// LoggingMiddleware: log request/response
func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		duration := time.Since(start)
		log.Printf("[RequestID=%s] %s %s %d %s",
			c.GetString("RequestID"),
			c.Request.Method,
			c.Request.URL.Path,
			c.Writer.Status(),
			duration,
		)
	}
}

// SecurityHeadersMiddleware: thĂªm header báº£o máº­t
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("X-Frame-Options", "DENY")
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")
		c.Next()
	}
}

// RateLimitMiddleware: giá»›i háº¡n sá»‘ request
func RateLimitMiddleware(rps int, per time.Duration) gin.HandlerFunc {
	limiter := rate.NewLimiter(rate.Every(per/time.Duration(rps)), rps)

	return func(c *gin.Context) {
		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
			return
		}
		c.Next()
	}
}

// ErrorHandlerMiddleware: báº¯t lá»—i chung
func ErrorHandlerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("panic recovered: %v", err)
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": "internal server error",
				})
			}
		}()
		c.Next()
	}
}

// ValidationMiddleware: vĂ­ dá»¥ validate body rá»—ng
func ValidationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength == 0 {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "empty request body"})
			return
		}
		c.Next()
	}
}
