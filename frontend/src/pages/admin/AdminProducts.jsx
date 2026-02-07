import { useEffect, useRef, useState } from "react";
import {
  getProducts,
  getDeletedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from "../../services/productsService";

function formatJPY(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function money(price_cents, currency) {
  if (currency === "JPY") return `¥${formatJPY(price_cents)}`;
  return `${price_cents} ${currency}`;
}

const EMPTY_FORM = {
  id_product: null,
  name: "",
  description: "",
  price_cents: "",
  currency: "JPY",
  stock: "",
  image_url: "",
};

export default function AdminProducts() {
  const [tab, setTab] = useState("active");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [rowBusy, setRowBusy] = useState({});
  const controllerRef = useRef(null);

  const load = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setError("");
    setLoading(true);
    try {
      const res =
        tab === "active"
          ? await getProducts({ signal: controller.signal })
          : await getDeletedProducts({ signal: controller.signal });

      setProducts(res?.data || []);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [tab]);

  const startCreate = () => setForm(EMPTY_FORM);

  const startEdit = (p) =>
    setForm({
      id_product: p.id_product,
      name: p.name || "",
      description: p.description || "",
      price_cents: String(p.price_cents ?? ""),
      currency: p.currency || "JPY",
      stock: String(p.stock ?? ""),
      image_url: p.image_url || "",
    });

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    const price = Number(form.price_cents);
    if (!Number.isInteger(price) || price < 0)
      return "price_cents must be an integer >= 0";
    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0)
      return "stock must be an integer >= 0";
    const cur = (form.currency || "").trim().toUpperCase();
    if (cur.length !== 3) return "currency must be a 3-letter code (e.g., JPY)";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validateForm();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() ? form.description.trim() : null,
        price_cents: Number(form.price_cents),
        currency: form.currency.trim().toUpperCase(),
        stock: Number(form.stock),
        image_url: form.image_url.trim() ? form.image_url.trim() : null,
      };

      if (form.id_product) {
        await updateProduct(form.id_product, payload);
      } else {
        await createProduct(payload);
      }

      startCreate();
      await load();
    } catch (err) {
      setError(err?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id_product) => {
    setRowBusy((p) => ({ ...p, [id_product]: true }));
    setError("");
    try {
      await deleteProduct(id_product);
      await load();
    } catch (err) {
      setError(err?.message || "Failed to delete product");
    } finally {
      setRowBusy((p) => ({ ...p, [id_product]: false }));
    }
  };

  const handleRestore = async (id_product) => {
    setRowBusy((p) => ({ ...p, [id_product]: true }));
    setError("");
    try {
      await restoreProduct(id_product);
      await load();
    } catch (err) {
      setError(err?.message || "Failed to restore product");
    } finally {
      setRowBusy((p) => ({ ...p, [id_product]: false }));
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Products</h2>
        <button onClick={load} style={{ height: 36 }}>
          Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button
          onClick={() => setTab("active")}
          style={{ fontWeight: tab === "active" ? 700 : 400 }}
        >
          Active
        </button>
        <button
          onClick={() => setTab("deleted")}
          style={{ fontWeight: tab === "deleted" ? 700 : 400 }}
        >
          Deleted
        </button>
      </div>

      {error && <div style={{ marginTop: 12, color: "#b91c1c" }}>{error}</div>}

      {tab === "active" && (
        <form
          onSubmit={onSubmit}
          style={{
            marginTop: 14,
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>
              {form.id_product
                ? `Edit product #${form.id_product}`
                : "Create product"}
            </strong>
            <button type="button" onClick={startCreate} disabled={saving}>
              New
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px 120px 120px",
              gap: 10,
              marginTop: 10,
            }}
          >
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              placeholder="price_cents"
              value={form.price_cents}
              onChange={(e) =>
                setForm((p) => ({ ...p, price_cents: e.target.value }))
              }
            />
            <input
              placeholder="currency"
              value={form.currency}
              onChange={(e) =>
                setForm((p) => ({ ...p, currency: e.target.value }))
              }
            />
            <input
              placeholder="stock"
              value={form.stock}
              onChange={(e) =>
                setForm((p) => ({ ...p, stock: e.target.value }))
              }
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 10,
            }}
          >
            <input
              placeholder="image_url (optional)"
              value={form.image_url}
              onChange={(e) =>
                setForm((p) => ({ ...p, image_url: e.target.value }))
              }
            />
            <input
              placeholder="description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : form.id_product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ marginTop: 12 }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={{ marginTop: 12 }}>No products.</div>
      ) : (
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 10 }}>ID</th>
                <th style={{ padding: 10 }}>Name</th>
                <th style={{ padding: 10 }}>Price</th>
                <th style={{ padding: 10 }}>Stock</th>
                <th style={{ padding: 10 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id_product}
                  style={{ borderBottom: "1px solid #f1f1f1" }}
                >
                  <td style={{ padding: 10 }}>
                    <strong>{p.id_product}</strong>
                  </td>
                  <td style={{ padding: 10 }}>{p.name}</td>
                  <td style={{ padding: 10 }}>
                    {money(p.price_cents, p.currency)}
                  </td>
                  <td style={{ padding: 10 }}>{p.stock}</td>
                  <td style={{ padding: 10, display: "flex", gap: 10 }}>
                    {tab === "active" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id_product)}
                          disabled={!!rowBusy[p.id_product]}
                        >
                          {rowBusy[p.id_product] ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(p.id_product)}
                        disabled={!!rowBusy[p.id_product]}
                      >
                        {rowBusy[p.id_product] ? "Restoring..." : "Restore"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
