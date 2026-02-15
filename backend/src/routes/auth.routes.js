const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const {
  loginLimiter,
  registerLimiter,
} = require("../middlewares/rateLimit.middleware");
const { validateBody } = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.schemas");

// POST /api/v1/auth/register
router.post(
  "/register",
  registerLimiter,
  validateBody(registerSchema),
  authController.register,
);

// POST /api/v1/auth/login
router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  authController.login,
);

module.exports = router;
