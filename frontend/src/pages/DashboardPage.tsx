import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_55%)]" aria-hidden />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur">
        <h2 className="text-center text-2xl font-semibold tracking-tight">Thông tin tài khoản</h2>
        {user ? (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-sky-500 text-3xl font-semibold text-white shadow-lg">
              {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="w-full rounded-2xl bg-white/10 p-4 text-sm">
              <div className="text-center text-lg font-medium text-white">
                {user.username || user.email}
              </div>
              <div className="mt-2 text-center text-slate-200/90">{user.email}</div>
              {user.role && (
                <div className="mt-4 flex justify-center">
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6 text-center text-slate-200">
            Bạn chưa đăng nhập. Hãy đăng nhập để xem thông tin chi tiết của tài khoản.
          </div>
        )}
      </div>
    </div>
  );
}
