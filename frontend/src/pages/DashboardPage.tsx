import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Thông tin người dùng</h2>
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl">
              {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-blue-700">{user.username || user.email}</div>
              <div className="text-gray-500">{user.email}</div>
              {user.role && (
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                  {user.role}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center">Chưa đăng nhập.</div>
        )}
      </div>
    </div>
  );
}