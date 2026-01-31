import { Link } from "react-router-dom";

function Card({ to, title, desc }) {
  return (
    <Link
      to={to}
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 6, color: "#6b7280", fontSize: 14 }}>{desc}</div>
    </Link>
  );
}

export default function AdminHome() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <p style={{ color: "#6b7280" }}>Quick access to admin tools.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Card
          to="/admin/orders"
          title="Orders"
          desc="View and update order status"
        />
        <Card
          to="/admin/users"
          title="Users"
          desc="Manage roles and active status"
        />
        <Card
          to="/admin/products"
          title="Products"
          desc="Create/edit products and manage stock"
        />
      </div>
    </div>
  );
}
