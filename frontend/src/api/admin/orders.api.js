import { get, put } from "../client";

/** Fetch all customer orders/reservations */
export const getAdminOrders = () => get("/admin/orders");

/** Fetch detailed single order */
export const getAdminOrderDetails = (id) => get(`/admin/orders/${id}`);

/** Approve / confirm / cancel an order */
export const updateOrderStatus = (id, status) => put(`/admin/orders/${id}/status`, { status });
