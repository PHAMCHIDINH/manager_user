import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
  password: yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
});

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    await login(data.email, data.password);
    if (!error) navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.2),_transparent_60%)]" aria-hidden />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center gap-12 lg:flex-row lg:gap-16">
        <div className="max-w-lg text-center text-white lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Secure Access
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">Đăng nhập để tiếp tục trải nghiệm MyApp</h1>
          <p className="mt-4 text-base text-slate-200/90">
            Quản lý bài viết, kết nối với cộng đồng và khám phá những cập nhật mới nhất trong một không gian làm việc thanh lịch.
          </p>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/80 p-8 shadow-2xl backdrop-blur">
          <h2 className="text-center text-2xl font-semibold text-slate-900">Chào mừng trở lại</h2>
          <p className="mt-2 text-center text-sm text-slate-600">Nhập thông tin đăng nhập của bạn để tiếp tục</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                {...register("email")}
                className={`w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/70 disabled:bg-slate-100 ${
                  errors.email ? 'border-rose-400' : 'border-slate-300'
                }`}
                placeholder="name@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                {...register("password")}
                className={`w-full rounded-lg border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/70 disabled:bg-slate-100 ${
                  errors.password ? 'border-rose-400' : 'border-slate-300'
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Chưa có tài khoản?
            <Link to="/register" className="ml-1 font-medium text-indigo-600 transition hover:text-indigo-500">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
