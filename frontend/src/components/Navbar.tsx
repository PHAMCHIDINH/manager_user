import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 px-4 md:px-8 py-2 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition">📝</span>
            <span className="font-semibold text-lg text-gray-800 group-hover:text-blue-700 transition">MyBlog</span>
          </Link>
          <div className="hidden md:flex gap-4 ml-6">
            <Link to="/home" className="nav-link">Home</Link>
            <Link to="/posts" className="nav-link">Posts</Link>
            <Link to="/users" className="nav-link">Users</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </div>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                <span className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="text-gray-800 font-medium text-sm max-w-[100px] truncate">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold text-white shadow transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Responsive nav (optional) */}
      <style>{`
        .nav-link {
          @apply text-gray-700 font-medium px-3 py-2 rounded transition hover:bg-blue-50 hover:text-blue-700;
        }
        .nav-link.active {
          @apply text-blue-700 bg-blue-100;
        }
      `}</style>
    </nav>
  );
}
