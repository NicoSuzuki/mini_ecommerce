const API_BASE = "/api/v1";

export async function uploadProductImage(file) {
  const token = localStorage.getItem("token");
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${API_BASE}/upload/product-image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "Upload failed");
  return data; // { data: { image_url } }
}
