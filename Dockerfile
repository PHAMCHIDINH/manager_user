# ===========================
# Build Go backend
# ===========================
FROM golang:1.25.1-alpine AS backend_builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main cmd/api/main.go


# ===========================
# Build React frontend (Vite + Tailwind)
# ===========================
FROM node:20 AS frontend_builder
WORKDIR /frontend

# Cài npm (sử dụng npm thay vì pnpm)
RUN npm install -g npm@latest

# Copy package files và cài deps
COPY frontend/package-lock.json frontend/package.json ./
# Xóa lock file và cài lại để tải binary đúng platform
RUN rm -f package-lock.json && npm install

# Copy source và build
COPY frontend/. .
RUN npm run build


# ===========================
# Serve frontend
# ===========================
FROM node:20-slim AS frontend
WORKDIR /app

RUN npm install -g serve
COPY --from=frontend_builder /frontend/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]


# ===========================
# Final backend image
# ===========================
FROM alpine:3.20.1 AS prod
WORKDIR /app

COPY --from=backend_builder /app/main ./main
EXPOSE ${PORT}
CMD ["./main"]
