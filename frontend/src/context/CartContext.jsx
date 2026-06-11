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
    // Add item to cart with booking dates and quantity
    setCart((prev) => {
      // Check if item is already added for these exact dates
      const exists = prev.some((c) => 
        c.item.id === item.id && 
        c.pickupDate?.getTime() === pickupDate?.getTime() && 
        c.returnDate?.getTime() === returnDate?.getTime()
      );
      if (exists) return prev;
      return [...prev, { id: `${item.id}-${Date.now()}`, item, pickupDate, returnDate, quantity }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) => prev.map((c) => {
      if (c.id === cartItemId) {
        const newQuantity = Math.max(1, (c.quantity || 1) + delta);
        return { ...c, quantity: newQuantity };
      }
      return c;
    }));
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
