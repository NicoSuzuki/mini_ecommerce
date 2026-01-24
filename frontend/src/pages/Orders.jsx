import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../services/ordersService";

function formatJPY(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function formatMoney(amountCents, currency) {
  if (currency === "JPY") return `¥${formatJPY(amountCents)}`;
  return `${amountCents} ${currency}`;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const controllerRef = useRef(null);

  const loadOrders = async () => {
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
    loadOrders();
    return () => controllerRef.current?.abort();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading orders...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>My Orders</h2>
        <button onClick={loadOrders} style={{ height: 36 }}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ margin: "12px 0", color: "#b91c1c" }}>{error}</div>
      )}

      {orders.length === 0 ? (
        <div>
          <p>You have no orders yet.</p>
          <Link to="/products">Go to products</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
          {orders.map((order) => (
            <div
              key={order.id_order}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <strong>Order #{order.id_order}</strong>
                  <div style={{ marginTop: 4, fontSize: 14, color: "#555" }}>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString("ja-JP")
                      : ""}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600 }}>
                    {formatMoney(order.total_cents, order.currency)}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    Status: <strong>{order.status}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {(order.items || []).map((item, idx) => (
                  <div
                    key={`${order.id_order}-${item.id_product}-${idx}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      {item.product_name}{" "}
                      <span style={{ color: "#6b7280" }}>x{item.quantity}</span>
                    </div>

                    <div style={{ fontSize: 14 }}>
                      {formatMoney(
                        item.price_cents * item.quantity,
                        item.currency,
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <Link to={`/orders/${order.id_order}`}>View details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
