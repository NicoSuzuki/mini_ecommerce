import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cancelMyOrder, fetchOrderById } from "../services/ordersService";

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

export default function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const controllerRef = useRef(null);

  const load = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setError("");
    setLoading(true);

    try {
      const res = await fetchOrderById(id, { signal: controller.signal });
      setOrder(res?.data || null);
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

  const handleCancel = async () => {
    if (!order) return;

    const ok = window.confirm(
      `Cancel Order #${order.id_order}? This will restock items.`,
    );
    if (!ok) return;

    setCancelError("");
    setCancelLoading(true);
    try {
      await cancelMyOrder(order.id_order);
      await load();
    } catch (err) {
      setCancelError(err?.message || "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="h-4 w-52 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-40 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
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
            to="/orders"
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
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700">Order not found.</p>
          <Link
            to="/orders"
            className="mt-3 inline-block text-sm font-semibold text-slate-900 underline underline-offset-4"
          >
            ← Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const canCancel = order.status === "pending";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4">
        <Link
          to="/orders"
          className="text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          ← Back to orders
        </Link>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Order #{order.id_order}
              </h1>
              <span className={statusBadge(order.status)}>{order.status}</span>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              {order.created_at
                ? new Date(order.created_at).toLocaleString("ja-JP")
                : ""}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500">Total</div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatMoney(order.total_cents, order.currency)}
            </div>

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                onClick={load}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Refresh
              </button>

              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelLoading ? "Cancelling..." : "Cancel order"}
                </button>
              )}
            </div>

            {cancelError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {cancelError}
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
          {items.map((item, idx) => (
            <div
              key={`${order.id_order}-${item.id_product}-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-slate-900">
                    {item.product_name}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Qty: <span className="font-semibold">{item.quantity}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    Unit:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatMoney(item.price_cents, item.currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500">
                    Line total
                  </div>
                  <div className="text-lg font-extrabold text-slate-900">
                    {formatMoney(
                      item.price_cents * item.quantity,
                      item.currency,
                    )}
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

      {/* Footer */}
      <div className="mt-6 text-xs text-slate-500">
        Status updates reflect your latest order state.
      </div>
    </div>
  );
}
