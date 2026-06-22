import { get, patch, post, put, del } from "./client";

/** Submit a legacy booking form */
export const submitBooking = (data) => post("/bookings", data);

/** Submit the contact-us form */
export const submitContact = (data) => post("/contact", data);

/** Fetch enquiries for admin inbox */
export const getEnquiries = () => get("/contact");

/** Mark all enquiries as read */
export const markAllEnquiriesRead = () => patch("/contact/read-all");

// ==========================================
// CART ENDPOINTS
// ==========================================

/** Fetch the customer's cached cart */
export const getCart = () => get("/cart");

/** Add a line to the cart */
export const addCartLine = (data) => post("/cart", data);

/** Update quantity on a cart line */
export const updateCartLine = (id, quantity) => put(`/cart/line/${id}`, { quantity });

/** Remove a cart line by row id */
export const removeCartLine = (id) => del(`/cart/line/${id}`);

/** @deprecated use addCartLine */
export const addToCart = (data) => post("/cart", data);

/** Remove single item from cart */
export const removeCartItem = (itemId) => del(`/cart/item/${itemId}`);

/** Remove single package bundle from cart */
export const removeCartPackage = (packageId) => del(`/cart/package/${packageId}`);

/** Clear all items in cart */
export const clearCart = () => del("/cart");

// ==========================================
// ORDER ENDPOINTS
// ==========================================

/** Checkout and submit reservation order */
export const submitOrder = (data) => post("/orders", data);

/** Fetch customer's own orders list */
export const getUserOrders = () => get("/orders");

/** Fetch detailed customer order information */
export const getUserOrderDetail = (id) => get(`/orders/${id}`);
