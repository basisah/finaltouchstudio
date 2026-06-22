export function isLoggedIn() {
  return Boolean(
    localStorage.getItem("user_token") || localStorage.getItem("admin_token")
  );
}
