import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminFetchOrders,
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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [limit] = useState(50);
  const [offset] = useState(0);

  const [selectedStatus, setSelectedStatus] = useState({});
  const [updating, setUpdating] = useState({});

  const controllerRef = useRef(null);

  const load = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setError("");
    setLoading(true);

    try {
      const res = await adminFetchOrders(
        { limit, offset, status: statusFilter },
        { signal: controller.signal },
      );
      const data = res?.data || [];
      setOrders(data);

      // init selected statuses from current orders
      const init = {};
      for (const o of data) init[o.id_order] = o.status;
      setSelectedStatus(init);
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
  }, [statusFilter]);

  const rows = useMemo(() => orders, [orders]);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Orders
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review orders and update status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="all">all</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

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

      {/* Table */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-600"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-600"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                rows.map((o) => {
                  const next = selectedStatus[o.id_order] ?? o.status;
                  const busy = !!updating[o.id_order];
                  const changed = next !== o.status;

                  return (
                    <tr key={o.id_order} className="border-b border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-900">
                          #{o.id_order}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-900">
                          {o.email || `user_id: ${o.id_user}`}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-600">
                          {o.created_at
                            ? new Date(o.created_at).toLocaleString("ja-JP")
                            : ""}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-900">
                          {formatMoney(o.total_cents, o.currency)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={statusBadge(o.status)}>
                          {o.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={next}
                            disabled={busy}
                            onChange={(e) =>
                              setSelectedStatus((prev) => ({
                                ...prev,
                                [o.id_order]: e.target.value,
                              }))
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          <button
                            disabled={busy || !changed}
                            onClick={async () => {
                              setError("");
                              setUpdating((p) => ({
                                ...p,
                                [o.id_order]: true,
                              }));
                              try {
                                await adminUpdateOrderStatus(o.id_order, next);
                                await load();
                              } catch (err) {
                                setError(
                                  err?.message || "Failed to update status",
                                );
                              } finally {
                                setUpdating((p) => ({
                                  ...p,
                                  [o.id_order]: false,
                                }));
                              }
                            }}
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busy ? "Updating..." : "Update"}
                          </button>

                          <Link
                            to={`/admin/orders/${o.id_order}`}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                          >
                            View
                          </Link>
                        </div>

                        {changed && (
                          <div className="mt-2 text-xs text-slate-500">
                            Selected:{" "}
                            <span className="font-semibold">{next}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>Showing up to {limit} orders.</div>
        </div>
      </div>
    </div>
  );
}
