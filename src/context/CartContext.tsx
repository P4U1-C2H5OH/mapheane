import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork } from '../data/artworks';

// Minimal edition snapshot stored in cart — avoids refetching on page reload
export interface CartItemEdition {
  id: string;
  title: string;
  size: string;
  paper: string;
  type: string;
  price: { eur: number; zar: number };
}

export interface CartItem {
  artwork: Artwork;
  quantity: number;
  edition?: CartItemEdition; // undefined = original artwork
}

// Stable unique key for a cart item (artwork + edition combo)
export function cartItemKey(item: Pick<CartItem, 'artwork' | 'edition'>): string {
  return `${item.artwork.id}::${item.edition?.id ?? 'original'}`;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (artwork: Artwork, edition?: CartItemEdition) => void;
  removeFromCart: (artworkId: string, editionId?: string) => void;
  updateQuantity: (artworkId: string, quantity: number, editionId?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// v2 key — automatically discards pre-UUID (numeric id) cart data from old builds
const CART_KEY = 'mapheane-cart-v2';

function isSameSlot(item: CartItem, artworkId: string, editionId?: string): boolean {
  return item.artwork.id === artworkId && (item.edition?.id ?? undefined) === editionId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Discard items with numeric ids (pre-UUID data) to prevent render crashes
      return parsed.filter(
        (item: any) => item?.artwork && typeof item.artwork.id === 'string' && typeof item.quantity === 'number'
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch {
      // Storage quota exceeded — silently ignore
    }
  }, [cartItems]);

  const addToCart = (artwork: Artwork, edition?: CartItemEdition) => {
    setCartItems(prev => {
      const existing = prev.find(item => isSameSlot(item, artwork.id, edition?.id));
      if (existing) {
        return prev.map(item =>
          isSameSlot(item, artwork.id, edition?.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { artwork, quantity: 1, edition }];
    });
  };

  const removeFromCart = (artworkId: string, editionId?: string) => {
    setCartItems(prev => prev.filter(item => !isSameSlot(item, artworkId, editionId)));
  };

  const updateQuantity = (artworkId: string, quantity: number, editionId?: string) => {
    if (quantity <= 0) {
      removeFromCart(artworkId, editionId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        isSameSlot(item, artworkId, editionId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () =>
    cartItems.reduce(
      (total, item) => total + (item.edition?.price.eur ?? item.artwork.price) * item.quantity,
      0
    );

  const getCartCount = () =>
    cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
