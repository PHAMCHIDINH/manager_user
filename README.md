# Project manager_user

Ứng dụng full‑stack quản lý người dùng và bài viết.

- Backend: Go (Clean Architecture), Gin HTTP, middleware stack, SQLC repository, PostgreSQL + Goose migration, xác thực bằng bcrypt/JWT.
- Frontend: React 19 + Vite, Tailwind CSS, React Router, Zustand, Axios, form với react-hook-form + Yup.
- DevOps: Docker, docker-compose, Makefile, cấu hình `.env`.

## Backend Features

- Database layer: `database.New` nạp config, mở kết nối PostgreSQL, chạy Goose migrations, và trả về singleton SQLC query layer cho các service sử dụng.
- UserService: Register / Login / GetUser / ListUsers / DeleteUser
  - Hash mật khẩu bằng bcrypt, kiểm tra email duy nhất, sinh JWT token khi đăng nhập.
- PostService: CRUD bài viết, hỗ trợ lọc theo user, bọc quanh repository do SQLC sinh.
- AuthController: REST API cho RegisterHandler, LoginHandler
  - Hỗ trợ đăng ký kèm auto-login, đăng nhập bằng email + password.
- UserController: API quản trị (tạo user, liệt kê, lấy chi tiết theo ID, xoá user).
- PostController: phân trang, lọc theo user, lấy chi tiết 1 post; tạo/sửa/xoá post có bảo vệ JWT (cần đăng nhập).
- Middleware stack: inject request ID, logging traffic, enforce JWT, security headers, rate limiting, panic/timeout recovery.
- Gin server wiring: đăng ký routes, middleware, CORS, graceful shutdown; controllers được inject qua dependency injection.

## Frontend Features

- Axios client: tự động gắn JWT token + request ID, xử lý 401 (redirect về trang đăng nhập).
- Auth API + Zustand store: login, register, logout, refresh token; đồng bộ state với localStorage.
- Routing: tách public routes (home/login/register) và protected routes (dashboard/posts/users); `ProtectedRoute` bảo vệ các route yêu cầu auth.
- HomePage: hiển thị danh sách user, danh sách post có phân trang; quản lý loading/error state.
- PostsPage: CRUD post, lọc theo user, form dạng modal, pagination.
- UsersPage: bảng quản lý user (role, ngày join, liên kết đến posts theo user).
- DashboardPage: hiển thị thông tin profile user đang đăng nhập (Tailwind panels).
- Shared Layouts & Components: `PublicLayout`, `DashboardLayout`, `Navbar`, `Footer`; UI responsive và thống nhất.

## Getting Started

Yêu cầu: Docker, docker-compose, Make, Go và Node.js (tuỳ môi trường phát triển).

Clone dự án và thiết lập biến môi trường trong file `.env` (nếu có).

## Makefile Commands

- Build + test tất cả:
```bash
make all
```

- Build ứng dụng:
```bash
make build
```

- Chạy ứng dụng:
```bash
make run
```

- Khởi tạo container DB:
```bash
make docker-run
```

- Tắt container DB:
```bash
make docker-down
```

## Database Operations

Lưu ý: Chạy `make docker-run` trước để khởi động database container.

- Migrations trong Docker sẽ chạy tự động khi ứng dụng khởi động. Các lệnh dưới đây dùng cho môi trường phát triển ngoài Docker.

- Chạy migrations (up):
```bash
make migrate-up
```

- Rollback migrations (down):
```bash
make migrate-down
```

- Kiểm tra trạng thái migrations:
```bash
make migrate-status
```

- Sinh mã SQLC từ các truy vấn SQL:
```bash
make sqlc-generate
```

- Tạo migration mới:
```bash
goose -dir internal/database/migrations create migration_name sql
```

- Chạy integration test cho DB:
```bash
make itest
```

## Development

- Live reload ứng dụng:
```bash
make watch
```

- Chạy test suite:
```bash
make test
```

- Dọn dẹp binary build lần trước:
```bash
make clean
```
