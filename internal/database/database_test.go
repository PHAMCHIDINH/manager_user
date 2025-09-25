package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"testing"
	"time"

	"my_project/internal/database/sqlc"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

func mustStartPostgresContainer() (func(context.Context, ...testcontainers.TerminateOption) error, error) {
	var (
		dbName = "database"
		dbPwd  = "password"
		dbUser = "user"
	)

	dbContainer, err := postgres.Run(
		context.Background(),
		"postgres:latest",
		postgres.WithDatabase(dbName),
		postgres.WithUsername(dbUser),
		postgres.WithPassword(dbPwd),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(5*time.Second)),
	)
	if err != nil {
		return nil, err
	}

	dbHost, err := dbContainer.Host(context.Background())
	if err != nil {
		return dbContainer.Terminate, err
	}

	dbPort, err := dbContainer.MappedPort(context.Background(), "5432/tcp")
	if err != nil {
		return dbContainer.Terminate, err
	}

	// Set DATABASE_URL environment variable for the test
	databaseURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		dbUser, dbPwd, dbHost, dbPort.Port(), dbName)
	os.Setenv("DATABASE_URL", databaseURL)

	return dbContainer.Terminate, err
}

func TestMain(m *testing.M) {
	teardown, err := mustStartPostgresContainer()
	if err != nil {
		log.Fatalf("could not start postgres container: %v", err)
	}

	// Reset the singleton instance before running tests
	dbInstance = nil

	exitCode := m.Run()

	// Clean up
	if teardown != nil {
		if err := teardown(context.Background()); err != nil {
			log.Fatalf("could not teardown postgres container: %v", err)
		}
	}

	os.Exit(exitCode)
}

func TestNew(t *testing.T) {
	srv := New()
	if srv == nil {
		t.Fatal("New() returned nil")
	}

	// Test that GetQueries() returns a valid instance
	queries := srv.GetQueries()
	if queries == nil {
		t.Fatal("GetQueries() returned nil")
	}
}

func TestHealth(t *testing.T) {
	srv := New()

	stats := srv.Health()

	if stats["status"] != "up" {
		t.Fatalf("expected status to be up, got %s", stats["status"])
	}

	if _, ok := stats["error"]; ok {
		t.Fatalf("expected error not to be present")
	}

	if stats["message"] != "It's healthy" {
		t.Fatalf("expected message to be 'It's healthy', got %s", stats["message"])
	}
}

func TestClose(t *testing.T) {
	// Reset singleton to get fresh instance for this test
	dbInstance = nil
	srv := New()

	if srv.Close() != nil {
		t.Fatalf("expected Close() to return nil")
	}

	// Reset singleton for subsequent tests
	dbInstance = nil
}

func TestSQLCIntegration(t *testing.T) {
	// Reset singleton to get fresh instance for this test
	dbInstance = nil
	srv := New()
	queries := srv.GetQueries()

	ctx := context.Background()

	// Test creating a user
	user, err := queries.CreateUser(ctx, sqlc.CreateUserParams{
		Email:    "test@example.com",
		Username: "Test User",
	})
	if err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	if user.Email != "test@example.com" {
		t.Errorf("expected email to be 'test@example.com', got '%s'", user.Email)
	}

	if user.Username != "Test User" {
		t.Errorf("expected username to be 'Test User', got '%s'", user.Username)
	}

	// Test getting the user
	fetchedUser, err := queries.GetUserByID(ctx, user.ID)
	if err != nil {
		t.Fatalf("failed to get user: %v", err)
	}

	if fetchedUser.Email != user.Email {
		t.Errorf("expected fetched user email to match created user email")
	}

	// Test listing users
	users, err := queries.ListUsers(ctx)
	if err != nil {
		t.Fatalf("failed to list users: %v", err)
	}

	if len(users) == 0 {
		t.Errorf("expected at least one user in the list")
	}

	// Test deleting the user
	err = queries.DeleteUser(ctx, user.ID)
	if err != nil {
		t.Fatalf("failed to delete user: %v", err)
	}
}
