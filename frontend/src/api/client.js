/**
 * api/client.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Base HTTP client.  All API modules import `get` / `post` / `put` / `del`
 * from here.  To switch from fetch → axios later, change only this file.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(method, path, body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  // 204 No Content — nothing to parse
  if (res.status === 204) return null;
  return res.json();
}

export const get  = (path)        => request("GET",    path);
export const post = (path, body)  => request("POST",   path, body);
export const put  = (path, body)  => request("PUT",    path, body);
export const del  = (path)        => request("DELETE", path);
