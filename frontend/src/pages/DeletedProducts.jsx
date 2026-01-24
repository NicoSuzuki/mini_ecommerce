import { useEffect, useState } from "react";
import {
  getDeletedProducts,
  restoreProduct,
} from "../services/productsService";

export default function DeletedProducts() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await getDeletedProducts();
      setItems(res.data || []);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Deleted Products (Trash)</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {items.length === 0 ? (
        <p>No deleted products.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((p) => (
            <div
              key={p.id_product}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
            >
              <strong>{p.name}</strong>
              <div>
                Price: {p.price_cents} {p.currency} | Stock: {p.stock}
              </div>
              <button
                onClick={async () => {
                  try {
                    await restoreProduct(p.id_product);
                    await load();
                  } catch (e) {
                    alert(e.message);
                  }
                }}
                style={{ marginTop: 8 }}
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
