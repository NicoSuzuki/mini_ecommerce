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

export function updateProduct(id, payload) {
  return apiRequest(`/products/${id}`, { method: "PUT", body: payload });
}

export function deleteProduct(id) {
  return apiRequest(`/products/${id}`, { method: "DELETE" });
}

export function restoreProduct(id) {
  return apiRequest(`/products/${id}/restore`, { method: "PUT" });
}

export function getDeletedProducts() {
  return apiRequest("/products/deleted");
}