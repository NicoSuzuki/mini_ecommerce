const pool = require("../../db/pool");

const ALLOWED_ROLES = ["customer", "admin"];

exports.list = async (req, res) => {
  try {
    const limit = req.query.limit
      ? Math.min(parseInt(req.query.limit, 10), 100)
      : 50;
    const offset = req.query.offset
      ? Math.max(parseInt(req.query.offset, 10), 0)
      : 0;

    const [rows] = await pool.query(
      `SELECT id_user, first_name, last_name, email, role, is_active, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error("Admin list users error:", err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.update = async (req, res) => {
  try {
    const id_user = parseInt(req.params.id, 10);
    if (!Number.isInteger(id_user) || id_user <= 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const { role, is_active } = req.body;

    const fields = [];
    const params = [];

    if (role !== undefined) {
      if (typeof role !== "string" || !ALLOWED_ROLES.includes(role)) {
        return res
          .status(400)
          .json({
            error: `Invalid role. Allowed: ${ALLOWED_ROLES.join(", ")}`,
          });
      }
      fields.push("role = ?");
      params.push(role);
    }

    if (is_active !== undefined) {
      const activeNum = Number(is_active);
      if (![0, 1].includes(activeNum)) {
        return res.status(400).json({ error: "is_active must be 0 or 1" });
      }
      fields.push("is_active = ?");
      params.push(activeNum);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided" });
    }

    if (req.user?.sub === id_user && is_active === 0) {
      return res
        .status(400)
        .json({ error: "You cannot disable your own account" });
    }

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id_user = ?`;
    params.push(id_user);

    const [result] = await pool.query(sql, params);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    const [rows] = await pool.query(
      `SELECT id_user, first_name, last_name, email, role, is_active, created_at
       FROM users
       WHERE id_user = ?
       LIMIT 1`,
      [id_user],
    );

    return res.status(200).json({ message: "User updated", data: rows[0] });
  } catch (err) {
    console.error("Admin update user error:", err);
    return res.status(500).json({ error: "Failed to update user" });
  }
};
