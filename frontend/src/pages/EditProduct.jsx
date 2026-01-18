import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProductById, updateProduct } from "../services/productsService";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [currency, setCurrency] = useState("JPY");
  const [stock, setStock] = useState("0");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await getProductById(id);
        const p = res.data;

        setName(p.name || "");
        setDescription(p.description || "");
        setPriceCents(String(p.price_cents ?? ""));
        setCurrency(p.currency || "JPY");
        setStock(String(p.stock ?? 0));
        setImageUrl(p.image_url || "");
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      // Armamos payload solo con campos válidos (puede incluir null)
      const payload = {
        name: name.trim(),
        description: description.trim() === "" ? null : description.trim(),
        price_cents: Number(priceCents),
        currency: currency.trim().toUpperCase(),
        stock: Number(stock),
        image_url: imageUrl.trim() === "" ? null : imageUrl.trim(),
      };

      await updateProduct(id, payload);
      setOk("Product updated!");
      setTimeout(() => navigate(`/products/${id}`), 600);
    } catch (e) {
      setErr(e.message);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (err) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "crimson" }}>{err}</p>
        <Link to="/products">← Back</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 520 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Edit Product</h2>
        <Link to={`/products/${id}`}>View</Link>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {ok && <p style={{ color: "green" }}>{ok}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label>
          Price (cents)
          <input type="number" min="0" value={priceCents} onChange={(e) => setPriceCents(e.target.value)} />
        </label>

        <label>
          Currency
          <input maxLength={3} value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
        </label>

        <label>
          Stock
          <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        </label>

        <label>
          Image URL
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </label>

        <button type="submit">Save changes</button>
      </form>
    </div>
  );
}
