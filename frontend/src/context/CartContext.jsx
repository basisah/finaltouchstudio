import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("ft_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  useEffect(() => {
    localStorage.setItem("ft_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ft_fulfillment_type", fulfillmentType);
  }, [fulfillmentType]);

  useEffect(() => {
    localStorage.setItem("ft_postal_code", postalCode);
  }, [postalCode]);

  const addToCart = (item, pickupDate, returnDate, quantity) => {
    setCart((prev) => [
      ...prev,
      {
        id: `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        item,
        pickupDate,
        returnDate,
        quantity: quantity || 1,
      },
    ]);
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === cartItemId) {
            const newQuantity = (c.quantity || 1) + delta;
            if (newQuantity <= 0) {
              return null;
            }
            return { ...c, quantity: newQuantity };
          }
          return c;
        })
        .filter(Boolean)
    );
  };

  const setCartItemQuantity = (cartItemId, quantity) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setCart((prev) =>
      prev.map((c) => (c.id === cartItemId ? { ...c, quantity: qty } : c))
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCartItemQuantity,
        clearCart,
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
