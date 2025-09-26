•  Backend: Clean Architecture with Go, Gin HTTP server, middleware stack, SQLC repository, Postgres + Goose migration, auth bằng bcrypt/JWT.
•  Frontend: React 19 + Vite, Tailwind, Router, Zustand, Axios, form với react-hook-form + Yup.
•  DevOps: Docker, docker-compose, Makefile, .env config.

Backend Features
•	Database Layer
database.New → nạp config, mở kết nối PostgreSQL, chạy Goose migrations, và trả về một singleton sqlc query layer để các service khác dùng.
•	UserService
Cung cấp Register / Login / GetUser / ListUsers / DeleteUser
o	Hash mật khẩu bằng bcrypt
o	Kiểm tra email duy nhất
o	Sinh JWT token cho đăng nhập
•	PostService
Thao tác CRUD (create/read/update/delete) cho bài viết, có lọc theo user.
o	Bọc quanh repository do SQLC sinh ra.
•	AuthController
REST API cho RegisterHandler và LoginHandler
o	Đăng ký auto-login
o	Đăng nhập bằng credential (email + password).
•	UserController
API cho quản trị:
o	Tạo user
o	Liệt kê toàn bộ user
o	Lấy chi tiết user theo ID
o	Xoá user
•	PostController
o	Query có phân trang
o	Lọc post theo user
o	Lấy 1 post chi tiết
o	Tạo/sửa/xoá post bảo vệ bằng JWT (user phải login).
•	Middleware stack
o	Inject request ID
o	Logging traffic
o	Enforce JWT auth
o	Security headers
o	Rate limiting
o	Panic/timeout recovery
•	Gin server wiring
Đăng ký routes, middleware, CORS, và graceful shutdown
o	Controllers được inject qua dependency injection.
________________________________________
🔹 Frontend Features
•	Axios client
o	Tự động append JWT token + request ID vào request
o	Xử lý lỗi auth (redirect login khi 401).
•	Auth API + Zustand store
o	Quản lý login, register, logout, refresh token
o	Đồng bộ state với localStorage.
•	Routing
o	Phân chia public routes (home/login/register) và protected routes (dashboard/posts/users)
o	ProtectedRoute bảo vệ các route yêu cầu auth.
•	HomePage
o	Hiển thị danh sách User
o	Danh sách post có phân trang
o	Quản lý loading/error state.
•	PostsPage
o	CRUD post (tạo, sửa, xoá)
o	Filter theo user
o	Form dạng modal
o	Pagination.
•	UsersPage
o	Bảng quản lý user (role, ngày join, link đến posts theo user).
•	DashboardPage
o	Hiển thị thông tin profile user đang đăng nhập
o	Tailwind panels.
•	Shared Layouts & Components
o	PublicLayout, DashboardLayout
o	Navbar, Footer
o	Đảm bảo UI responsive, thống nhất.

# Project manager_user


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


 
