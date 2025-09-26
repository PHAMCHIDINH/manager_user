import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosClient';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: { Time: string; Valid: boolean };
}

const formatDate = (value: User['created_at']) => {
  if (!value?.Valid) return '—';
  return new Date(value.Time).toLocaleDateString('vi-VN');
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<{ users: User[] }>('/users');
        setUsers(res.data.users || []);
      } catch (error) {
        console.error('Failed to fetch users', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-8 py-10 text-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Users Overview
            </span>
            <h1 className="mt-4 text-3xl font-semibold">Quản lý thành viên hệ thống</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-200/80">
              Theo dõi thông tin thành viên, vai trò và ngày tham gia trong một bảng quản trị rõ ràng.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-right text-sm">
            <p className="text-slate-200/80">Tổng số thành viên</p>
            <p className="mt-1 text-3xl font-semibold">{users.length}</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white border-b-transparent" />
            <p className="text-sm text-slate-500">Đang tải danh sách người dùng...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-slate-600 to-purple-500 text-base font-semibold text-white shadow-inner">
                          {user.username?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user.username}</p>
                          <p className="text-xs text-slate-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/posts?userId=${user.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                      >
                        Xem bài viết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="border-t border-slate-100 bg-slate-50 py-12 text-center text-sm text-slate-500">
              Hiện chưa có thành viên nào trong hệ thống.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function roleBadgeClass(role: string) {
  if (role === 'admin') return 'border border-rose-200/60 bg-rose-50 text-rose-700';
  if (role === 'moderator') return 'border border-amber-200/60 bg-amber-50 text-amber-700';
  return 'border border-slate-200 bg-slate-50 text-slate-600';
}
