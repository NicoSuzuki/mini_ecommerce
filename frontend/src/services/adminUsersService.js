import { apiRequest } from "./apiClient";

export function adminFetchUsers({ limit = 50, offset = 0 } = {}, options) {
  const qs = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  }).toString();
  return apiRequest(`/admin/users?${qs}`, options);
}

export function adminUpdateUser(id, body, options) {
  return apiRequest(`/admin/users/${id}`, {
    method: "PATCH",
    body,
    ...options,
  });
}
