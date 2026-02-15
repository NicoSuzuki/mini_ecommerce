const express = require("express");
const { authenticateToken } = require("../middlewares/auth.middleware");
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
router.post("/:id/cancel", authenticateToken, ordersController.cancelMyOrder);

router.get("/", authenticateToken, ordersController.getMyOrders);
router.get("/:id", authenticateToken, ordersController.getOrderById);

module.exports = router;
