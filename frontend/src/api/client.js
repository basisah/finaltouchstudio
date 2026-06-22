let BASE_URL = import.meta.env.VITE_API_URL || '/api';
if (BASE_URL.startsWith('http') && !BASE_URL.endsWith('/api')) {
  BASE_URL = `${BASE_URL}/api`;
}

/** Base URL for API routes, e.g. `/api` or `https://example.com/api`. */
export function getApiBaseUrl() {
  return BASE_URL;
}

/** Origin for static uploads, e.g. `/uploads` on local or full URL in production. */
export function getUploadsBaseUrl() {
  if (BASE_URL.startsWith('http')) {
    return BASE_URL.replace(/\/api$/, '');
  }
  return '';
}

async function request(method, path, body) {
  const token =
    localStorage.getItem('user_token') || localStorage.getItem('admin_token');
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const get = (path) => request('GET', path);
export const post = (path, body) => request('POST', path, body);
export const put = (path, body) => request('PUT', path, body);
export const patch = (path, body) => request('PATCH', path, body);
export const del = (path) => request('DELETE', path);
