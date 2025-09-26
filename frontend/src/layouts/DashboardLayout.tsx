import { useState } from "react";
import type { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const navItems: { to: string; label: string; icon: ReactNode }[] = [
  { to: "/dashboard", label: "Overview", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" />
      </svg>
    ) },
  { to: "/posts", label: "Manage Posts", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h4a2 2 0 012 2v12a2 2 0 01-2 2z" />
      </svg>
    ) },
  { to: "/users", label: "Manage Users", icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) },
];

export default function DashboardLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Navbar />

      <div className="relative flex flex-1">
        {/* Sidebar */}
        <aside className="hidden shrink-0 border-r border-slate-200 bg-white/90 px-6 pb-8 pt-10 shadow-sm backdrop-blur md:flex md:w-64 md:flex-col">
          <h2 className="mb-10 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600/10 text-indigo-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6" />
              </svg>
            </span>
            Dashboard
          </h2>
          <nav className="flex flex-col gap-2">
            {navItems.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-indigo-50 hover:text-indigo-700 ${isActive(to) ? "bg-indigo-100 text-indigo-700 shadow-sm" : "text-slate-600"}`}
              >
                <span className={isActive(to) ? "text-indigo-600" : "text-slate-400"}>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile navigation */}
        <div className="w-full md:hidden">
          <div className="border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              <span>Dashboard menu</span>
              <svg className={`h-5 w-5 transition-transform ${mobileMenuOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="mt-3 flex flex-col gap-2">
                {navItems.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${isActive(to) ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur md:p-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}





