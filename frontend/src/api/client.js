import { getToken } from "../utils/session";

let BASE_URL = import.meta.env.VITE_API_URL || "/api";
if (BASE_URL.startsWith("http") && !BASE_URL.endsWith("/api")) {
  BASE_URL = `${BASE_URL}/api`;
}

export const API_BASE_URL = BASE_URL;

async function request(method, path, body) {
  const token = getToken();
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    // The API reports failures as { error: "…" }.
    const payload = await res.json().catch(() => ({}));
    const error = new Error(payload.error || payload.message || res.statusText || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const get = (path) => request("GET", path);
export const post = (path, body) => request("POST", path, body);
export const put = (path, body) => request("PUT", path, body);
export const del = (path) => request("DELETE", path);
