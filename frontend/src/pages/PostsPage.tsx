import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PostAPI from '../api/postApi';
import type { Post, CreatePostRequest } from '../api/postApi';

const PostsPage: React.FC = () => {
  // States
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

  // Memoized form validation
  const isFormValid = useMemo(() => {
    return formData.title.trim() && formData.content.trim();
  }, [formData.title, formData.content]);

  // Memoized posts stats
  const postsStats = useMemo(() => ({
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
  }), [posts]);

  // Fetch posts function với useCallback để tránh re-render
  // 2) fetchPosts: dùng page & limit (5)
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PostAPI.getPosts(page, limit); // <-- page, 5
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page]); // <-- re-fetch khi page đổi


  // Load posts on mount
  useEffect(() => {
  fetchPosts();
}, [fetchPosts]);

  // Reset form function
  const resetForm = useCallback(() => {
    setFormData({ title: '', content: '', status: 'published' });
    setEditingPost(null);
    setShowForm(false);
    setError(null);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      if (editingPost) {
        await PostAPI.updatePost(editingPost.id, formData);
      } else {
        await PostAPI.createPost(formData);
      }
      
      // Refresh posts list
      await fetchPosts();
      resetForm();
    } catch (error) {
      console.error('Error saving post:', error);
      setError(editingPost ? 'Failed to update post' : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingPost, isFormValid, submitting, fetchPosts, resetForm]);

  // Handle edit post
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

  // Handle delete post
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setError(null);
      await PostAPI.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError('Failed to delete post. Please try again.');
    }
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof CreatePostRequest) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      // Clear error when user starts typing
      if (error) setError(null);
    }, [error]
  );

  // Show create form
  const showCreateForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  // Format date helper
  const formatDate = useCallback((dateObj: { Time: string; Valid: boolean }) => {
    if (!dateObj.Valid) return 'Unknown date';
    return new Date(dateObj.Time).toLocaleDateString();
  }, []);

  // Loading state
  if (loading && posts.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header với stats */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">📝 Posts Management</h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Total: {postsStats.total}</span>
            <span>Published: {postsStats.published}</span>
            <span>Draft: {postsStats.draft}</span>
          </div>
        </div>
        <button
          onClick={showCreateForm}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Create New Post
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {editingPost ? '✏️ Edit Post' : '📝 Create New Post'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={handleInputChange('title')}
                disabled={submitting}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter post title..."
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={handleInputChange('content')}
                disabled={submitting}
                rows={6}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 resize-y disabled:bg-gray-100"
                placeholder="Write your post content here..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Status:</label>
              <select
                value={formData.status}
                onChange={handleInputChange('status')}
                disabled={submitting}
                className="border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
              >
                <option value="published">📢 Published</option>
                <option value="draft">📝 Draft</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {submitting 
                  ? '⏳ Saving...' 
                  : editingPost 
                    ? '💾 Update Post' 
                    : '✅ Create Post'
                }
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      {loading && posts.length > 0 && (
        <div className="text-center mb-4">
          <span className="text-sm text-gray-500">🔄 Refreshing...</span>
        </div>
      )}
            {/* Pagination Controls */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">Page {page}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
          >
            ◀ Prev
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading || posts.length < limit}
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
          >
            Next ▶
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={handleEdit}
              onDelete={handleDelete}
              formatDate={formatDate}
            />
          ))
        ) : (
          !loading && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium mb-2">No posts found</h3>
              <p className="mb-4">Create your first post to get started!</p>
              <button
                onClick={showCreateForm}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create Post
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

// PostCard component được tách ra để tối ưu re-render
const PostCard: React.FC<{
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  formatDate: (date: { Time: string; Valid: boolean }) => string;
}> = React.memo(({ post, onEdit, onDelete, formatDate }) => {
  const handleEdit = useCallback(() => onEdit(post), [onEdit, post]);
  const handleDelete = useCallback(() => onDelete(post.id), [onDelete, post.id]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      {/* Title + Actions */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-4">{post.title}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleEdit}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-1 rounded-md text-sm transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>

      {/* Meta info */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>👤 By: {post.username || 'Unknown'}</span>
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full text-xs ${
              post.status === 'published'
                ? 'bg-green-100 text-green-800'
                : post.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {post.status === 'published' 
              ? '📢 Published' 
              : post.status === 'draft' 
                ? '📝 Draft' 
                : '📁 Unknown'
            }
          </span>
          <span>
            📅 {post.createdAt && typeof post.createdAt === 'object' && 'Time' in post.createdAt && 'Valid' in post.createdAt
              ? formatDate(post.createdAt as { Time: string; Valid: boolean })
              : 'Unknown date'}
          </span>
        </div>
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';

export default PostsPage;