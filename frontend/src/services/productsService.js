import { apiRequest } from "./apiClient";

export function getProducts({ limit, offset } = {}, options) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/products${qs}`, options);
}

export function getProductById(id) {
  return apiRequest(`/products/${id}`);
}

// Admin
export function createProduct(payload, options) {
  return apiRequest("/products", { method: "POST", body: payload, ...options });
}

export function updateProduct(id, payload, options) {
  return apiRequest(`/products/${id}`, {
    method: "PUT",
    body: payload,
    ...options,
  });
}

export function deleteProduct(id, options) {
  return apiRequest(`/products/${id}`, { method: "DELETE", ...options });
}

export function restoreProduct(id, options) {
  return apiRequest(`/products/${id}/restore`, { method: "PUT", ...options });
}

export function getDeletedProducts(options) {
  return apiRequest("/products/deleted", options);
}
