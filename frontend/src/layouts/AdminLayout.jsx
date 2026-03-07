import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        [
          "rounded-lg px-3 py-2 text-sm font-semibold transition",
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="border-b border-slate-200 bg-white p-4 md:min-h-screen md:border-b-0 md:border-r md:sticky md:top-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">
                Admin
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {user?.email}{" "}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                  {user?.role}
                </span>
              </div>
            </div>

            <Link
              to="/products"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              title="Back to shop"
            >
              Shop
            </Link>
          </div>

          <nav className="mt-6 grid gap-2">
            <NavItem to="/admin" label="Dashboard" />
            <NavItem to="/admin/orders" label="Orders" />
            <NavItem to="/admin/users" label="Users" />
            <NavItem to="/admin/products" label="Products" />
          </nav>

          <div className="mt-6">
            <button
              onClick={logout}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
