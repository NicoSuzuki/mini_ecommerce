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
