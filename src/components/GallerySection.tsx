import { LazyImage } from '../components/LazyImage';
import React, { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Eye, Expand, ArrowRight, Heart } from 'lucide-react';
import { artworks, Artwork } from '../data/artworks';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { QuickViewModal } from './QuickViewModal';

interface GallerySectionProps {
  onSelectArtwork?: (id: number) => void;
  onViewFullGallery?: () => void;
}

export function GallerySection({ onSelectArtwork, onViewFullGallery }: GallerySectionProps) {
  const [quickView, setQuickView] = useState<Artwork | null>(null);

  return (
    <>
      <section id="gallery" className="py-24 md:py-32 w-full bg-background">
        <div className="container mx-auto px-6 md:px-12">

          {/* Section header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Selected Works</span>
              <h2 className="font-serif text-5xl md:text-6xl text-charcoal" style={{ letterSpacing: '-0.02em', lineHeight: '1.0' }}>
                The Collection
              </h2>
            </div>
            <button
              onClick={onViewFullGallery}
              className="group inline-flex items-center gap-3 text-charcoal hover:text-terracotta transition-colors duration-300 flex-shrink-0 mb-1"
            >
              <span className="text-xs font-sans uppercase tracking-[0.2em] border-b border-charcoal/20 pb-px group-hover:border-terracotta transition-colors">
                View Full Gallery
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Staggered masonry-style grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {artworks.slice(0, 3).map((art, index) => (
              <GalleryCard
                key={art.id}
                artwork={art}
                index={index}
                onViewFull={() => onSelectArtwork?.(art.id)}
                onQuickView={() => setQuickView(art)}
              />
            ))}
          </div>

          {/* Stat row */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 mt-20 pt-16 border-t border-charcoal/5">
            {[
              { value: '9',    label: 'Original works'      },
              { value: '3',    label: 'Mediums'             },
              { value: 'ZAR',  label: 'Priced in Rand'      },
              { value: '∞',    label: 'Commissions possible' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-4xl md:text-5xl italic text-charcoal/20">{stat.value}</p>
                <p className="text-label uppercase tracking-[0.2em] text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Quick View modal */}
      {quickView && (
        <QuickViewModal
          artwork={quickView}
          onClose={() => setQuickView(null)}
          onViewFull={(id) => { setQuickView(null); onSelectArtwork?.(id); }}
        />
      )}
    </>
  );
}

function GalleryCard({
  artwork,
  index,
  onViewFull,
  onQuickView,
}: {
  artwork: Artwork;
  index: number;
  onViewFull: () => void;
  onQuickView: () => void;
}) {
  const { ref, isVisible } = useScrollReveal(0.1);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { wishlisted } = useToast();
  const liked = isWishlisted(artwork.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = !liked;
    toggleWishlist(artwork.id);
    if (added) wishlisted(`"${artwork.title}" saved`);
  };

  return (
    <div
      ref={ref}
      className={`flex flex-col ${artwork.offsetClass} transition-all duration-1000 ease-luxury transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Image wrapper */}
      <div
        className="group relative w-full aspect-[3/4] overflow-hidden mb-5 cursor-pointer artwork-container shadow-artwork hover:shadow-artwork-hover transition-shadow duration-500"
        onClick={onViewFull}
      >
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        {/* Action buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-400">
          {/* Quick view */}
          <button
            onClick={e => { e.stopPropagation(); onQuickView(); }}
            className="w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-terracotta hover:text-white transition-all duration-300 group/btn"
            aria-label="Quick view"
          >
            <Expand className="w-4 h-4 text-charcoal group-hover/btn:text-white transition-colors" />
          </button>
          {/* Full page */}
          <button
            onClick={e => { e.stopPropagation(); onViewFull(); }}
            className="w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-terracotta hover:text-white transition-all duration-300 group/btn"
            aria-label="View artwork"
          >
            <Eye className="w-4 h-4 text-charcoal group-hover/btn:text-white transition-colors" />
          </button>
        </div>

        {/* Wishlist heart — always visible but subtle */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center transition-all duration-300 ${
            liked
              ? 'text-terracotta opacity-100'
              : 'text-white/0 group-hover:text-white/70 opacity-0 group-hover:opacity-100'
          }`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-terracotta' : ''}`} />
        </button>

        {/* Sold badge */}
        {artwork.status === 'Sold' && (
          <div className="absolute top-3 left-3 z-30 bg-charcoal/80 text-background text-label uppercase tracking-widest px-2.5 py-1">
            Sold
          </div>
        )}

        <img
          src={artwork.images[0]}
          alt={artwork.title}
          draggable={false}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-luxury group-hover:scale-[1.04]"
          style={{ objectPosition: artwork.cropPosition }}
        />
      </div>

      {/* Metadata */}
      <div className="space-y-1">
        <h3
          onClick={onViewFull}
          className="font-serif text-2xl md:text-[1.6rem] text-charcoal cursor-pointer hover:text-terracotta transition-colors duration-300"
          style={{ letterSpacing: '-0.01em' }}
        >
          {artwork.title}
        </h3>
        <p className="text-xs font-sans uppercase tracking-[0.15em] text-muted">{artwork.technique}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-sans text-muted/70">{artwork.dimensions}</span>
          <span className={`text-xs font-sans uppercase tracking-widest ${
            artwork.status === 'Available' ? 'text-sage' : 'text-muted line-through'
          }`}>
            {artwork.status}
          </span>
        </div>
      </div>
    </div>
  );
}
