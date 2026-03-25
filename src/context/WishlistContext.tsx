import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────
interface WishlistItem {
  id: number;
  addedAt: number;
}

interface WishlistContextValue {
  wishlist: WishlistItem[];
  wishlistIds: Set<number>;
  isWishlisted: (id: number) => boolean;
  addToWishlist: (id: number) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (id: number) => boolean; // returns true if added
  clearWishlist: () => void;
  count: number;
}

// ─── Context ──────────────────────────────────────────────
const WishlistContext = createContext<WishlistContextValue | null>(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

const STORAGE_KEY = 'mapheane_wishlist';

// ─── Provider ─────────────────────────────────────────────
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Silently fail if storage is full
    }
  }, [wishlist]);

  const wishlistIds = new Set(wishlist.map(i => i.id));

  const isWishlisted = useCallback((id: number) => wishlistIds.has(id), [wishlistIds]);

  const addToWishlist = useCallback((id: number) => {
    setWishlist(prev => {
      if (prev.some(i => i.id === id)) return prev;
      return [...prev, { id, addedAt: Date.now() }];
    });
  }, []);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlist(prev => prev.filter(i => i.id !== id));
  }, []);

  const toggleWishlist = useCallback((id: number): boolean => {
    let added = false;
    setWishlist(prev => {
      if (prev.some(i => i.id === id)) {
        added = false;
        return prev.filter(i => i.id !== id);
      }
      added = true;
      return [...prev, { id, addedAt: Date.now() }];
    });
    // Return true = added. Note: this is sync-ish
    // We use a ref-based approach for accurate return
    return !wishlistIds.has(id);
  }, [wishlistIds]);

  const clearWishlist = useCallback(() => setWishlist([]), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        count: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
