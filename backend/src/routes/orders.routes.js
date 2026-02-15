const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const ordersController = require("../controllers/orders.controller");
const { validateBody } = require("../middlewares/validate.middleware");
const { checkoutSchema } = require("../validators/orders.schemas");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  validateBody(checkoutSchema),
  ordersController.checkout,
);
router.get("/", authenticateToken, ordersController.getMyOrders);
router.get("/:id", authenticateToken, ordersController.getOrderById);

module.exports = router;
