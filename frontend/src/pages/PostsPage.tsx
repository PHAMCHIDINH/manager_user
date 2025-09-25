import React, { useEffect, useState, useCallback } from 'react';
import PostAPI from '../api/postApi';
import type { Post, CreatePostRequest } from '../api/postApi';

const PostsPage: React.FC = () => {
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 5;

  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<CreatePostRequest>({
    title: '',
    content: '',
    status: 'published',
  });

  // Reusable styles (tối giản)
  const btnBase = 'px-3 py-1 rounded border text-sm disabled:opacity-50';
  const btn = `${btnBase} bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200`;
  const btnPrimary = `${btnBase} bg-gray-800 border-gray-800 text-white hover:bg-black`;
  const card = 'bg-white border border-gray-200 rounded-md p-4';

  const formatDate = useCallback((dateObj: { Time: string; Valid: boolean }) => {
    if (!dateObj?.Valid) return 'Unknown date';
    return new Date(dateObj.Time).toLocaleDateString();
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ title: '', content: '', status: 'published' });
    setEditingPost(null);
    setShowForm(false);
    setError(null);
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PostAPI.getPosts(page, limit);
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // nếu trang >1 và xoá hết bài → lùi trang
  useEffect(() => {
    if (!loading && posts.length === 0 && page > 1) {
      setPage((p) => p - 1);
    }
  }, [posts, loading, page]);

  // Handlers
  const handleInputChange = useCallback(
    (field: keyof CreatePostRequest) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (error) setError(null);
      },
    [error]
  );

  const showCreateForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const handleEdit = useCallback((post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      status: post.status === 'draft' || post.status === 'published' ? post.status : 'published',
    });
    setShowForm(true);
    setError(null);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Delete this post?')) return;
    try {
      setError(null);
      await PostAPI.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError('Failed to delete post. Please try again.');
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const valid = formData.title.trim() && formData.content.trim();
      if (!valid || submitting) return;

      try {
        setSubmitting(true);
        setError(null);

        if (editingPost) {
          await PostAPI.updatePost(editingPost.id, formData);
        } else {
          await PostAPI.createPost(formData);
        }
        await fetchPosts();
        resetForm();
      } catch (err) {
        console.error('Error saving post:', err);
        setError(editingPost ? 'Failed to update post' : 'Failed to create post');
      } finally {
        setSubmitting(false);
      }
    },
    [formData, editingPost, submitting, fetchPosts, resetForm]
  );

  // Early loading
  if (loading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center text-gray-600 py-16">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header tối giản */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Posts</h1>
          <p className="text-sm text-gray-500">Page size: {limit} • Current page: {page}</p>
        </div>
        <button onClick={showCreateForm} disabled={submitting} className={btnPrimary}>
          + New
        </button>
      </div>

      {/* Error */}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

      {/* Form */}
      {showForm && (
        <div className={card}>
          <h3 className="text-base font-medium mb-3">{editingPost ? 'Edit Post' : 'Create Post'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleInputChange('title')}
                disabled={submitting}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100"
                placeholder="Title…"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={handleInputChange('content')}
                disabled={submitting}
                rows={5}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-y disabled:bg-gray-100"
                placeholder="Content…"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={handleInputChange('status')}
                disabled={submitting}
                className="border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className={btnPrimary}>
                {editingPost ? 'Save' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} disabled={submitting} className={btn}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading “refreshing” đơn giản */}
      {loading && posts.length > 0 && <div className="text-center text-sm text-gray-500">Refreshing…</div>}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Page {page}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className={btn}
          >
            ◀ Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || posts.length < limit}
            className={btn}
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onEdit={handleEdit} onDelete={handleDelete} formatDate={formatDate} />
          ))
        ) : (
          !loading && <div className="text-center text-gray-500 py-8">No posts.</div>
        )}
      </div>
    </div>
  );
};

const PostCard: React.FC<{
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  formatDate: (date: { Time: string; Valid: boolean }) => string;
}> = React.memo(({ post, onEdit, onDelete, formatDate }) => {
  const btnMini = 'px-2 py-1 rounded border text-xs bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200';

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-semibold text-gray-900">{post.title}</h3>
        <div className="flex gap-2">
          <button onClick={() => onEdit(post)} className={btnMini}>Edit</button>
          <button onClick={() => onDelete(post.id)} className={btnMini}>Delete</button>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{post.content}</p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>By {post.username || 'Unknown'}</span>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700">
            {post.status ?? 'unknown'}
          </span>
          <span>{post.created_at && post.created_at.Valid ? formatDate(post.created_at) : 'Unknown date'}</span>
        </div>
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default PostsPage;
