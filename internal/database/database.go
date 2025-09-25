package database

import (
	"database/sql"
	"embed"
	"fmt"
	"log"
	"os"

	"my_project/internal/database/sqlc"

	_ "github.com/lib/pq" // PostgreSQL driver
	"github.com/pressly/goose/v3"
)

//go:embed migrations/*.sql
var embedMigrations embed.FS

type Service interface {
	Health() map[string]string
	Close() error
	GetQueries() *sqlc.Queries
	GetDB() *sql.DB
}

type service struct {
	db      *sql.DB
	queries *sqlc.Queries
}

var dbInstance *service

func New() Service {
	if dbInstance != nil {
		return dbInstance
	}

	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/myproject?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	goose.SetBaseFS(embedMigrations)
	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatal("Failed to set dialect:", err)
	}

	if err := goose.Up(db, "migrations"); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Create SQLC queries instance
	queries := sqlc.New(db)

	dbInstance = &service{
		db:      db,
		queries: queries,
	}

	return dbInstance
}

func (s *service) Health() map[string]string {
	stats := make(map[string]string)

	err := s.db.Ping()
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		return stats
	}

	stats["status"] = "up"
	stats["message"] = "It's healthy"
	return stats
}

func (s *service) Close() error {
	return s.db.Close()
}

func (s *service) GetQueries() *sqlc.Queries {
	return s.queries
}

func (s *service) GetDB() *sql.DB {
	return s.db
}
