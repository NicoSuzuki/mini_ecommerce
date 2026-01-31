import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, label }) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 8,
        textDecoration: "none",
        color: active ? "#111" : "#444",
        background: active ? "#f3f4f6" : "transparent",
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        minHeight: "100vh",
      }}
    >
      {/* Sidebar */}
      <aside style={{ borderRight: "1px solid #eee", padding: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Admin</div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
            {user?.email} ({user?.role})
          </div>
        </div>

        <nav style={{ display: "grid", gap: 6 }}>
          <NavItem to="/admin" label="Dashboard" />
          <NavItem to="/admin/orders" label="Orders" />
          <NavItem to="/admin/users" label="Users" />
          <NavItem to="/admin/products" label="Products" />
        </nav>

        <div style={{ marginTop: 16 }}>
          <button onClick={logout} style={{ width: "100%" }}>
            Logout
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <Link to="/products" style={{ fontSize: 13, color: "#6b7280" }}>
            ← Back to shop
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
