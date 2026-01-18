import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

function loadCart() {
  const raw = localStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}

export function CartProvider({ children }) {
  // items: [{ id_product, name, price_cents, currency, qty, image_url }]
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id_product === product.id_product);
      if (existing) {
        return prev.map((x) =>
          x.id_product === product.id_product ? { ...x, qty: x.qty + qty } : x
        );
      }
      return [
        ...prev,
        {
          id_product: product.id_product,
          name: product.name,
          price_cents: product.price_cents,
          currency: product.currency,
          image_url: product.image_url || null,
          qty,
        },
      ];
    });
  };

  const removeItem = (id_product) => {
    setItems((prev) => prev.filter((x) => x.id_product !== id_product));
  };

  const setQty = (id_product, qty) => {
    const q = Number(qty);
    if (!Number.isInteger(q) || q <= 0) return;
    setItems((prev) =>
      prev.map((x) => (x.id_product === id_product ? { ...x, qty: q } : x))
    );
  };

  const clearCart = () => setItems([]);

  const count = items.reduce((sum, x) => sum + x.qty, 0);

  const total_cents = items.reduce((sum, x) => sum + x.price_cents * x.qty, 0);
  const currency = items[0]?.currency || "JPY";

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQty,
      clearCart,
      count,
      total_cents,
      currency,
    }),
    [items, count, total_cents, currency]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
