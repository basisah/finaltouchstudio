import { get, post } from "../client";

/** Login admin with username & password */
export const loginAdmin = (username, password) => post("/admin/auth/login", { username, password });

/** Verify admin session token */
export const verifyAdminToken = () => get("/admin/auth/verify");
