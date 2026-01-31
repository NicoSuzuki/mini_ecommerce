const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const adminOrdersController = require("../controllers/admin.orders.controller");

router.use(authenticateToken, authorizeRole("admin"));

// GET /api/v1/admin/orders
router.get("/", adminOrdersController.list);

// GET /api/v1/admin/orders/:id
router.get("/:id", adminOrdersController.getById);

// PUT /api/v1/admin/orders/:id/status
router.put("/:id/status", adminOrdersController.updateStatus);

module.exports = router;
