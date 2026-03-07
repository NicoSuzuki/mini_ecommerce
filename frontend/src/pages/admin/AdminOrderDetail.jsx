import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  adminFetchOrderById,
  adminUpdateOrderStatus,
} from "../../services/adminOrdersService";

function formatJPY(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function formatMoney(amountCents, currency) {
  if (currency === "JPY") return `¥${formatJPY(amountCents)}`;
  return `${amountCents} ${currency}`;
}

function statusBadge(status) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold";
  if (status === "paid") return `${base} bg-emerald-100 text-emerald-700`;
  if (status === "pending") return `${base} bg-amber-100 text-amber-700`;
  if (status === "cancelled") return `${base} bg-red-100 text-red-700`;
  return `${base} bg-slate-100 text-slate-700`;
}

const STATUS_OPTIONS = ["pending", "paid", "cancelled"];

export default function AdminOrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);

  const controllerRef = useRef(null);

  const load = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setError("");
    setLoading(true);

    try {
      const res = await adminFetchOrderById(id, { signal: controller.signal });
      const data = res?.data || null;
      setOrder(data);
      setSelectedStatus(data?.status || "");
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async () => {
    if (!order) return;
    setUpdating(true);
    setError("");
    try {
      await adminUpdateOrderStatus(order.id_order, selectedStatus);
      await load();
    } catch (err) {
      setError(err?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-44 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-40 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-semibold">{error}</p>
          <Link
            to="/admin/orders"
            className="mt-3 inline-block text-sm font-semibold text-slate-900 underline underline-offset-4"
          >
            ← Back to orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700">Order not found.</p>
          <Link
            to="/admin/orders"
            className="mt-3 inline-block text-sm font-semibold text-slate-900 underline underline-offset-4"
          >
            ← Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const changed = selectedStatus !== order.status;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4">
        <Link
          to="/admin/orders"
          className="text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          ← Back to orders
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Order #{order.id_order}
              </h1>
              <span className={statusBadge(order.status)}>{order.status}</span>
            </div>

            <div className="mt-2 text-sm text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">User:</span>{" "}
                {order.email || `id_user: ${order.id_user}`}
              </div>
              <div className="mt-1">
                <span className="font-semibold text-slate-900">Created:</span>{" "}
                {order.created_at
                  ? new Date(order.created_at).toLocaleString("ja-JP")
                  : ""}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500">Total</div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatMoney(order.total_cents, order.currency)}
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <select
                value={selectedStatus}
                disabled={updating}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                onClick={handleUpdate}
                disabled={updating || !changed}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? "Updating..." : "Update"}
              </button>

              <button
                onClick={load}
                disabled={updating}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {changed && (
              <div className="mt-2 text-xs text-slate-500">
                Selected:{" "}
                <span className="font-semibold">{selectedStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6">
        <h2 className="text-lg font-bold text-slate-900">
          Items{" "}
          <span className="text-sm font-semibold text-slate-500">
            ({items.length})
          </span>
        </h2>

        <div className="mt-3 grid gap-3">
          {items.map((it, idx) => (
            <div
              key={`${order.id_order}-${it.id_product}-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-slate-900">
                    {it.product_name}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Qty: <span className="font-semibold">{it.quantity}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    Unit:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatMoney(it.price_cents, it.currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500">
                    Line total
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">
                    {formatMoney(it.price_cents * it.quantity, it.currency)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
              No items found for this order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
