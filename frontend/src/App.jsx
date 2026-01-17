import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";
import AdminRoute from "./components/AdminRoute";


export default function App() {

  const { user } = useAuth();

  return (
    <div>
      <nav style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", gap: 12 }}>
        <Link to="/products">Products</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        {user?.role === "admin" && <Link to="/admin/products/new">New Product</Link>}
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin/products/new"
          element={
            <AdminRoute>
              <CreateProduct />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}
