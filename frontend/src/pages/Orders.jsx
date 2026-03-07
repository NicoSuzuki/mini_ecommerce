import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../services/ordersService";

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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const controllerRef = useRef(null);

  const load = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setError("");
    setLoading(true);
    try {
      const res = await fetchMyOrders({ signal: controller.signal });
      setOrders(res?.data || []);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-44 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="mt-3 h-4 w-28 animate-pulse rounded bg-slate-100" />
                <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            View your order history and details.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700">You have no orders yet.</p>
          <Link
            to="/products"
            className="mt-3 inline-block text-sm font-semibold text-slate-900 underline underline-offset-4"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id_order}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Order #{order.id_order}
                    </h2>
                    <span className={statusBadge(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-slate-600">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString("ja-JP")
                      : ""}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500">
                    Total
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    {formatMoney(order.total_cents, order.currency)}
                  </div>
                </div>
              </div>

              {/* Items preview */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-600">
                  Items ({(order.items || []).length})
                </div>

                <div className="mt-3 grid gap-2">
                  {(order.items || []).slice(0, 4).map((item, idx) => (
                    <div
                      key={`${order.id_order}-${item.id_product}-${idx}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0">
                        <span className="truncate font-semibold text-slate-900">
                          {item.product_name}
                        </span>{" "}
                        <span className="text-slate-500">x{item.quantity}</span>
                      </div>

                      <div className="font-semibold text-slate-900">
                        {formatMoney(
                          item.price_cents * item.quantity,
                          item.currency,
                        )}
                      </div>
                    </div>
                  ))}

                  {(order.items || []).length > 4 && (
                    <div className="text-xs text-slate-500">
                      +{order.items.length - 4} more items
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <Link
                  to={`/orders/${order.id_order}`}
                  className="text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700"
                >
                  View details →
                </Link>

                <div className="text-xs text-slate-500">
                  Status updates reflect your latest order state.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
