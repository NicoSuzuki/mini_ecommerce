import { useEffect, useRef, useState } from "react";
import {
  getProducts,
  getDeletedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
} from "../../services/productsService";
import { uploadProductImage } from "../../services/uploadService";

function formatJPY(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function formatMoney(amountCents, currency) {
  if (currency === "JPY") return `¥${formatJPY(amountCents)}`;
  return `${amountCents} ${currency}`;
}

// Proxy-friendly: keep /uploads/... relative so Vite proxy handles it
function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.startsWith("/") ? url : `/${url}`;
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
  const [tab, setTab] = useState("active"); // active | deleted
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // upload
  const [file, setFile] = useState(null);
  const [localPreview, setLocalPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // row actions
  const [rowBusy, setRowBusy] = useState({});

  const controllerRef = useRef(null);

  // local preview (instant)
  useEffect(() => {
    if (!file) {
      setLocalPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const load = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setError("");
    setLoading(true);
    try {
      const res =
        tab === "active"
          ? await getProducts({}, { signal: controller.signal })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setUploadError("");
    setError("");
  };

  const startEdit = (p) => {
    setForm({
      id_product: p.id_product,
      name: p.name || "",
      description: p.description || "",
      price_cents: String(p.price_cents ?? ""),
      currency: p.currency || "JPY",
      stock: String(p.stock ?? ""),
      image_url: p.image_url || "",
    });
    setFile(null);
    setUploadError("");
    setError("");
  };

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

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please choose an image first.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const res = await uploadProductImage(file);
      const url = res?.data?.image_url;
      if (!url) throw new Error("Upload did not return image_url");

      setForm((p) => ({ ...p, image_url: url }));
      setFile(null);
    } catch (err) {
      setUploadError(err?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
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
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, edit, delete and restore products.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("active")}
            className={[
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              tab === "active"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
            ].join(" ")}
          >
            Active
          </button>
          <button
            onClick={() => setTab("deleted")}
            className={[
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              tab === "deleted"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
            ].join(" ")}
          >
            Deleted
          </button>

          <button
            onClick={load}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create/Edit form */}
      {tab === "active" && (
        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-extrabold text-slate-900">
                {form.id_product
                  ? `Edit product #${form.id_product}`
                  : "Create product"}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Upload an image (optional) and save the product.
              </div>
            </div>

            <button
              type="button"
              onClick={startCreate}
              disabled={saving || uploading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              New
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Name
              </label>
              <input
                placeholder="Product name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Price (cents)
              </label>
              <input
                placeholder="price_cents"
                value={form.price_cents}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price_cents: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Stock
              </label>
              <input
                placeholder="stock"
                value={form.stock}
                onChange={(e) =>
                  setForm((p) => ({ ...p, stock: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Currency
              </label>
              <input
                placeholder="JPY"
                value={form.currency}
                onChange={(e) =>
                  setForm((p) => ({ ...p, currency: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Description (optional)
              </label>
              <input
                placeholder="Short description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Upload section */}
          <div className="mt-6 grid gap-4 md:grid-cols-[200px_1fr]">
            {/* Preview */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              {localPreview ? (
                <img
                  src={localPreview}
                  alt="local preview"
                  className="aspect-square w-full rounded-xl object-cover"
                />
              ) : form.image_url ? (
                <img
                  src={resolveImageUrl(form.image_url)}
                  alt="uploaded preview"
                  className="aspect-square w-full rounded-xl object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="grid aspect-square place-items-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
                  No image
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-bold text-slate-900">
                Product image (optional)
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Choose an image and click upload. The returned{" "}
                <code className="rounded bg-slate-100 px-1">/uploads/...</code>{" "}
                path will be stored in{" "}
                <code className="rounded bg-slate-100 px-1">image_url</code>.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={uploading || saving}
                  className="block text-sm"
                />

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || uploading || saving}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload image"}
                </button>
              </div>

              {uploadError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {uploadError}
                </div>
              )}

              <div className="mt-3">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  image_url
                </label>
                <input
                  placeholder="/uploads/your-file.png"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, image_url: e.target.value }))
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : form.id_product
                      ? "Update product"
                      : "Create product"}
                </button>

                <span className="text-xs text-slate-500">
                  Tip: upload first, then save.
                </span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-600"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-600"
                  >
                    No products.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const busy = !!rowBusy[p.id_product];
                  return (
                    <tr
                      key={p.id_product}
                      className="border-b border-slate-100"
                    >
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-900">
                          {p.id_product}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={resolveImageUrl(p.image_url)}
                              alt={p.name}
                              className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-100" />
                          )}

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {p.name}
                            </div>
                            <div className="truncate text-xs text-slate-500">
                              {p.image_url || "no image"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-900">
                          {formatMoney(p.price_cents, p.currency)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-900">
                          {p.stock}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {tab === "active" ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(p)}
                              disabled={saving || uploading}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(p.id_product)}
                              disabled={busy}
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {busy ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestore(p.id_product)}
                            disabled={busy}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busy ? "Restoring..." : "Restore"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>Use “Deleted” tab to restore products.</div>
        </div>
      </div>
    </div>
  );
}
