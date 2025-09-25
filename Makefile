# Simple Makefile for a Go project

# Build all with tests
all: build test

# Build the application (with sqlc generation)
build: sqlc-generate
	@echo "Building..."
	@go build -o main.exe cmd/api/main.go

# Run the application
run:
	@go run cmd/api/main.go &
	@npm install --prefer-offline --no-fund --prefix ./frontend
	@npm run dev --prefix ./frontend
# Create DB container
docker-run:
	@docker compose up --build

# Shutdown DB container
docker-down:
	@docker compose down

# Test the application
test:
	@echo "Testing..."
	@go test ./... -v
# Integrations Tests for the application
itest:
	@echo "Running integration tests..."
	@go test ./internal/database -v

# Clean the binary
clean:
	@echo "Cleaning..."
	@rm -f main

# Live Reload
watch:
	@powershell -ExecutionPolicy Bypass -Command "if (Get-Command air -ErrorAction SilentlyContinue) { \
		air; \
		Write-Output 'Watching...'; \
	} else { \
		Write-Output 'Installing air...'; \
		go install github.com/air-verse/air@latest; \
		air; \
		Write-Output 'Watching...'; \
	}"

.PHONY: all build run test clean watch docker-run docker-down itest

# Database operations
.PHONY: migrate-up migrate-down migrate-status sqlc-generate

migrate-up:
	@goose -dir internal/database/migrations postgres "postgres://melkey:password1234@localhost:5432/blueprint?sslmode=disable" up

migrate-down:
	@goose -dir internal/database/migrations postgres "postgres://melkey:password1234@localhost:5432/blueprint?sslmode=disable" down

migrate-status:
	@goose -dir internal/database/migrations postgres "postgres://melkey:password1234@localhost:5432/blueprint?sslmode=disable" status

sqlc-generate:
	@sqlc generate