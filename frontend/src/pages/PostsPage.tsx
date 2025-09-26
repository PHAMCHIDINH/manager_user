import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostAPI from '../api/postApi';
import type { CreatePostRequest, Post } from '../api/postApi';

const PostsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const limit = 5;

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

  const userIdParam = searchParams.get('userId');
  const userIdFilter = useMemo(() => {
    if (!userIdParam) return null;
    const parsed = Number(userIdParam);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  }, [userIdParam]);

  const btnBase = 'rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40';
  const btn = `${btnBase} border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-700`;
  const btnPrimary = `${btnBase} border border-transparent bg-indigo-600 text-white shadow-md hover:bg-indigo-700`;
  const card = 'rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur';

  const formatDate = useCallback((dateObj: { Time: string; Valid: boolean }) => {
    if (!dateObj?.Valid) return 'Unknown date';
    return new Date(dateObj.Time).toLocaleDateString('vi-VN');
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

      let data;
      if (userIdFilter) {
        data = await PostAPI.getPostsByUser(userIdFilter, page, limit);
      } else {
        data = await PostAPI.getPosts(page, limit);
      }

      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Không tải được danh sách bài viết. Vui lòng thử lại sau.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, userIdFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setPage(1);
  }, [userIdFilter]);

  useEffect(() => {
    if (!loading && posts.length === 0 && page > 1) {
      setPage((p) => p - 1);
    }
  }, [posts, loading, page]);

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
      title: post.title ?? '',
      content: post.content ?? '',
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

  const clearUserFilter = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('userId');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

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
    [editingPost, fetchPosts, formData, resetForm, submitting]
  );

  const hasMore = posts.length === limit;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-8 py-10 text-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Posts Dashboard
            </span>
            <h1 className="mt-4 text-3xl font-semibold">Quản lý bài viết</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-200/80">
              Tạo, chỉnh sửa và xuất bản bài viết của bạn trong một giao diện hiện đại, liền mạch.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={showCreateForm}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Tạo bài viết
            </button>
            <button
              onClick={fetchPosts}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Làm mới
            </button>
          </div>
        </div>
      </section>

      {userIdFilter && (
        <div className="rounded-3xl border border-slate-200 bg-white/70 px-5 py-3 text-sm text-slate-600 shadow-sm flex flex-wrap items-center gap-3">
          <span>Lọc theo user ID <strong>{userIdFilter}</strong></span>
          <button
            type="button"
            onClick={clearUserFilter}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
          >
            Bỏ lọc
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className={card}>
          <h3 className="text-lg font-semibold text-slate-900">{editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Tiêu đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleInputChange('title')}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/70 disabled:bg-slate-100"
                placeholder="Nhập tiêu đề hấp dẫn"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nội dung</label>
              <textarea
                value={formData.content}
                onChange={handleInputChange('content')}
                disabled={submitting}
                rows={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/70 disabled:bg-slate-100"
                placeholder="Chia sẻ câu chuyện của bạn..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Trạng thái</label>
              <select
                value={formData.status}
                onChange={handleInputChange('status')}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/70 disabled:bg-slate-100"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={submitting} className={btnPrimary}>
                {editingPost ? 'Lưu bài viết' : 'Tạo bài viết'}
              </button>
              <button type="button" onClick={resetForm} disabled={submitting} className={btn}>
                Huỷ
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && posts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-sm">
          Đang tải danh sách bài viết...
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
            <span>Trang {page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading} className={btn}>
                ◀ Prev
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={loading || !hasMore} className={btn}>
                Next ▶
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} onEdit={handleEdit} onDelete={handleDelete} formatDate={formatDate} />
              ))
            ) : (
              !loading && (
                <div className="rounded-3xl border border-slate-200 bg-white/80 py-12 text-center text-sm text-slate-500">
                  Chưa có bài viết nào. Bắt đầu bằng việc tạo một bài viết mới!
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

const PostCard: React.FC<{
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  formatDate: (date: { Time: string; Valid: boolean }) => string;
}> = React.memo(({ post, onEdit, onDelete, formatDate }) => {
  const badgeClass = (status?: Post['status']) => {
    switch (status) {
      case 'published':
        return 'border border-emerald-200/70 bg-emerald-50 text-emerald-700';
      case 'draft':
        return 'border border-amber-200/70 bg-amber-50 text-amber-700';
      case 'archived':
        return 'border border-slate-300 bg-slate-100 text-slate-700';
      default:
        return 'border border-slate-200 bg-slate-50 text-slate-600';
    }
  };

  const actionBtn = 'rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700';

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{post.content}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(post)} className={actionBtn}>
            Edit
          </button>
          <button onClick={() => onDelete(post.id)} className={actionBtn}>
            Delete
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 via-slate-600 to-indigo-500 text-xs font-semibold text-white shadow-inner">
            {post.username?.charAt(0).toUpperCase() ?? '?'}
          </span>
          <div>
            <span className="font-medium text-slate-900">{post.username || 'Unknown'}</span>
            <p>{post.created_at && post.created_at.Valid ? formatDate(post.created_at) : 'Unknown date'}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(post.status)}`}>
          {post.status ?? 'unknown'}
        </span>
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default PostsPage;

