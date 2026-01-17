import { apiRequest } from "./apiClient";

export function getProducts({ limit, offset } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/products${qs}`);
}

export function getProductById(id) {
  return apiRequest(`/products/${id}`);
}

// Admin 
export function createProduct(payload) {
  return apiRequest("/products", { method: "POST", body: payload });
}
