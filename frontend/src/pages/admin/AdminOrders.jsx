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
  }, [statusFilter]);

  const rows = useMemo(() => orders, [orders]);

  if (loading)
    return <div style={{ padding: 20 }}>Loading admin orders...</div>;

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
        <h2 style={{ margin: 0 }}>Orders</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">all</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button onClick={load}>Refresh</button>
        </div>
      </div>

      {error && <div style={{ marginTop: 12, color: "#b91c1c" }}>{error}</div>}

      {rows.length === 0 ? (
        <p style={{ marginTop: 12 }}>No orders found.</p>
      ) : (
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 10 }}>Order</th>
                <th style={{ padding: 10 }}>User</th>
                <th style={{ padding: 10 }}>Created</th>
                <th style={{ padding: 10 }}>Total</th>
                <th style={{ padding: 10 }}>Status</th>
                <th style={{ padding: 10 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((o) => (
                <tr
                  key={o.id_order}
                  style={{ borderBottom: "1px solid #f1f1f1" }}
                >
                  <td style={{ padding: 10 }}>
                    <strong>#{o.id_order}</strong>
                  </td>

                  <td style={{ padding: 10 }}>
                    <div style={{ fontSize: 14 }}>
                      {o.email || `user_id: ${o.id_user}`}
                    </div>
                  </td>

                  <td style={{ padding: 10, color: "#6b7280", fontSize: 13 }}>
                    {o.created_at
                      ? new Date(o.created_at).toLocaleString("ja-JP")
                      : ""}
                  </td>

                  <td style={{ padding: 10, fontWeight: 600 }}>
                    {formatMoney(o.total_cents, o.currency)}
                  </td>

                  <td style={{ padding: 10 }}>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <select
                        value={selectedStatus[o.id_order] ?? o.status}
                        disabled={!!updating[o.id_order]}
                        onChange={(e) =>
                          setSelectedStatus((prev) => ({
                            ...prev,
                            [o.id_order]: e.target.value,
                          }))
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        disabled={
                          !!updating[o.id_order] ||
                          (selectedStatus[o.id_order] ?? o.status) === o.status
                        }
                        onClick={async () => {
                          const nextStatus =
                            selectedStatus[o.id_order] ?? o.status;
                          setUpdating((prev) => ({
                            ...prev,
                            [o.id_order]: true,
                          }));
                          setError("");

                          try {
                            await adminUpdateOrderStatus(
                              o.id_order,
                              nextStatus,
                            );
                            await load();
                          } catch (err) {
                            setError(err?.message || "Failed to update status");
                          } finally {
                            setUpdating((prev) => ({
                              ...prev,
                              [o.id_order]: false,
                            }));
                          }
                        }}
                      >
                        {updating[o.id_order] ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </td>

                  <td style={{ padding: 10 }}>
                    <Link to={`/admin/orders/${o.id_order}`}>View</Link>
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
