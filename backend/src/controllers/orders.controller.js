const pool = require("../../db/pool");

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Cart items are required" };
  }

  if (items.length > 50) return { error: "Too many items" };

  const map = new Map();

  for (const item of items) {
    const id = Number(item.id_product);
    const qty = Number(item.qty ?? item.quantity);

    if (!Number.isInteger(id) || id <= 0)
      return { error: "Invalid product id" };
    if (!Number.isInteger(qty) || qty <= 0)
      return { error: "Invalid quantity" };

    map.set(id, (map.get(id) || 0) + qty);
  }

  const normalized = Array.from(map, ([id_product, qty]) => ({
    id_product,
    qty,
  }));
  return { normalized };
}

exports.checkout = async (req, res) => {
  const { items } = req.body;
  const { error, normalized } = normalizeItems(items);

  if (error) {
    return res.status(400).json({ error });
  }

  const ids = [...new Set(normalized.map((item) => item.id_product))];

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [products] = await connection.query(
      `SELECT id_product, name, price_cents, currency, stock, is_active
       FROM products
       WHERE id_product IN (?)
       FOR UPDATE`,
      [ids],
    );

    if (products.length !== ids.length) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "One or more products do not exist" });
    }

    const productMap = new Map(
      products.map((product) => [product.id_product, product]),
    );

    let total_cents = 0;
    let currency = null;
    const orderItems = [];

    for (const item of normalized) {
      const product = productMap.get(item.id_product);

      if (!product || product.is_active === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Product is not available" });
      }

      if (product.stock < item.qty) {
        await connection.rollback();
        return res
          .status(409)
          .json({ error: `Insufficient stock for ${product.name}` });
      }

      if (!currency) {
        currency = product.currency;
      } else if (currency !== product.currency) {
        await connection.rollback();
        return res
          .status(400)
          .json({ error: "Mixed currencies are not supported" });
      }

      total_cents += product.price_cents * item.qty;
      orderItems.push([
        item.id_product,
        product.name,
        product.price_cents,
        product.currency,
        item.qty,
      ]);
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (id_user, total_cents, currency, status)
       VALUES (?, ?, ?, ?)`,
      [req.user.sub, total_cents, currency || "JPY", "pending"],
    );

    const orderId = orderResult.insertId;

    const orderItemsValues = orderItems.map((entry) => [orderId, ...entry]);

    await connection.query(
      `INSERT INTO order_items
       (id_order, id_product, product_name, price_cents, currency, quantity)
       VALUES ?`,
      [orderItemsValues],
    );

    for (const item of normalized) {
      const [u] = await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id_product = ? AND stock >= ?",
        [item.qty, item.id_product, item.qty],
      );

      if (u.affectedRows === 0) {
        await connection.rollback();
        return res.status(409).json({ error: "Insufficient stock" });
      }
    }

    await connection.commit();

    return res.status(201).json({
      message: "Order created successfully",
      data: {
        id_order: orderId,
        total_cents,
        currency: currency || "JPY",
        status: "pending",
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error("Checkout error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  } finally {
    connection.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT id_order, total_cents, currency, status, created_at
       FROM orders
       WHERE id_user = ?
       ORDER BY created_at DESC`,
      [req.user.sub],
    );

    if (orders.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const orderIds = orders.map((order) => order.id_order);
    const [items] = await pool.query(
      `SELECT id_order, id_product, product_name, price_cents, currency, quantity
       FROM order_items
       WHERE id_order IN (?)
       ORDER BY id_order, id_order_item`,
      [orderIds],
    );

    const itemsByOrder = items.reduce((acc, item) => {
      if (!acc[item.id_order]) acc[item.id_order] = [];
      acc[item.id_order].push({
        id_product: item.id_product,
        product_name: item.product_name,
        price_cents: item.price_cents,
        currency: item.currency,
        quantity: item.quantity,
      });
      return acc;
    }, {});

    const payload = orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id_order] || [],
    }));

    return res.status(200).json({ data: payload });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const [orders] = await pool.query(
      `SELECT id_order, id_user, total_cents, currency, status, created_at
       FROM orders
       WHERE id_order = ? AND id_user = ?
       LIMIT 1`,
      [orderId, req.user.sub],
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    const [items] = await pool.query(
      `SELECT id_order, id_product, product_name, price_cents, currency, quantity
       FROM order_items
       WHERE id_order = ?
       ORDER BY id_order_item`,
      [orderId],
    );

    return res.status(200).json({
      data: {
        ...order,
        items,
      },
    });
  } catch (err) {
    console.error("Get order by id error:", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
};
