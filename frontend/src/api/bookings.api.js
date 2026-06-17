import { get, post, del } from "./client";

/** Submit a legacy booking form */
export const submitBooking = (data) => post("/bookings", data);

/** Submit the contact-us form */
export const submitContact = (data) => post("/contact", data);

// ==========================================
// CART ENDPOINTS
// ==========================================

/** Fetch the customer's cached cart */
export const getCart = () => get("/cart");

/** Add/update an item or package in the cart */
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
