import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-lg px-3 py-2 text-sm font-semibold transition",
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-100",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        {/* Brand */}
        <Link to="/products" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white font-black">
            M
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight text-slate-900">
              Mini E-commerce
            </div>
            <div className="text-xs text-slate-500">Node · React · MySQL</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <NavItem to="/products">Products</NavItem>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              [
                "relative rounded-lg px-3 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100",
              ].join(" ")
            }
          >
            Cart
            {count > 0 && (
              <span className="ml-2 inline-flex min-w-6 justify-center rounded-full bg-emerald-600 px-2 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </NavLink>

          {user ? (
            <>
              <NavItem to="/orders">Orders</NavItem>

              {user.role === "admin" && <NavItem to="/admin">Admin</NavItem>}

              <div className="ml-2 flex items-center gap-2">
                <span className="hidden sm:block text-xs text-slate-500">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Register</NavItem>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
