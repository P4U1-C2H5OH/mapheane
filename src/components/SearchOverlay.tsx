import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Image, FileText, Calendar } from 'lucide-react';
import { useArtworks } from '../hooks/useArtworks';
import { useMoments } from '../hooks/useMoments';
import { useEvents } from '../hooks/useEvents';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: any) => void;
  onSelectArtwork: (id: string) => void;
  onSelectMoment:  (id: string) => void;
  onSelectEvent:   (id: string) => void;
}

interface Result {
  id: string;
  type: 'artwork' | 'moment' | 'event';
  title: string;
  sub: string;
  image?: string;
  cropPosition?: string;
  onClick: () => void;
}

const TYPE_ICON = {
  artwork: Image,
  moment:  FileText,
  event:   Calendar,
} as const;

const TYPE_LABEL = {
  artwork: 'Artwork',
  moment:  'Moment',
  event:   'Event',
} as const;

const QUICK_LINKS = [
  { label: 'Gallery',     page: 'gallery'    },
  { label: 'Commissions', page: 'commission' },
  { label: 'Workshops',   page: 'workshops'  },
  { label: 'Shop',        page: 'shop'       },
  { label: 'About',       page: 'about'      },
];

export function SearchOverlay({ isOpen, onClose, onNavigate, onSelectArtwork, onSelectMoment, onSelectEvent }: SearchOverlayProps) {
  const { artworks } = useArtworks();
  const { moments } = useMoments();
  const { events } = useEvents();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive]   = useState(0);
  const inputRef              = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery('');
      setResults([]);
      setActive(0);
    }
  }, [isOpen]);

  // Keyboard: close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setActive(a => Math.min(a + 1, results.length - 1));
      if (e.key === 'ArrowUp')   setActive(a => Math.max(a - 1, 0));
      if (e.key === 'Enter' && results[active]) { results[active].onClick(); onClose(); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, results, active, onClose]);

  // Search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setActive(0); return; }
    const q = query.toLowerCase();

    const artRes: Result[] = artworks
      .filter(a => a.title.toLowerCase().includes(q) || a.technique.toLowerCase().includes(q) || a.medium.toLowerCase().includes(q))
      .slice(0, 4)
      .map(a => ({
        id: `art-${a.id}`, type: 'artwork' as const,
        title: a.title, sub: `${a.technique} · R${(a.price * 18).toLocaleString()}`,
        image: a.images[0], cropPosition: a.cropPosition,
        onClick: () => { onSelectArtwork(a.id); onClose(); },
      }));

    const momRes: Result[] = moments
      .filter(m => m.title.toLowerCase().includes(q) || m.excerpt?.toLowerCase().includes(q) || m.tags?.some((t: string) => t.toLowerCase().includes(q)))
      .slice(0, 3)
      .map(m => ({
        id: `mom-${m.id}`, type: 'moment' as const,
        title: m.title, sub: m.type,
        image: m.media?.[0]?.url,
        onClick: () => { onSelectMoment(m.id); onClose(); },
      }));

    const evtRes: Result[] = events
      .filter(e => e.title.toLowerCase().includes(q) || e.location.city.toLowerCase().includes(q) || e.type.toLowerCase().includes(q))
      .slice(0, 2)
      .map(e => ({
        id: `evt-${e.id}`, type: 'event' as const,
        title: e.title, sub: `${e.type} · ${e.location.city}`,
        onClick: () => { onSelectEvent(e.id); onClose(); },
      }));

    setResults([...artRes, ...momRes, ...evtRes]);
    setActive(0);
  }, [query, artworks, moments, events]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] bg-ink/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 right-0 z-[90] bg-background shadow-modal"
            style={{ maxHeight: '85vh', overflowY: 'auto' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-4 px-4 sm:px-8 py-5 border-b border-charcoal/8">
              <Search className="w-5 h-5 text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search artworks, moments, events…"
                className="flex-1 bg-transparent font-serif text-xl md:text-2xl text-charcoal placeholder:text-charcoal/25 placeholder:italic focus:outline-none"
                style={{ letterSpacing: '-0.01em' }}
                aria-label="Search"
              />
              <button
                onClick={onClose}
                className="p-2 text-muted hover:text-charcoal transition-colors hover:rotate-90 duration-300"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 sm:px-8 py-6">
              {/* Results */}
              <AnimatePresence mode="wait">
                {query && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {results.length > 0 ? (
                      <div className="space-y-1">
                        {results.map((r, i) => {
                          const Icon = TYPE_ICON[r.type];
                          return (
                            <button
                              key={r.id}
                              onClick={() => { r.onClick(); }}
                              onMouseEnter={() => setActive(i)}
                              className={`w-full flex items-center gap-4 p-3 transition-all duration-150 text-left group ${
                                active === i ? 'bg-parchment/60' : 'hover:bg-parchment/40'
                              }`}
                            >
                              {/* Thumbnail or icon */}
                              {r.image ? (
                                <div className="w-12 h-12 flex-shrink-0 overflow-hidden bg-parchment">
                                  <img src={r.image} alt={r.title} draggable={false}
                                    className="w-full h-full object-cover"
                                    style={{ objectPosition: r.cropPosition }} />
                                </div>
                              ) : (
                                <div className="w-12 h-12 flex-shrink-0 bg-charcoal/5 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-muted" />
                                </div>
                              )}
                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p className="font-serif italic text-charcoal text-base leading-tight truncate group-hover:text-terracotta transition-colors">
                                  {r.title}
                                </p>
                                <p className="text-xs text-muted mt-0.5">{r.sub}</p>
                              </div>
                              {/* Type badge */}
                              <span className="text-label uppercase tracking-widest text-muted/60 hidden sm:block flex-shrink-0">
                                {TYPE_LABEL[r.type]}
                              </span>
                              <ArrowRight className="w-4 h-4 text-muted/0 group-hover:text-muted/50 transition-all flex-shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <p className="font-serif italic text-charcoal/30 text-xl">No results for "{query}"</p>
                        <p className="text-xs text-muted mt-2">Try a different term — artwork title, medium, or subject</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Empty state: quick links */}
                {!query && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-label uppercase tracking-[0.25em] text-muted mb-4">Quick links</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {QUICK_LINKS.map(l => (
                        <button
                          key={l.page}
                          onClick={() => { onNavigate(l.page); onClose(); }}
                          className="text-sm font-sans border border-charcoal/12 px-4 py-2 text-muted hover:border-terracotta/40 hover:text-terracotta transition-all duration-200"
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>

                    {/* Recent artworks as suggestions */}
                    <p className="text-label uppercase tracking-[0.25em] text-muted mb-4">Recent works</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {artworks.slice(0, 4).map(a => (
                        <button
                          key={a.id}
                          onClick={() => { onSelectArtwork(a.id); onClose(); }}
                          className="text-left group"
                        >
                          <div className="aspect-[3/4] overflow-hidden bg-parchment mb-2">
                            <img src={a.images[0]} alt={a.title} draggable={false}
                              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                              style={{ objectPosition: a.cropPosition }} />
                          </div>
                          <p className="font-serif text-sm text-charcoal group-hover:text-terracotta transition-colors truncate">
                            {a.title}
                          </p>
                          <p className="text-xs text-muted">{a.medium}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer hint */}
            <div className="px-4 sm:px-8 py-3 border-t border-charcoal/6 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted/50">
                <kbd className="px-1.5 py-0.5 border border-charcoal/10 font-sans">↑↓</kbd>
                navigate
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted/50">
                <kbd className="px-1.5 py-0.5 border border-charcoal/10 font-sans">↵</kbd>
                select
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted/50">
                <kbd className="px-1.5 py-0.5 border border-charcoal/10 font-sans">Esc</kbd>
                close
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
