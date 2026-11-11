/**
 * Browser session helpers. Tokens and the cached profile live in localStorage;
 * every key is read and cleared here so no component touches the keys directly.
 */
const KEYS = {
  adminToken: "admin_token",
  adminLoginTime: "admin_login_time",
  userToken: "user_token",
  userLoginTime: "user_login_time",
  userInfo: "user_info",
};

export function getToken() {
  return localStorage.getItem(KEYS.adminToken) || localStorage.getItem(KEYS.userToken);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

/** The signed-in profile cached at login, or null. */
export function getStoredUser() {
  if (!isLoggedIn()) return null;
  try {
    return JSON.parse(localStorage.getItem(KEYS.userInfo)) || null;
  } catch {
    return null;
  }
}

/** Removes every session key (customer and admin). */
export function clearSession() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
