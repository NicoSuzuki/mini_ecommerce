const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const ordersController = require("../controllers/orders.controller");

const router = express.Router();

router.post("/", authenticateToken, ordersController.checkout);
router.get("/", authenticateToken, ordersController.getMyOrders);
router.get("/:id", authenticateToken, ordersController.getOrderById);

module.exports = router;
