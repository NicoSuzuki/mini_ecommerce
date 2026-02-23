import { useEffect, useState } from "react";
import { getProducts } from "../services/productsService";
import { Link } from "react-router-dom";

export default function Products() {
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
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {items.map((product) => (
            <a
              key={product.id_product}
              href={`/products/${product.id_product}`}
              className="group"
            >
              <img
                src={product.image_url}
                className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8"
              />
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {product.currency}
                {product.price_cents}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>

    /*<div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Products</h2>
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
    </div>*/
  );
}
