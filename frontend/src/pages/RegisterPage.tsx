import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register: registerUser, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerUser(username, email, password, confirmPassword);
    if (!error) navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_60%)]" aria-hidden />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center gap-12 lg:flex-row-reverse lg:gap-16">
        <div className="max-w-lg text-center text-white lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Join the community
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">Tạo tài khoản và bắt đầu hành trình của bạn</h1>
          <p className="mt-4 text-base text-slate-200/90">
            Chỉ vài bước đơn giản để bạn có thể quản lý nội dung, chia sẻ bài viết và kết nối với những thành viên khác trên MyApp.
          </p>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/80 p-8 shadow-2xl backdrop-blur">
          <h2 className="text-center text-2xl font-semibold text-slate-900">Tạo tài khoản</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Nhập thông tin của bạn để chúng tôi biết về bạn</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                placeholder="Tên hiển thị"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang tạo tài khoản...
                </span>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Đã có tài khoản?
            <Link to="/login" className="ml-1 font-medium text-sky-600 transition hover:text-sky-500">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
