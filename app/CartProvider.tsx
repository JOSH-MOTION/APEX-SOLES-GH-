"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { TradeCartItem } from "@/types";

interface CartContextValue {
  items: TradeCartItem[];
  isOpen: boolean;
  addTrade: (item: TradeCartItem) => void;
  removeTrade: (saleId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "apex_trade_cart";

// A matched trade (Buy Now / accepted offer) needs to survive navigating from
// the product page (where it's created) to wherever the shopper checks out
// from via the Navbar's cart icon — every page renders its own Navbar
// instance, so this has to be real shared state, not page-local useState.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<TradeCartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addTrade = useCallback((item: TradeCartItem) => {
    setItems((prev) => (prev.some((i) => i.saleId === item.saleId) ? prev : [...prev, item]));
    setIsOpen(true);
  }, []);

  const removeTrade = useCallback((saleId: string) => {
    setItems((prev) => prev.filter((i) => i.saleId !== saleId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addTrade,
        removeTrade,
        clearCart,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
