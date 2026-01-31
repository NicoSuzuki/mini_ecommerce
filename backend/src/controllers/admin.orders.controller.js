const pool = require("../../db/pool");

const ALLOWED = ["pending", "paid", "cancelled"];

exports.list = async (req, res) => {
  try {
    const limit = req.query.limit
      ? Math.min(parseInt(req.query.limit, 10), 100)
      : 50;
    const offset = req.query.offset
      ? Math.max(parseInt(req.query.offset, 10), 0)
      : 0;

    const [orders] = await pool.query(
      `SELECT o.id_order, o.id_user, u.email, o.total_cents, o.currency, o.status, o.created_at
       FROM orders o
       JOIN users u ON u.id_user = o.id_user
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return res.status(200).json({ data: orders });
  } catch (err) {
    console.error("Admin list orders error:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.getById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const [orders] = await pool.query(
      `SELECT o.id_order, o.id_user, u.email, o.total_cents, o.currency, o.status, o.created_at
       FROM orders o
       JOIN users u ON u.id_user = o.id_user
       WHERE o.id_order = ?
       LIMIT 1`,
      [orderId],
    );

    if (orders.length === 0)
      return res.status(404).json({ error: "Order not found" });

    const [items] = await pool.query(
      `SELECT id_product, product_name, price_cents, currency, quantity
       FROM order_items
       WHERE id_order = ?
       ORDER BY id_order_item`,
      [orderId],
    );

    return res.status(200).json({ data: { ...orders[0], items } });
  } catch (err) {
    console.error("Admin get order error:", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const { status } = req.body;
    if (!ALLOWED.includes(status)) {
      return res
        .status(400)
        .json({ error: `Invalid status. Allowed: ${ALLOWED.join(", ")}` });
    }

    const [result] = await pool.query(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id_order = ?`,
      [status, orderId],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Order not found" });

    return res
      .status(200)
      .json({ message: "Status updated", data: { id_order: orderId, status } });
  } catch (err) {
    console.error("Admin update status error:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
};
