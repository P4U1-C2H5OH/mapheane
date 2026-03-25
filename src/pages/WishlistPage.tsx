import { LazyImage } from '../components/LazyImage';
import { useCurrency } from '../context/CurrencyContext';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, ShoppingBag, X, ArrowRight } from 'lucide-react';
import { useArtworks } from '../hooks/useArtworks';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface WishlistPageProps {
  onNavigate: (page: any) => void;
  onSelectArtwork: (id: string) => void;
}

export function WishlistPage({ onNavigate, onSelectArtwork }: WishlistPageProps) {
  const { artworks } = useArtworks();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { cartAdded, success } = useToast();

  const { format: formatPrice } = useCurrency();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Only show artworks (not prints, which use computed IDs)
  const savedArtworks = wishlist
    .map(item => artworks.find(a => a.id === item.id))
    .filter(Boolean)
    .map(a => a!);

  const handleAddToCart = (artworkId: string) => {
    const art = artworks.find(a => a.id === artworkId);
    if (art && art.status === 'Available') {
      addToCart(art);
      cartAdded(`"${art.title}" added`, art.dimensions, {
        label: 'View Cart',
        onClick: () => onNavigate('cart'),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-background min-h-screen pt-32 pb-24 px-6 md:px-12"
    >
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <button onClick={() => onNavigate('gallery')}
          className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-12">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Gallery
        </button>

        <div className="flex items-end justify-between mb-14 gap-6 flex-wrap">
          <div>
            <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Saved Works</span>
            <h1 className="font-serif text-5xl md:text-7xl text-charcoal" style={{ letterSpacing: '-0.02em', lineHeight: '1.0' }}>
              Your Wishlist
            </h1>
          </div>
          {savedArtworks.length > 0 && (
            <button
              onClick={() => { clearWishlist(); success('Wishlist cleared'); }}
              className="text-xs font-sans uppercase tracking-widest text-muted hover:text-charcoal transition-colors border-b border-charcoal/15 pb-px hover:border-charcoal/40"
            >
              Clear All
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {savedArtworks.length === 0 ? (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-16 h-16 border border-charcoal/10 flex items-center justify-center mb-7">
                <Heart className="w-7 h-7 text-charcoal/20" />
              </div>
              <h2 className="font-serif text-3xl italic text-charcoal/40 mb-4">Nothing saved yet</h2>
              <p className="text-muted text-sm leading-relaxed max-w-sm mb-8">
                Browse the gallery and tap the heart on any work to save it here. Your wishlist persists across visits.
              </p>
              <button
                onClick={() => onNavigate('gallery')}
                className="inline-flex items-center gap-3 text-xs font-sans uppercase tracking-[0.2em] text-charcoal border-b border-charcoal/20 pb-px hover:border-terracotta hover:text-terracotta transition-all duration-300"
              >
                Explore the Gallery <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            >
              {savedArtworks.map((artwork, i) => (
                <motion.div
                  key={artwork.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.08, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-parchment mb-5 cursor-pointer shadow-artwork group-hover:shadow-artwork-hover transition-shadow duration-500 artwork-container">
                    <LazyImage
                      src={artwork.images[0]}
                      alt={artwork.title}
                      draggable={false}
                      onClick={() => onSelectArtwork(artwork.id)}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-luxury"
                      style={{ objectPosition: artwork.cropPosition }}
                    />

                    {/* Remove */}
                    <button
                      onClick={() => removeFromWishlist(artwork.id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-background/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-400"
                      aria-label="Remove from wishlist"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {artwork.status === 'Sold' && (
                      <div className="absolute top-3 left-3 bg-charcoal/80 text-background text-label uppercase tracking-widest px-2.5 py-1 z-10">
                        Sold
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-1 mb-4">
                    <button
                      onClick={() => onSelectArtwork(artwork.id)}
                      className="font-serif text-2xl text-charcoal hover:text-terracotta transition-colors text-left"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {artwork.title}
                    </button>
                    <p className="text-xs font-sans uppercase tracking-widest text-muted">{artwork.technique}</p>
                    <p className="text-xs text-muted/60">{artwork.dimensions}</p>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-serif text-lg text-charcoal">
                        {formatPrice(artwork.price)}
                      </span>
                      <span className="text-xs text-muted/60 ml-1.5">ZAR</span>
                    </div>
                    {artwork.status === 'Available' ? (
                      <button
                        onClick={() => handleAddToCart(artwork.id)}
                        className="flex items-center gap-2 bg-terracotta text-white px-4 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors duration-400"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('commission')}
                        className="flex items-center gap-2 border border-charcoal/15 text-muted px-4 py-2.5 text-xs font-sans uppercase tracking-widest hover:border-terracotta hover:text-terracotta transition-all duration-300"
                      >
                        Commission
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        {savedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-20 pt-14 border-t border-charcoal/6 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <p className="text-muted text-sm">
              {savedArtworks.length} work{savedArtworks.length !== 1 ? 's' : ''} saved ·{' '}
              {savedArtworks.filter(a => a.status === 'Available').length} available
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onNavigate('gallery')}
                className="text-xs font-sans uppercase tracking-widest text-muted hover:text-charcoal transition-colors border-b border-charcoal/15 pb-px"
              >
                Continue browsing
              </button>
              <button
                onClick={() => onNavigate('commission')}
                className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors border-b border-terracotta/30 pb-px"
              >
                Commission any work <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
