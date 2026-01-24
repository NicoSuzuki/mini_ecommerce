import { useEffect, useState } from "react";
import { getProducts } from "../services/productsService";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Products() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getProducts({ limit: 50, offset: 0 });
        setItems(res.data || []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Products</h2>
        {user && (
          <>
            <span>
              Logged in as: {user.email} ({user.role})
            </span>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        {items.map((p) => (
          <div
            key={p.id_product}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
          >
            <strong>
              <Link to={`/products/${p.id_product}`}>{p.name}</Link>
            </strong>
            <p style={{ margin: "8px 0" }}>
              {p.description || "No description"}
            </p>
            <div>
              Price: {p.price_cents} {p.currency}
            </div>
            <div>Stock: {p.stock}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
