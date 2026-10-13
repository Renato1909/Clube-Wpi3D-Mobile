import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  CartItem,
  addCartItem,
  cartTotalCents,
  removeCartItem,
  normalizeCart,
  normalizeQuantity,
} from "../lib/cart";

const KEY = "@clube-wpi3d/cart";

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  totalCents: number | null;
};

const C = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY).then((value) => {
      if (!active) return;
      if (!value) return;
      try {
        setItems(normalizeCart(JSON.parse(value)));
      } catch {
        // Ignore invalid persisted cart data.
      }
    }).catch(() => undefined).finally(() => {
      if (active) setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => undefined);
  }, [items, hydrated]);

  const value = useMemo(
    () => ({
      items,
      add: (item: Omit<CartItem, "quantity">, quantity = 1) =>
        setItems((current) => addCartItem(current, item, quantity)),
      remove: (slug: string) =>
        setItems((current) => removeCartItem(current, slug)),
      setQuantity: (slug: string, quantity: number) =>
        setItems((current) =>
          current.map((item) =>
            item.slug === slug
              ? { ...item, quantity: normalizeQuantity(quantity) }
              : item,
          ),
        ),
      clear: () => setItems([]),
      totalCents: cartTotalCents(items),
    }),
    [items],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useCart() {
  const value = useContext(C);
  if (!value) throw new Error("useCart fora do CartProvider");
  return value;
}

