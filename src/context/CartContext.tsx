import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork } from '../data/artworks';

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (artwork: Artwork) => void;
  removeFromCart: (artworkId: number) => void;
  updateQuantity: (artworkId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mapheane-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('mapheane-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (artwork: Artwork) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.artwork.id === artwork.id);
      if (existing) {
        return prev.map(item =>
          item.artwork.id === artwork.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { artwork, quantity: 1 }];
    });
  };

  const removeFromCart = (artworkId: number) => {
    setCartItems(prev => prev.filter(item => item.artwork.id !== artworkId));
  };

  const updateQuantity = (artworkId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(artworkId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.artwork.id === artworkId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.artwork.price * item.quantity,
      0
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

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
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
