const API_BASE = "/api/v1";

export async function apiRequest(
  path,
  { method = "GET", body, token, signal } = {},
) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const authToken = token || localStorage.getItem("token");
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error("Network error");
  }

  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      data?.error || data?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.path = path;
    error.data = data;
    throw error;
  }

  return data;
}
