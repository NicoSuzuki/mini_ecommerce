import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrderById, updateOrderStatus } from "../services/ordersService";
import { useAuth } from "../context/AuthContext";

function formatJPY(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function formatMoney(amountCents, currency) {
  if (currency === "JPY") return `¥${formatJPY(amountCents)}`;
  return `${amountCents} ${currency}`;
}

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusError, setStatusError] = useState("");

  const controllerRef = useRef(null);

  const load = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setError("");
    setLoading(true);

    try {
      const res = await fetchOrderById(id, { signal: controller.signal });
      const fetched = res?.data || null;
      setOrder(fetched);
      setSelectedStatus(fetched?.status || "");
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

  if (loading) return <div style={{ padding: 20 }}>Loading order...</div>;

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "#b91c1c" }}>{error}</p>
        <Link to="/orders">← Back to orders</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 20 }}>
        <p>Order not found.</p>
        <Link to="/orders">← Back to orders</Link>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Link to="/orders">← Back to orders</Link>
          <h2 style={{ margin: "10px 0 0" }}>Order #{order.id_order}</h2>
          <div style={{ marginTop: 4, fontSize: 14, color: "#555" }}>
            {order.created_at
              ? new Date(order.created_at).toLocaleString("ja-JP")
              : ""}
          </div>
          <div style={{ marginTop: 4, color: "#6b7280" }}>
            Status: <strong>{order.status}</strong>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Total</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {formatMoney(order.total_cents, order.currency)}
          </div>
          <button
            onClick={load}
            disabled={statusUpdating}
            style={{ marginTop: 10, height: 34 }}
          >
            Refresh
          </button>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h3 style={{ margin: "0 0 10px" }}>Items</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, idx) => (
          <div
            key={`${order.id_order}-${item.id_product}-${idx}`}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <strong>{item.product_name}</strong>
              <div style={{ color: "#6b7280", marginTop: 4 }}>
                Qty: {item.quantity}
              </div>
              <div style={{ color: "#6b7280", marginTop: 4 }}>
                Unit: {formatMoney(item.price_cents, item.currency)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#6b7280" }}>Line total</div>
              <div style={{ fontWeight: 600 }}>
                {formatMoney(item.price_cents * item.quantity, item.currency)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
