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
  }, [id]);

  if (loading) return <div>Loading order...</div>;

  if (error) {
    return (
      <div>
        <p style={{ color: "#b91c1c" }}>{error}</p>
        <Link to="/admin/orders">← Back to orders</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <p>Order not found.</p>
        <Link to="/admin/orders">← Back to orders</Link>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div style={{ maxWidth: 900 }}>
      <Link to="/admin/orders">← Back to orders</Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginTop: 10,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Order #{order.id_order}</h2>
          <div style={{ marginTop: 6, color: "#6b7280" }}>
            User: <strong>{order.email || `id_user: ${order.id_user}`}</strong>
          </div>
          <div style={{ marginTop: 6, color: "#6b7280" }}>
            Created:{" "}
            {order.created_at
              ? new Date(order.created_at).toLocaleString("ja-JP")
              : ""}
          </div>
          <div style={{ marginTop: 6, color: "#6b7280" }}>
            Status: <strong>{order.status}</strong>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#6b7280", fontSize: 13 }}>Total</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {formatMoney(order.total_cents, order.currency)}
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <select
              value={selectedStatus}
              disabled={updating}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button
              disabled={updating || selectedStatus === order.status}
              onClick={async () => {
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
              }}
            >
              {updating ? "Updating..." : "Update"}
            </button>

            <button onClick={load} disabled={updating}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && <div style={{ marginTop: 12, color: "#b91c1c" }}>{error}</div>}

      <hr style={{ margin: "16px 0" }} />

      <h3 style={{ marginTop: 0 }}>Items</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it, idx) => (
          <div
            key={`${order.id_order}-${it.id_product}-${idx}`}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{it.product_name}</div>
              <div style={{ color: "#6b7280", marginTop: 6 }}>
                Qty: <strong>{it.quantity}</strong>
              </div>
              <div style={{ color: "#6b7280", marginTop: 6 }}>
                Unit:{" "}
                <strong>{formatMoney(it.price_cents, it.currency)}</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#6b7280" }}>Line total</div>
              <div style={{ fontWeight: 700 }}>
                {formatMoney(it.price_cents * it.quantity, it.currency)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
