import { useCurrency } from '../context/CurrencyContext';
import { useSEO } from '../hooks/useSEO';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ShoppingBag, Heart, ZoomIn,
  Package, Shield, Globe, FileText
} from 'lucide-react';
import { useArtworks } from '../hooks/useArtworks';
import { useEditions, Edition } from '../hooks/useEditions';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { LightboxModal } from '../components/LightboxModal';

interface ShopPageProps {
  onNavigate: (page: any) => void;
}

type Filter = 'All' | 'Limited' | 'Open';

function EditionCard({
  edition,
  resolvedImage,
  onAddToCart,
  onWishlist,
  isWishlisted,
  onZoom,
}: {
  edition: Edition;
  resolvedImage: string;
  onAddToCart: () => void;
  onWishlist: () => void;
  isWishlisted: boolean;
  onZoom: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const { format: formatPrice } = useCurrency();
  const soldPct = edition.editionSize
    ? Math.round(((edition.editionSold || 0) / edition.editionSize) * 100)
    : 0;

  const handleAdd = async () => {
    setAdding(true);
    await new Promise(r => setTimeout(r, 600));
    setAdding(false);
    onAddToCart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group flex flex-col"
    >
      {/* Image */}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-parchment mb-4 cursor-zoom-in artwork-container shadow-artwork group-hover:shadow-artwork-hover transition-shadow duration-500"
        onClick={onZoom}
      >
        <img
          src={resolvedImage || '/artportfolio.jpg'}
          alt={edition.title}
          draggable={false}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-luxury"
        />

        {/* Zoom overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-10">
          <div className="bg-background/85 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
            <ZoomIn className="w-3.5 h-3.5 text-charcoal" />
            <span className="text-label uppercase tracking-widest text-charcoal">Preview</span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          <span className={`text-label uppercase tracking-widest px-2.5 py-1 text-[10px] ${
            edition.type === 'Limited' ? 'bg-terracotta text-white' :
            edition.type === 'Artist Proof' ? 'bg-charcoal text-white' :
            'bg-stone text-charcoal/70'
          }`}>
            {edition.type === 'Limited' ? `Ed. of ${edition.editionSize}` : edition.type}
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); onWishlist(); }}
          className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center transition-all duration-300 ${
            isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-terracotta text-terracotta' : 'text-white drop-shadow'}`} />
        </button>
      </div>

      {/* Edition progress bar (limited only) */}
      {edition.editionSize && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-label text-muted">{edition.editionSold} of {edition.editionSize} sold</span>
            <span className="text-label text-muted">{edition.editionSize - (edition.editionSold || 0)} remaining</span>
          </div>
          <div className="w-full h-px bg-charcoal/10">
            <div
              className="h-px bg-terracotta transition-all duration-700"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 space-y-1 mb-4">
        <h3 className="font-serif text-xl text-charcoal" style={{ letterSpacing: '-0.01em' }}>
          {edition.title}
        </h3>
        <p className="text-xs font-sans text-muted uppercase tracking-widest">{edition.medium}</p>
        <p className="text-xs text-muted/70">{edition.size} · {edition.paper}</p>
        <p className="text-sm text-charcoal/65 leading-relaxed pt-1">{edition.description}</p>
      </div>

      {/* Price + CTA */}
      <div className="flex items-center justify-between gap-3 mt-auto">
        <div>
          <span className="font-serif text-lg text-charcoal">{formatPrice(edition.price.eur)}</span>
          <span className="text-xs text-muted/60 ml-1.5">≈ €{edition.price.eur}</span>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !edition.available}
          className="flex items-center gap-2 bg-charcoal text-background px-4 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracotta transition-colors duration-400 disabled:opacity-50"
        >
          {adding
            ? <div className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full animate-spin" />
            : <><ShoppingBag className="w-3.5 h-3.5" /> Add</>
          }
        </button>
      </div>
    </motion.div>
  );
}

export function ShopPage({ onNavigate }: ShopPageProps) {
  const { artworks } = useArtworks();
  const { editions } = useEditions();
  const [filter, setFilter] = useState<Filter>('All');
  const [lightbox, setLightbox] = useState<Edition | null>(null);
  const { addToCart, cartItems } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { cartAdded, wishlisted } = useToast();

  useSEO({ title: 'Print Editions', description: 'Limited and open edition prints — signed by Mapheane' });
  const { format: formatPrice } = useCurrency();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const available = editions.filter(e => e.available);
  const filtered  = filter === 'All' ? available : available.filter(e => e.type === filter || (filter === 'Limited' && e.type === 'Artist Proof'));

  const handleAddEdition = (edition: Edition) => {
    // Map edition to cart-compatible artwork item
    const matchArtwork = artworks.find(a => a.id === edition.artworkId);
    if (matchArtwork) {
      // Create a modified artwork entry for the print
      const printItem = {
        ...matchArtwork,
        id: `${edition.artworkId}-${edition.id}-${Math.floor(Math.random() * 100)}`,
        title: `${edition.title} — ${edition.size}`,
        price: edition.price.eur,
        status: 'Available' as const,
      };
      addToCart(printItem);
      cartAdded(
        `Print added`,
        `"${edition.title}" · ${edition.size}`,
        { label: 'View Cart', onClick: () => onNavigate('cart') }
      );
    }
  };

  const handleWishlist = (edition: Edition) => {
    const adding = !isWishlisted(edition.id);
    toggleWishlist(edition.id);
    if (adding) wishlisted(`"${edition.title}" saved`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-background min-h-screen overflow-hidden"
      >
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="relative pt-36 pb-20 px-6 md:px-12">
          <div className="container mx-auto max-w-6xl">
            <button onClick={() => onNavigate('home')}
              className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-14">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-end mb-16">
              <div>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.7 }}
                  className="text-label uppercase tracking-[0.3em] text-terracotta block mb-5">
                  Print Editions
                </motion.span>
                <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="font-serif text-5xl md:text-6xl text-charcoal"
                  style={{ lineHeight: '1.0', letterSpacing: '-0.02em' }}>
                  The work,<br />
                  <em className="italic text-terracotta">at every scale.</em>
                </motion.h1>
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-muted text-body-lg leading-relaxed max-w-prose">
                Archival giclée prints on Hahnemühle cotton rag — the same museum-quality paper used by leading printmakers worldwide. Limited editions numbered and hand-signed; open editions signed. Every print arrives with a Certificate of Authenticity.
              </motion.p>
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-charcoal/6 pt-10">
              {[
                { icon: Shield,   title: 'Archival Quality',       sub: '100-year fade guarantee'     },
                { icon: FileText, title: 'Certificate Included',   sub: 'Hand-signed by Mapheane'    },
                { icon: Package,  title: 'Flat-Packed Safely',     sub: 'Acid-free tissue & tubes'   },
                { icon: Globe,    title: 'Worldwide Shipping',     sub: 'DHL Express · 3–7 days'     },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-terracotta/70 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-sans font-500 text-charcoal uppercase tracking-widest">{title}</p>
                    <p className="text-xs text-muted mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Filter + Grid ───────────────────────────────── */}
        <section className="pb-24 px-6 md:px-12">
          <div className="container mx-auto max-w-6xl">

            {/* Filter tabs */}
            <div className="flex items-center gap-1 mb-12 border-b border-charcoal/8 pb-0">
              {(['All', 'Limited', 'Open'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-3 text-xs font-sans uppercase tracking-widest transition-all duration-300 border-b-2 -mb-px ${
                    filter === f
                      ? 'border-terracotta text-terracotta'
                      : 'border-transparent text-muted hover:text-charcoal'
                  }`}
                >
                  {f} {f === 'All' ? `(${available.length})` : `(${available.filter(e => e.type === f || (f === 'Limited' && e.type === 'Artist Proof')).length})`}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
              >
                {filtered.map(edition => {
                  const linkedArtwork = artworks.find(a => a.id === edition.artworkId);
                  const resolvedImage = edition.image || linkedArtwork?.images[0] || '';
                  return (
                    <EditionCard
                      key={edition.id}
                      edition={edition}
                      resolvedImage={resolvedImage}
                      onAddToCart={() => handleAddEdition(edition)}
                      onWishlist={() => handleWishlist(edition)}
                      isWishlisted={isWishlisted(edition.id)}
                      onZoom={() => setLightbox(edition)}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── Edition info strip ──────────────────────────── */}
        <section className="py-16 px-6 md:px-12 bg-parchment/50 border-t border-charcoal/5">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: 'Limited Editions',
                  body: 'Editions of 25 or 50. Numbered sequentially, hand-signed, and dated by Mapheane. Prices rise as the edition sells through. Early buyers are rewarded.',
                },
                {
                  title: 'Open Editions',
                  body: 'No fixed quantity. Signed but not numbered. The most accessible way to own work by Mapheane — ideal as a first acquisition or a gift.',
                },
                {
                  title: 'Certificate of Authenticity',
                  body: 'Every print — limited or open — ships with a signed COA including title, medium, dimensions, edition info, copyright statement, and a QR code linking to digital verification.',
                },
              ].map(item => (
                <div key={item.title}>
                  <div className="w-6 h-px bg-terracotta/40 mb-4" />
                  <h3 className="font-serif italic text-lg text-charcoal mb-3">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Licensing CTA ───────────────────────────────── */}
        <section className="py-16 px-6 md:px-12 border-t border-charcoal/5">
          <div className="container mx-auto max-w-3xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-2">Licensing</span>
              <h3 className="font-serif text-3xl italic text-charcoal">Use Mapheane's work commercially?</h3>
              <p className="text-muted text-sm mt-2 leading-relaxed max-w-md">
                Textile print, wallpaper, editorial, hospitality décor — licensing is available for select works. Inquire for rates and rights.
              </p>
            </div>
            <button
              onClick={() => onNavigate('commission')}
              className="flex-shrink-0 inline-flex items-center gap-3 border border-terracotta text-terracotta px-7 py-3.5 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracotta hover:text-white transition-all duration-400"
            >
              Licensing Inquiry <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </motion.div>

      {/* Lightbox */}
      {lightbox && (
        <LightboxModal
          images={[lightbox.image || artworks.find(a => a.id === lightbox.artworkId)?.images[0] || '/artportfolio.jpg']}
          artworkTitle={`${lightbox.title} · ${lightbox.size}`}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
