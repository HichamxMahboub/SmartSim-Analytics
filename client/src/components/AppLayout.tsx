import { Activity, BarChart3, FolderKanban, LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/app/projects", label: "Projects", icon: FolderKanban }
] as const;

export function AppLayout(): JSX.Element {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <NavLink to="/app/dashboard" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-cyan-300">
            <Activity size={20} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">SmartSim</span>
            <span className="block text-xs text-slate-500">Analytics</span>
          </span>
        </NavLink>

        <nav className="mt-8 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive ? "bg-cyan-50 text-cyan-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                ].join(" ")
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <nav className="flex items-center rounded-lg border border-slate-200 bg-white p-1 lg:hidden">
                {navItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "grid h-9 w-9 place-items-center rounded-md",
                        isActive ? "bg-slate-950 text-white" : "text-slate-500"
                      ].join(" ")
                    }
                    aria-label={item.label}
                  >
                    <item.icon size={18} />
                  </NavLink>
                ))}
              </nav>
              <button
                type="button"
                onClick={handleLogout}
                className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-rose-600"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

