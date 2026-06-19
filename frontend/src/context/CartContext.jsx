import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { isLoggedIn } from "../utils/auth";
import { mapServerRowToLine, mapLineToPostBody } from "../utils/cartMappers";
import {
  getCart,
  addCartLine,
  updateCartLine,
  removeCartLine,
  clearCart as clearServerCart,
} from "../api/bookings.api";

const CartContext = createContext();
const GUEST_CART_KEY = "ft_cart";

function readGuestCart() {
  try {
    const saved = localStorage.getItem(GUEST_CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => (isLoggedIn() ? [] : readGuestCart()));
  const [isSyncing, setIsSyncing] = useState(false);

  const [fulfillmentType, setFulfillmentType] = useState(() => {
    try {
      return localStorage.getItem("ft_fulfillment_type") || "pickup";
    } catch {
      return "pickup";
    }
  });

  const [postalCode, setPostalCode] = useState(() => {
    try {
      return localStorage.getItem("ft_postal_code") || "";
    } catch {
      return "";
    }
  });

  const syncCartFromServer = useCallback(async () => {
    if (!isLoggedIn()) return;
    setIsSyncing(true);
    try {
      const rows = await getCart();
      setCart(Array.isArray(rows) ? rows.map(mapServerRowToLine) : []);
    } catch (err) {
      console.error("Failed to sync cart from server:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncCartAfterLogin = useCallback(async () => {
    if (!isLoggedIn()) return;

    const guestCart = readGuestCart();
    setIsSyncing(true);
    try {
      for (const line of guestCart) {
        await addCartLine(mapLineToPostBody(line));
      }
      localStorage.removeItem(GUEST_CART_KEY);
      await syncCartFromServer();
    } catch (err) {
      console.error("Failed to merge guest cart:", err);
      await syncCartFromServer();
    } finally {
      setIsSyncing(false);
    }
  }, [syncCartFromServer]);

  useEffect(() => {
    if (isLoggedIn()) {
      syncCartFromServer();
    }
  }, [syncCartFromServer]);

  useEffect(() => {
    if (!isLoggedIn()) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ft_fulfillment_type", fulfillmentType);
  }, [fulfillmentType]);

  useEffect(() => {
    localStorage.setItem("ft_postal_code", postalCode);
  }, [postalCode]);

  const addToCart = async (item, pickupDate, returnDate, quantity) => {
    const newLine = {
      id: `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      item,
      pickupDate,
      returnDate,
      quantity: quantity || 1,
    };

    if (!isLoggedIn()) {
      setCart((prev) => [...prev, newLine]);
      return;
    }

    setCart((prev) => [...prev, newLine]);
    try {
      await addCartLine(mapLineToPostBody(newLine));
      await syncCartFromServer();
    } catch (err) {
      console.error("Failed to add to server cart:", err);
      setCart((prev) => prev.filter((c) => c.id !== newLine.id));
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!isLoggedIn()) {
      setCart((prev) => prev.filter((c) => c.id !== cartItemId));
      return;
    }

    const previous = cart;
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
    try {
      await removeCartLine(cartItemId);
    } catch (err) {
      console.error("Failed to remove cart line:", err);
      setCart(previous);
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn()) {
      setCart([]);
      return;
    }

    try {
      await clearServerCart();
      setCart([]);
    } catch (err) {
      console.error("Failed to clear server cart:", err);
    }
  };

  const updateQuantity = async (cartItemId, delta) => {
    const line = cart.find((c) => c.id === cartItemId);
    if (!line) return;

    const newQuantity = (line.quantity || 1) + delta;
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    if (!isLoggedIn()) {
      setCart((prev) =>
        prev.map((c) => (c.id === cartItemId ? { ...c, quantity: newQuantity } : c))
      );
      return;
    }

    const previous = cart;
    setCart((prev) =>
      prev.map((c) => (c.id === cartItemId ? { ...c, quantity: newQuantity } : c))
    );
    try {
      await updateCartLine(cartItemId, newQuantity);
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
      setCart(previous);
    }
  };

  const setCartItemQuantity = async (cartItemId, quantity) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (!isLoggedIn()) {
      setCart((prev) =>
        prev.map((c) => (c.id === cartItemId ? { ...c, quantity: qty } : c))
      );
      return;
    }

    const previous = cart;
    setCart((prev) =>
      prev.map((c) => (c.id === cartItemId ? { ...c, quantity: qty } : c))
    );
    try {
      await updateCartLine(cartItemId, qty);
    } catch (err) {
      console.error("Failed to set cart quantity:", err);
      setCart(previous);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isSyncing,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCartItemQuantity,
        clearCart,
        syncCartFromServer,
        syncCartAfterLogin,
        fulfillmentType,
        setFulfillmentType,
        postalCode,
        setPostalCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
