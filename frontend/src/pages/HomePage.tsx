// src/pages/HomePage.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import PostAPI from '../api/postApi';
import type { Post, PostsListResponse } from '../api/postApi';
import UserAPI from '../api/userApi';
import type { User } from '../api/userApi';

const POSTS_PER_PAGE = 5;

const statusBadgeClass = (status?: string) => {
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

const roleBadgeClass = (role: string) => {
  if (role === 'admin') return 'border border-rose-200/70 bg-rose-50 text-rose-700';
  if (role === 'moderator') return 'border border-cyan-200/70 bg-cyan-50 text-cyan-700';
  return 'border border-slate-200 bg-slate-50 text-slate-600';
};

const getInitial = (value?: string) => value?.charAt(0).toUpperCase() ?? '?';

const HomePage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const canPrev = useMemo(() => page > 1 && !postsLoading, [page, postsLoading]);
  const canNext = useMemo(() => {
    if (typeof totalCount === 'number') {
      return !postsLoading && page * POSTS_PER_PAGE < totalCount;
    }
    return !postsLoading && posts.length === POSTS_PER_PAGE;
  }, [page, postsLoading, posts.length, totalCount]);

  const formatDate = useCallback((dt?: { Time: string; Valid: boolean }) => {
    if (!dt || !dt.Valid) return '';
    return new Date(dt.Time).toLocaleDateString();
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const usersRes = await UserAPI.getUsers();
      setUsers(Array.isArray(usersRes.users) ? usersRes.users : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsersError('Không tải được danh sách người dùng.');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async (p = page) => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      const postsRes: PostsListResponse = await PostAPI.getPosts(p, POSTS_PER_PAGE);
      const fetchedPosts = Array.isArray(postsRes.posts) ? postsRes.posts : [];
      setPosts(fetchedPosts);
      const derivedTotal = typeof postsRes.totalCount === 'number'
        ? postsRes.totalCount
        : typeof postsRes.total === 'number'
        ? postsRes.total
        : null;
      setTotalCount(derivedTotal);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setPostsError('Không tải được danh sách bài viết.');
      setPosts([]);
      setTotalCount(null);
    } finally {
      setPostsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page]);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-800 px-10 py-14 text-white shadow-2xl">
        <div className="absolute -left-36 top-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden />
        <div className="absolute -right-24 -bottom-20 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" aria-hidden />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            MyApp platform
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-5xl">
            Khám phá cộng đồng và bài viết nổi bật mỗi ngày
          </h1>
          <p className="mt-4 text-base text-slate-200 md:text-lg">
            Nơi bạn có thể kết nối với những thành viên năng động, cập nhật các bài viết mới và quản lý nội dung một cách trực quan.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setPage(1)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-indigo-100"
            >
              Khám phá bài viết
            </button>
            <button
              type="button"
              onClick={fetchUsers}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Làm mới danh sách người dùng
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
              👥
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Danh sách người dùng</h2>
              <p className="text-sm text-slate-500">Cập nhật những thành viên hoạt động gần đây</p>
            </div>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-sm text-slate-600">
            Tổng cộng: {users.length}
          </span>
        </div>

        {usersLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur animate-pulse">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </div>
                </div>
                <div className="h-5 w-20 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : usersError ? (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-rose-700">
            ⚠️ {usersError}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="group rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-slate-600 to-purple-500 text-lg font-semibold text-white shadow-inner">
                    {getInitial(user.username || user.email)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{user.username}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-slate-400">ID: {user.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
              📝
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Danh sách bài viết</h2>
              <p className="text-sm text-slate-500">Xem nhanh các bài viết mới nhất và trạng thái xuất bản</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>
              Page {page}
              {typeof totalCount === 'number' && <span className="ml-1">• Tổng: {totalCount}</span>}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-slate-300 hover:text-slate-700"
              >
                ◀ Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!canNext}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-slate-300 hover:text-slate-700"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>

        {postsLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur animate-pulse">
                <div className="mb-4 h-5 w-2/3 rounded bg-slate-200" />
                <div className="mb-2 h-4 w-full rounded bg-slate-200" />
                <div className="mb-6 h-4 w-3/4 rounded bg-slate-200" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                      <div className="h-3 w-16 rounded bg-slate-200" />
                    </div>
                  </div>
                  <div className="h-6 w-20 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : postsError ? (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-rose-700">
            ⚠️ {postsError}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="mb-3 text-xl font-semibold text-slate-900">{post.title}</h3>
                <p className="mb-6 line-clamp-3 text-sm text-slate-600">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 via-slate-600 to-indigo-500 text-sm font-semibold text-white shadow-inner">
                      {getInitial(post.username)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{post.username}</p>
                      <p className="text-xs text-slate-500">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(post.status)}`}>
                    {post.status ?? 'unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white/80 py-16 text-center text-slate-500">
            <div className="mb-4 text-6xl">📭</div>
            <h3 className="mb-2 text-lg font-medium">Chưa có bài viết</h3>
            <p>Tạo bài viết đầu tiên để khởi động cộng đồng nhé!</p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
          <span>Page {page}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              className="rounded-full border border-transparent bg-white px-3 py-1 text-sm text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-slate-300 hover:text-slate-700"
            >
              ◀ Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!canNext}
              className="rounded-full border border-transparent bg-white px-3 py-1 text-sm text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-slate-300 hover:text-slate-700"
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
