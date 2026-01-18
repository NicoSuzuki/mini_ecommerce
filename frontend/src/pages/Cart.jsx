import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function formatJPY(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

export default function Cart() {
  const { items, removeItem, setQty, clearCart, count, total_cents, currency } = useCart();

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
                    {currency === "JPY"
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

                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                  <button onClick={() => removeItem(item.id_product)}>Remove</button>
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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div><strong>Items:</strong> {count}</div>
              <div>
                <strong>Total:</strong>{" "}
                {currency === "JPY" ? `¥${formatJPY(total_cents)}` : `${total_cents} ${currency}`}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={clearCart}>Clear cart</button>
              <Link to="/products">Continue shopping</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
