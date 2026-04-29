import { LazyImage } from '../components/LazyImage';
import { useCurrency } from '../context/CurrencyContext';
import { useSEO } from '../hooks/useSEO';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Expand, Heart, SlidersHorizontal, X, Bell } from 'lucide-react';
import { Artwork } from '../data/artworks';
import { useArtworks } from '../hooks/useArtworks';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { QuickViewModal } from '../components/QuickViewModal';
import { currentInteractionPage, getVisitorId, trackInteraction } from '../lib/interactions';

interface GalleryPageProps {
  onNavigate: (page: any) => void;
  onSelectArtwork: (id: string) => void;
}

type MediumFilter = 'All' | 'Painting' | 'Drawing' | 'Clay Model';
type AvailFilter  = 'All' | 'Available' | 'Sold';

export function GalleryPage({ onNavigate, onSelectArtwork }: GalleryPageProps) {
  const { artworks, loading, error } = useArtworks();
  const [medium, setMedium]         = useState<MediumFilter>('All');
  const [avail,  setAvail]          = useState<AvailFilter>('All');
  const [quickView, setQuickView]   = useState<Artwork | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { wishlisted } = useToast();

  useSEO({ title: 'Gallery — Contemporary Art', description: "Browse Mapheane's complete collection" });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const filtered = artworks.filter(a => {
    if (medium !== 'All' && a.medium !== medium) return false;
    if (avail  !== 'All' && a.status !== avail)  return false;
    return true;
  });

  const activeFilters = (medium !== 'All' ? 1 : 0) + (avail !== 'All' ? 1 : 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-background min-h-screen w-full pt-32 pb-20 px-6 md:px-12"
      >
        <div className="container mx-auto max-w-7xl">

          {/* Back */}
          <button
            onClick={() => onNavigate('home')}
            className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-12"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Home
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-6">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4"
              >
                Complete Collection
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-serif text-6xl md:text-7xl text-charcoal"
                style={{ letterSpacing: '-0.02em', lineHeight: '0.95' }}
              >
                The Gallery
              </motion.h1>
            </div>

            {/* Filter toggle */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setFiltersOpen(f => !f)}
              className="flex items-center gap-2.5 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors border border-charcoal/12 px-4 py-2.5 hover:border-charcoal/30"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {activeFilters > 0 && (
                <span className="w-4 h-4 bg-terracotta text-white text-[9px] rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </motion.button>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden mb-10"
              >
                <div className="bg-parchment/50 border border-charcoal/6 p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-label uppercase tracking-widest text-muted mb-3">Medium</p>
                    <div className="flex flex-wrap gap-2">
                      {(['All', 'Painting', 'Drawing', 'Clay Model'] as MediumFilter[]).map(f => (
                        <button key={f} onClick={() => setMedium(f)}
                          className={`text-xs font-sans px-3 py-1.5 border transition-all duration-200 ${medium === f ? 'bg-charcoal text-background border-charcoal' : 'border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-label uppercase tracking-widest text-muted mb-3">Availability</p>
                    <div className="flex flex-wrap gap-2">
                      {(['All', 'Available', 'Sold'] as AvailFilter[]).map(f => (
                        <button key={f} onClick={() => setAvail(f)}
                          className={`text-xs font-sans px-3 py-1.5 border transition-all duration-200 ${avail === f ? 'bg-charcoal text-background border-charcoal' : 'border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {activeFilters > 0 && (
                  <button
                    onClick={() => { setMedium('All'); setAvail('All'); }}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-charcoal transition-colors mt-2 ml-1"
                  >
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <p className="text-xs font-sans uppercase tracking-widest text-muted mb-10">
            {loading ? 'Loading collection' : `${filtered.length} work${filtered.length !== 1 ? 's' : ''}${activeFilters > 0 ? ' matching filters' : ''}`}
          </p>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${medium}-${avail}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            >
              {filtered.map((artwork, index) => (
                <GalleryCard
                  key={artwork.id}
                  artwork={artwork}
                  index={index}
                  onViewFull={() => onSelectArtwork(artwork.id)}
                  onQuickView={() => {
                    trackInteraction({
                      action: 'quick_view',
                      targetType: 'artwork',
                      targetId: artwork.id,
                      targetTitle: artwork.title,
                      source: 'gallery_page',
                    });
                    setQuickView(artwork);
                  }}
                  isWishlisted={isWishlisted(artwork.id)}
                  onWishlist={() => {
                    const adding = !isWishlisted(artwork.id);
                    toggleWishlist(artwork.id);
                    trackInteraction({
                      action: adding ? 'wishlist_add' : 'wishlist_remove',
                      targetType: 'artwork',
                      targetId: artwork.id,
                      targetTitle: artwork.title,
                      source: 'gallery_page',
                    });
                    if (adding) wishlisted(`"${artwork.title}" saved`);
                  }}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {error && artworks.length === 0 && (
            <div className="text-center py-24">
              <p className="font-serif italic text-3xl text-charcoal/35 mb-4">The collection could not load.</p>
              <p className="text-sm text-muted mb-6">Please refresh the page. If it continues, the studio data connection needs attention.</p>
              <button onClick={() => window.location.reload()}
                className="text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors">
                Reload gallery
              </button>
            </div>
          )}

          {!error && filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="font-serif italic text-3xl text-charcoal/30 mb-4">No works match these filters.</p>
              <button onClick={() => { setMedium('All'); setAvail('All'); }}
                className="text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {quickView && (
        <QuickViewModal
          artwork={quickView}
          onClose={() => setQuickView(null)}
          onViewFull={(id) => { setQuickView(null); onSelectArtwork(id); }}
          onCommission={() => { setQuickView(null); onNavigate('commission'); }}
        />
      )}
    </>
  );
}

function GalleryCard({
  artwork, index, onViewFull, onQuickView, isWishlisted: liked, onWishlist,
}: {
  artwork: Artwork; index: number;
  onViewFull: () => void; onQuickView: () => void;
  isWishlisted: boolean; onWishlist: () => void;
}) {
  const { ref, isVisible } = useScrollReveal(0.08);
  const { format: formatPrice } = useCurrency();
  const [notifyOpen, setNotifyOpen] = React.useState(false);
  const [notifyEmail, setNotifyEmail] = React.useState('');
  const [notifySent, setNotifySent] = React.useState(false);
  const [notifyError, setNotifyError] = React.useState('');

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    const email = notifyEmail;
    setNotifyError('');
    try {
      const res = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify_request',
          targetType: 'artwork',
          targetId: artwork.id,
          targetTitle: artwork.title,
          source: 'gallery_page',
          visitorId: getVisitorId(),
          page: currentInteractionPage(),
          metadata: { email, artworkTitle: artwork.title },
        }),
      });
      if (!res.ok) throw new Error('Unable to save request');
      setNotifySent(true);
      setNotifyEmail('');
      setNotifyOpen(false);
    } catch {
      setNotifyError('Unable to save. Please try again.');
    }
  };

  return (
    <div
      ref={ref}
      className={`flex flex-col ${artwork.offsetClass} transition-all duration-1000 ease-luxury ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
      style={{ transitionDelay: `${(index % 3) * 100}ms` }}
    >
      <div
        className="group relative w-full aspect-[3/4] overflow-hidden mb-5 cursor-pointer shadow-artwork hover:shadow-artwork-hover transition-shadow duration-500 artwork-container"
        onClick={onViewFull}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        {/* Action overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-400">
          <button onClick={e => { e.stopPropagation(); onQuickView(); }}
            className="w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-terracotta hover:text-white transition-all duration-300 group/b">
            <Expand className="w-4 h-4 text-charcoal group-hover/b:text-white" />
          </button>
          <button onClick={e => { e.stopPropagation(); onViewFull(); }}
            className="w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-terracotta hover:text-white transition-all duration-300 group/b">
            <Eye className="w-4 h-4 text-charcoal group-hover/b:text-white" />
          </button>
        </div>

        {/* Wishlist heart */}
        <button onClick={e => { e.stopPropagation(); onWishlist(); }}
          className={`absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center transition-all duration-300 ${liked ? 'opacity-100 text-terracotta' : 'opacity-0 group-hover:opacity-100 text-white/80'}`}
          aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-terracotta' : 'drop-shadow'}`} />
        </button>

        {artwork.status === 'Sold' && (
          <div className="absolute top-3 left-3 z-30 bg-charcoal/80 text-background text-label uppercase tracking-widest px-2.5 py-1">Sold</div>
        )}

        <img src={artwork.images[0]} alt={artwork.title} draggable={false}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-luxury group-hover:scale-[1.04]"
          style={{ objectPosition: artwork.cropPosition }} />
      </div>

      <div className="space-y-1">
        <h3 onClick={onViewFull}
          className="font-serif text-2xl text-charcoal cursor-pointer hover:text-terracotta transition-colors duration-300"
          style={{ letterSpacing: '-0.01em' }}>
          {artwork.title}
        </h3>
        <p className="text-xs font-sans uppercase tracking-[0.15em] text-muted">{artwork.technique}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-sans text-sm text-charcoal">{formatPrice(artwork.price)}</span>
          <span className={`text-xs font-sans uppercase tracking-widest ${artwork.status === 'Available' ? 'text-sage' : 'text-muted/50'}`}>
            {artwork.status}
          </span>
        </div>

        {/* Notify me — sold works only */}
        {artwork.status === 'Sold' && !notifySent && (
          <AnimatePresence mode="wait">
            {notifyOpen ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleNotify}
                className="overflow-hidden pt-2"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 min-w-0 px-3 py-2 border border-charcoal/15 bg-background text-xs font-sans text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-terracotta transition-colors"
                  />
                  <button type="submit" className="px-3 py-2 bg-charcoal text-background text-xs hover:bg-terracotta transition-colors">
                    <Bell className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => setNotifyOpen(false)} className="px-2 text-muted/60 hover:text-muted">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {notifyError && <p className="text-xs text-red-500 mt-1">{notifyError}</p>}
              </motion.form>
            ) : (
              <motion.button
                key="btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={e => { e.stopPropagation(); setNotifyOpen(true); }}
                className="flex items-center gap-1.5 text-xs text-muted/60 hover:text-terracotta transition-colors pt-1"
              >
                <Bell className="w-3 h-3" /> Notify me if available
              </motion.button>
            )}
          </AnimatePresence>
        )}
        {notifySent && (
          <p className="text-xs text-sage pt-1">We'll notify you.</p>
        )}
      </div>
    </div>
  );
}
