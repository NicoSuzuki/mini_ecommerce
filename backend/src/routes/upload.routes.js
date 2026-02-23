const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");

router.post(
  "/product-image",
  authenticateToken,
  authorizeRole("admin"),
  upload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({ data: { image_url: imageUrl } });
  },
);

module.exports = router;
