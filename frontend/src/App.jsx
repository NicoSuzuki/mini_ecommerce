import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";
import AdminRoute from "./components/AdminRoute";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import { useCart } from "./context/CartContext";
import EditProduct from "./pages/EditProduct";
import DeletedProducts from "./pages/DeletedProducts";


export default function App() {

  const { user } = useAuth();
  const { count } = useCart();


  return (
    <div>
      <nav style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", gap: 12 }}>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart ({count})</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        {user?.role === "admin" && <Link to="/admin/products/new">New Product</Link>}
        {user?.role === "admin" && <Link to="/admin/products/deleted">Trash</Link>}
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route
          path="/admin/products/:id/edit"
          element={
            <AdminRoute>
              <EditProduct />
            </AdminRoute>
          }
        />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
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
        <Route
          path="/admin/products/deleted"
          element={
            <AdminRoute>
              <DeletedProducts />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}
