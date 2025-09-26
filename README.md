# Project my_project

One Paragraph of project description goes here

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## MakeFile

Run build make command with tests
```bash
make all
```

Build the application
```bash
make build
```

Run the application
```bash
make run
```
Create DB container
```bash
make docker-run
```

Shutdown DB Container
```bash
make docker-down
```

## Database Operations

**⚠️ Important: Run `make docker-run` first to start the database container**

**📝 Note: Migrations run automatically when the app starts in Docker. Manual migration commands are for development outside Docker.**

Run database migrations (up)
```bash
make migrate-up
```

Rollback database migrations (down)
```bash
make migrate-down
```

Check migration status
```bash
make migrate-status
```

Generate SQLC code from SQL queries
```bash
make sqlc-generate
```

Create new migration file
```bash
goose -dir internal/database/migrations create migration_name sql
```

DB Integrations Test:
```bash
make itest
```

Live reload the application:
```bash
make watch
```

Run the test suite:
```bash
make test
```

Clean up binary from the last build:
```bash
make clean
```


 
