import { apiRequest } from "./apiClient";

export function register(payload) {
  // payload: { firstName, lastName, email, password }
  return apiRequest("/auth/register", { method: "POST", body: payload });
}

export function login(payload) {
  // payload: { email, password }
  return apiRequest("/auth/login", { method: "POST", body: payload });
}
