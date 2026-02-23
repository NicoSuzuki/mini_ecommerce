import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/productsService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { deleteProduct } from "../services/productsService";
import { useNavigate } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await getProductById(id);
        setProduct(res.data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (err) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "crimson" }}>{err}</p>
        <Link to="/products">← Back to products</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 20 }}>
        <p>Product not found.</p>
        <Link to="/products">← Back to products</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <Link to="/products">← Back to products</Link>

      <h2 style={{ marginTop: 12 }}>{product.name}</h2>

      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />
      )}

      <p style={{ marginTop: 12 }}>{product.description || "No description"}</p>

      <div style={{ marginTop: 12 }}>
        <div>
          <strong>Price:</strong> {product.price_cents} {product.currency}
        </div>
        <div>
          <strong>Stock:</strong> {product.stock}
        </div>
      </div>
      <button
        onClick={() => addItem(product, 1)}
        disabled={product.stock === 0}
        style={{ marginTop: 12 }}
      >
        {product.stock === 0 ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
}
