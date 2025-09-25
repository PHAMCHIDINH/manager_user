// src/pages/HomePage.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import PostAPI from '../api/postApi';
import type { Post } from '../api/postApi';
import UserAPI from '../api/userApi';
import type { User } from '../api/userApi';

const POSTS_PER_PAGE = 5;

const HomePage = () => {
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Posts state + pagination
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null); // optional (nếu backend trả)

  // Helpers
  const canPrev = useMemo(() => page > 1 && !postsLoading, [page, postsLoading]);
  const canNext = useMemo(() => {
    // Nếu backend trả totalCount thì dùng nó, không thì fallback: < POSTS_PER_PAGE là trang cuối
    if (typeof totalCount === 'number') {
      return !postsLoading && page * POSTS_PER_PAGE < totalCount;
    }
    return !postsLoading && posts.length === POSTS_PER_PAGE;
  }, [page, postsLoading, posts.length, totalCount]);

  const formatDate = useCallback((dt?: { Time: string; Valid: boolean }) => {
    if (!dt || !dt.Valid) return '';
    return new Date(dt.Time).toLocaleDateString();
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const usersRes = await UserAPI.getUsers(); // giả định trả { users: User[] }
      setUsers(Array.isArray(usersRes.users) ? usersRes.users : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsersError('Không tải được danh sách người dùng.');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch posts theo page
  const fetchPosts = useCallback(async (p = page) => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      const postsRes = await PostAPI.getPosts(p, POSTS_PER_PAGE);
      setPosts(Array.isArray(postsRes.posts) ? postsRes.posts : []);
      // Nếu backend trả totalCount hoặc total thì set để tính chính xác
      const tc = (postsRes as any).totalCount ?? (postsRes as any).total;
      setTotalCount(typeof tc === 'number' ? tc : null);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setPostsError('Không tải được danh sách bài viết.');
      setPosts([]);
      setTotalCount(null);
    } finally {
      setPostsLoading(false);
    }
  }, [page]);

  // Load lần đầu
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Load posts mỗi khi đổi trang
  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Chào mừng đến với MyApp! 🎉</h1>
        <p className="text-xl opacity-90">Khám phá cộng đồng người dùng và bài viết thú vị</p>
      </div>

      {/* Users Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h2 className="text-3xl font-bold text-gray-800">Danh sách người dùng</h2>
        </div>

        {usersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white shadow-lg rounded-2xl p-6 border animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-40 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : usersError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ⚠️ {usersError}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Posts Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h4a2 2 0 012 2v12a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-3xl font-bold text-gray-800">Danh sách bài viết</h2>
        </div>

        {/* Pagination controls (trên) */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            Page {page}
            {typeof totalCount === 'number' && (
              <> • Total: {totalCount}</>
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
            >
              ◀ Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!canNext}
              className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
            >
              Next ▶
            </button>
          </div>
        </div>

        {postsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
              <div key={i} className="bg-white shadow-lg rounded-2xl p-6 border animate-pulse">
                <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-5/6 bg-gray-200 rounded mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : postsError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ⚠️ {postsError}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <h3 className="font-bold text-xl text-gray-800 mb-3">{post.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {post.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{post.username}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : post.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {post.status ?? 'unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium mb-2">Chưa có bài viết</h3>
            <p>Hãy quay lại sau nhé!</p>
          </div>
        )}

        {/* Pagination controls (dưới) */}
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-600">Page {page}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
            >
              ◀ Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!canNext}
              className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
            >
              Next ▶
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
