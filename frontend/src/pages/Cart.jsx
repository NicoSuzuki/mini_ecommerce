import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { checkoutOrder } from "../services/ordersService";

function formatJPY(value) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function formatMoney(amountCents, currency) {
  if (currency === "JPY") return `¥${formatJPY(amountCents)}`;
  return `${amountCents} ${currency}`;
}

export default function Cart() {
  const { items, removeItem, setQty, clearCart, count, total_cents, currency } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  console.log(items);

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
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Cart</h1>
        <Link
          to="/products"
          className="text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          ← Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700">Your cart is empty.</p>
          <Link
            to="/products"
            className="mt-3 inline-block text-sm font-semibold text-slate-900 underline underline-offset-4"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-3">
            {items.map((item) => (
              <div
                key={item.id_product}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Product info */}
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Unit price:{" "}
                          <span className="font-medium text-slate-900">
                            {formatMoney(item.price_cents, item.currency)}
                          </span>
                        </p>
                      </div>

                      {/* Optional image */}
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-14 w-14 flex-none rounded-lg border border-slate-200 object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Right: Qty + Subtotal + Actions */}
                  <div className="flex flex-col gap-3 sm:items-end">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-slate-600">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          setQty(item.id_product, e.target.value)
                        }
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="text-sm text-slate-600">
                      Subtotal:{" "}
                      <span className="font-semibold text-slate-900">
                        {formatMoney(
                          item.price_cents * item.qty,
                          item.currency,
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.id_product)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900">Items:</span>{" "}
                  {count}
                </div>
                <div className="mt-1">
                  <span className="font-semibold text-slate-900">Total:</span>{" "}
                  <span className="text-base font-bold text-slate-900">
                    {formatMoney(total_cents, currency)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  onClick={clearCart}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-white text-slate-900 hover:bg-slate-50"
                >
                  Clear cart
                </button>

                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Continue shopping
                </Link>

                <button
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Processing..." : "Checkout"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
