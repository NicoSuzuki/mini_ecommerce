const pool = require("../../db/pool");

const TRANSITIONS = {
  pending: new Set(["paid", "cancelled"]),
  paid: new Set([]),
  cancelled: new Set([]),
};

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
  const orderId = Number(req.params.id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  const { status: nextStatus } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderRows] = await conn.query(
      `SELECT id_order, status
       FROM orders
       WHERE id_order = ?
       FOR UPDATE`,
      [orderId],
    );

    if (orderRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    const currentStatus = orderRows[0].status;

    if (currentStatus === nextStatus) {
      await conn.commit();
      return res.status(200).json({
        message: "Status unchanged",
        data: { id_order: orderId, status: currentStatus },
      });
    }

    const allowedNext = TRANSITIONS[currentStatus];
    if (!allowedNext || !allowedNext.has(nextStatus)) {
      await conn.rollback();
      return res.status(409).json({
        error: `Invalid status transition: ${currentStatus} -> ${nextStatus}`,
      });
    }

    // If cancelling: restock items
    if (currentStatus === "pending" && nextStatus === "cancelled") {
      const [items] = await conn.query(
        `SELECT id_product, quantity
         FROM order_items
         WHERE id_order = ?`,
        [orderId],
      );

      if (items.length === 0) {
        await conn.rollback();
        return res.status(400).json({ error: "Order has no items" });
      }

      // lock involved products
      const ids = [...new Set(items.map((i) => i.id_product))];
      await conn.query(
        `SELECT id_product
         FROM products
         WHERE id_product IN (?)
         FOR UPDATE`,
        [ids],
      );

      // restock
      for (const it of items) {
        const qty = Number(it.quantity);
        await conn.query(
          `UPDATE products
           SET stock = stock + ?
           WHERE id_product = ?`,
          [qty, it.id_product],
        );
      }
    }

    // Update status
    await conn.query(
      `UPDATE orders
       SET status = ?, updated_at = NOW()
       WHERE id_order = ?`,
      [nextStatus, orderId],
    );

    await conn.commit();

    return res.status(200).json({
      message: "Status updated",
      data: { id_order: orderId, status: nextStatus },
    });
  } catch (err) {
    await conn.rollback();
    console.error("Admin update status error:", err);
    return res.status(500).json({ error: "Failed to update status" });
  } finally {
    conn.release();
  }
};
