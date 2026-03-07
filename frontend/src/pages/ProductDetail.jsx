import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productsService";
import { useCart } from "../context/CartContext";

function formatJPY(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function formatMoney(amountCents, currency) {
  if (currency === "JPY") return `¥${formatJPY(amountCents)}`;
  return `${amountCents} ${currency}`;
}

// Proxy-friendly: keep /uploads/... as-is so Vite proxy handles it
function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (mounted) setProduct(res?.data || null);
      } catch (err) {
        if (mounted) setError(err?.message || "Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, qty);
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-slate-100" />
            <div className="space-y-3">
              <div className="h-5 w-56 animate-pulse rounded bg-slate-100" />
              <div className="h-10 w-40 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="h-10 w-48 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-semibold">{error}</p>
          <Link
            to="/products"
            className="mt-3 inline-block text-sm font-semibold text-slate-900 underline underline-offset-4"
          >
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700">Product not found.</p>
          <Link
            to="/products"
            className="mt-3 inline-block text-sm font-semibold text-slate-900 underline underline-offset-4"
          >
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  const outOfStock = Number(product.stock) <= 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4">
        <Link
          to="/products"
          className="text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          ← Back to products
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Image */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {product.image_url ? (
              <img
                src={resolveImageUrl(product.image_url)}
                alt={product.name}
                className="aspect-square w-full rounded-xl object-cover"
                loading="lazy"
              />
            ) : (
              <div className="grid aspect-square w-full place-items-center rounded-xl bg-slate-100 text-slate-500">
                No image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
                  {product.name}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Product ID:{" "}
                  <span className="font-semibold">{product.id_product}</span>
                </p>
              </div>

              <span
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                  outOfStock
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700",
                ].join(" ")}
              >
                {outOfStock ? "Out of stock" : `In stock: ${product.stock}`}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-500">Price</div>
              <div className="mt-1 text-3xl font-black text-slate-900">
                {formatMoney(product.price_cents, product.currency)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Tax/shipping not included
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold text-slate-900">
                Description
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {product.description || "No description yet."}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-700">
                  Qty
                </label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isInteger(v) || v <= 0) return;
                    setQty(v);
                  }}
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                />
              </div>

              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add to cart
              </button>

              <Link
                to="/cart"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                View cart
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Tip: images are served from{" "}
              <code className="rounded bg-slate-100 px-1">/uploads</code> via
              Vite proxy in dev.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
