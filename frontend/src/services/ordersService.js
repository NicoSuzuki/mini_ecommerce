import { apiRequest } from "./apiClient";

export function checkoutOrder(items) {
  return apiRequest("/orders", {
    method: "POST",
    body: { items },
  });
}

export function fetchMyOrders(options) {
  return apiRequest("/orders", options);
}

export function fetchOrderById(id, options) {
  return apiRequest(`/orders/${id}`, options);
}

export function updateOrderStatus(id, status, options) {
  return apiRequest(`/orders/${id}/status`, {
    method: "PUT",
    body: { status },
    ...options,
  });
}

export function cancelMyOrder(id_order, options) {
  return apiRequest(`/orders/${id_order}/cancel`, {
    method: "POST",
    ...options,
  });
}
