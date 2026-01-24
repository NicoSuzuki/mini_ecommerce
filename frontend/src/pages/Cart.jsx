import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { checkoutOrder } from "../services/ordersService";

function formatJPY(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

export default function Cart() {
  const { items, removeItem, setQty, clearCart, count, total_cents, currency } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const uniqueCurrencies = new Set(items.map((i) => i.currency));
    if (uniqueCurrencies.size > 1) {
      setError("Mixed currencies are not supported.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payloadItems = items.map((i) => ({
        id_product: i.id_product,
        qty: i.qty,
      }));

      const res = await checkoutOrder(payloadItems);
      const orderId = res?.data?.id_order;

      clearCart();

      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        navigate("/orders");
      }
    } catch (err) {
      setError(err.message || "Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>Cart</h2>

      {items.length === 0 ? (
        <>
          <p>Your cart is empty.</p>
          <Link to="/products">← Continue shopping</Link>
        </>
      ) : (
        <>
          {error && (
            <div style={{ marginBottom: 12, color: "#b91c1c" }}>{error}</div>
          )}
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item) => (
              <div
                key={item.id_product}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 12,
                  alignItems: "center",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ marginTop: 6 }}>
                    Price:{" "}
                    {item.currency === "JPY"
                      ? `¥${formatJPY(item.price_cents)}`
                      : `${item.price_cents} ${item.currency}`}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => setQty(item.id_product, e.target.value)}
                    style={{ width: 80 }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "flex-end",
                  }}
                >
                  <button
                    onClick={() => removeItem(item.id_product)}
                    disabled={submitting}
                  >
                    Remove
                  </button>
                  <div>
                    Subtotal:{" "}
                    {currency === "JPY"
                      ? `¥${formatJPY(item.price_cents * item.qty)}`
                      : `${item.price_cents * item.qty} ${item.currency}`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr style={{ margin: "16px 0" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div>
                <strong>Items:</strong> {count}
              </div>
              <div>
                <strong>Total:</strong>{" "}
                {currency === "JPY"
                  ? `¥${formatJPY(total_cents)}`
                  : `${total_cents} ${currency}`}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={clearCart} disabled={submitting}>
                Clear cart
              </button>
              <Link to="/products">Continue shopping</Link>
              <button onClick={handleCheckout} disabled={submitting}>
                {submitting ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
