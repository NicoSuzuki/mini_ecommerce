const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const adminUsersController = require("../controllers/admin.users.controller");

router.use(authenticateToken, authorizeRole("admin"));

// GET /api/v1/admin/users
router.get("/", adminUsersController.list);

// PATCH /api/v1/admin/users/:id
router.patch("/:id", adminUsersController.update);

module.exports = router;
