import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const navLinks = [
  { to: "/home", label: "Home" },
  { to: "/posts", label: "Posts" },
  { to: "/users", label: "Users" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-600/10 p-2 text-2xl">📝</span>
            <span className="text-lg font-semibold text-slate-900">MyBlog</span>
          </Link>
          <nav className="hidden gap-2 md:flex">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm md:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/10 text-sm font-semibold text-indigo-600">
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </span>
                <span className="max-w-[120px] truncate font-medium">{user.username}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="hidden gap-2 md:flex">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`
                }
              >
                Login
              </NavLink>
              <Link
                to="/register"
                className="rounded-full bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 shadow-sm md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white/95 px-4 py-4 shadow-sm md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/10 text-sm font-semibold text-indigo-600">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <span className="font-medium text-slate-700">{user.username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`
                  }
                >
                  Login
                </NavLink>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
