import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface LightboxModalProps {
  images: string[];
  titles?: string[];
  initialIndex?: number;
  artworkTitle?: string;
  onClose: () => void;
}

const ZOOM_LEVELS = [1, 1.6, 2.5, 3.5];

export function LightboxModal({
  images,
  titles,
  initialIndex = 0,
  artworkTitle,
  onClose,
}: LightboxModalProps) {
  const [current, setCurrent]   = useState(initialIndex);
  const [zoomIdx, setZoomIdx]   = useState(0);
  const [pan, setPan]           = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const swipeStart = useRef<number | null>(null);

  const zoom = ZOOM_LEVELS[zoomIdx];
  const isZoomed = zoom > 1;

  const resetZoom = () => { setZoomIdx(0); setPan({ x: 0, y: 0 }); };

  const goTo = useCallback((i: number) => {
    resetZoom();
    setCurrent(i);
  }, []);

  const prev = useCallback(() => goTo(current === 0 ? images.length - 1 : current - 1), [current, images.length, goTo]);
  const next = useCallback(() => goTo(current === images.length - 1 ? 0 : current + 1), [current, images.length, goTo]);

  const cycleZoom = () => {
    const next = (zoomIdx + 1) % ZOOM_LEVELS.length;
    setZoomIdx(next);
    if (next === 0) setPan({ x: 0, y: 0 });
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     { onClose(); }
      if (e.key === 'ArrowLeft')  { prev(); }
      if (e.key === 'ArrowRight') { next(); }
      if (e.key === 'z' || e.key === 'Z') cycleZoom();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next, zoomIdx]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Pan handlers ───────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (!isZoomed) {
      swipeStart.current = e.clientX;
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setIsPanning(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!panStart.current || !isZoomed) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({ x: panStart.current.px + dx, y: panStart.current.py + dy });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isZoomed && swipeStart.current !== null) {
      const delta = e.clientX - swipeStart.current;
      if (Math.abs(delta) > 50) { delta < 0 ? next() : prev(); }
      swipeStart.current = null;
      return;
    }
    panStart.current = null;
    setIsPanning(false);
  };

  const hasPrevNext = images.length > 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[90] flex items-center justify-center select-none"
        onClick={e => { if (e.target === e.currentTarget && !isZoomed) onClose(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-ink/95 backdrop-blur-sm" />

        {/* ── Top bar ─────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-5 pointer-events-none">
          <div className="pointer-events-auto">
            {artworkTitle && (
              <p className="font-serif italic text-base text-background/70">{artworkTitle}</p>
            )}
            {images.length > 1 && (
              <p className="text-label uppercase tracking-[0.2em] text-background/35 mt-0.5">
                {current + 1} / {images.length}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Zoom indicator + button */}
            <button
              onClick={cycleZoom}
              className="flex items-center gap-1.5 h-9 px-3 border border-background/15 text-background/50 hover:text-background hover:border-background/40 transition-all duration-300"
              aria-label="Cycle zoom level"
            >
              {zoomIdx === 0
                ? <ZoomIn className="w-4 h-4" />
                : zoomIdx === ZOOM_LEVELS.length - 1
                ? <Maximize2 className="w-4 h-4" />
                : <ZoomOut className="w-4 h-4" />}
              <span className="text-label tracking-widest">{Math.round(zoom * 100)}%</span>
            </button>

            {/* Reset zoom — only when zoomed */}
            {isZoomed && (
              <button
                onClick={resetZoom}
                className="h-9 px-3 border border-background/15 text-background/50 hover:text-background hover:border-background/40 transition-all duration-300 text-label uppercase tracking-widest"
              >
                Reset
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center border border-background/15 text-background/50 hover:text-background hover:border-background/40 hover:rotate-90 transition-all duration-400"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main image ──────────────────────────────── */}
        <div
          className={`relative w-full h-full flex items-center justify-center px-14 py-20 overflow-hidden ${
            isZoomed ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative flex items-center justify-center"
              onClick={e => { if (!isZoomed && !isPanning) cycleZoom(); e.stopPropagation(); }}
            >
              <img
                src={images[current]}
                alt={titles?.[current] || artworkTitle || `Image ${current + 1}`}
                draggable={false}
                className="max-h-[80vh] w-auto object-contain transition-transform duration-500 ease-luxury will-change-transform"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  WebkitUserDrag: 'none',
                  transitionDuration: isPanning ? '0ms' : '500ms',
                } as React.CSSProperties}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Prev / Next ─────────────────────────────── */}
        {hasPrevNext && !isZoomed && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border border-background/15 text-background/50 hover:text-background hover:border-background/40 transition-all duration-300 bg-ink/20 backdrop-blur-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border border-background/15 text-background/50 hover:text-background hover:border-background/40 transition-all duration-300 bg-ink/20 backdrop-blur-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* ── Thumbnail strip ─────────────────────────── */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); goTo(i); }}
                className={`w-10 h-10 overflow-hidden border-2 transition-all duration-300 ${
                  i === current
                    ? 'border-terracotta opacity-100'
                    : 'border-background/20 opacity-50 hover:opacity-80'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img src={src} alt="" draggable={false} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Keyboard hint */}
        <p className="absolute bottom-6 right-6 text-label text-background/20 hidden md:block pointer-events-none">
          ← → Navigate · Z Zoom · Drag to pan · Esc Close
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
