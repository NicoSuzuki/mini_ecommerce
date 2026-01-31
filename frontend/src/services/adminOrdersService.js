import { apiRequest } from "./apiClient";

export function adminFetchOrders({ limit = 50, offset = 0 } = {}, options) {
  const qs = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  }).toString();
  return apiRequest(`/admin/orders?${qs}`, options);
}

export function adminFetchOrderById(id, options) {
  return apiRequest(`/admin/orders/${id}`, options);
}

export function adminUpdateOrderStatus(id, status, options) {
  return apiRequest(`/admin/orders/${id}/status`, {
    method: "PUT",
    body: { status },
    ...options,
  });
}
