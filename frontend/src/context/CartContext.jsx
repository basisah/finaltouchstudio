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

  useEffect(() => {
    localStorage.setItem("ft_cart", JSON.stringify(cart));
  }, [cart]);

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

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
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
