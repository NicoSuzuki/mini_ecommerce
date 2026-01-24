import { useState } from "react";
import { createProduct } from "../services/productsService";
import { useNavigate } from "react-router-dom";

export default function CreateProduct() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [currency, setCurrency] = useState("JPY");
  const [stock, setStock] = useState("0");
  const [imageUrl, setImageUrl] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      const payload = {
        name,
        description: description.trim() === "" ? null : description,
        price_cents: Number(priceCents),
        currency,
        stock: Number(stock),
        image_url: imageUrl.trim() === "" ? null : imageUrl.trim(),
      };

      const res = await createProduct(payload);
      setOk("Product created!");
      setTimeout(() => navigate("/products"), 600);
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 520 }}>
      <h2>Create Product</h2>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {ok && <p style={{ color: "green" }}>{ok}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mate clásico"
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional..."
          />
        </label>

        <label>
          Price (cents)
          <input
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            type="number"
            min="0"
            placeholder="2500"
          />
        </label>

        <label>
          Currency
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            maxLength={3}
          />
        </label>

        <label>
          Stock
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            type="number"
            min="0"
          />
        </label>

        <label>
          Image URL
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>

        <button type="submit">Create</button>
      </form>
    </div>
  );
}
