-- name: CreatePost :one
WITH new_post AS (
    INSERT INTO posts (user_id, title, content)
    VALUES ($1, $2, $3)
    RETURNING *
)
SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, u.username
FROM new_post p
JOIN users u ON p.user_id = u.id;

-- name: GetPostByID :one
SELECT * FROM posts WHERE id = $1 LIMIT 1;

-- name: ListPosts :many
SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, u.username
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListPostsByUser :many
SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, u.username
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.user_id = $1
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- name: UpdatePost :one
UPDATE posts
SET title = $2, content = $3, updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeletePost :exec
DELETE FROM posts WHERE id = $1;
