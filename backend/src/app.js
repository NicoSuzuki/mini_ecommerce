const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const healthRoutes = require("./routes/health.routes");
const dbCheckRoutes = require("./routes/dbcheck.routes");
const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const ordersRoutes = require("./routes/orders.routes");
const adminOrdersRoutes = require("./routes/admin.orders.routes");
const adminUsersRoutes = require("./routes/admin.users.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/v1", healthRoutes);
app.use("/api/v1", dbCheckRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/orders", ordersRoutes);
app.use("/api/v1/admin/orders", adminOrdersRoutes);
app.use("/api/v1/admin/users", adminUsersRoutes);
app.use("/api/v1/upload", uploadRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next(err);
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
