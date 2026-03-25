import React, { useEffect, useRef } from 'react';
import { ArrowDown, Instagram, Facebook, Mail } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PRESS_FEATURES = [
  { outlet: 'Art Africa Magazine', note: 'Feature · 2024' },
  { outlet: 'Contemporary And',    note: 'Profile · 2024' },
  { outlet: 'Latitudes Online',    note: 'Watch List · 2023' },
  { outlet: 'Lesotho Times Arts',  note: 'Interview · 2023' },
  { outlet: 'Morija Arts Festival', note: 'Exhibition · 2025' },
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Subtle parallax on hero image
  const imageY = useTransform(scrollY, [0, 600], [0, 60]);
  const textY   = useTransform(scrollY, [0, 600], [0, 30]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full pt-28 pb-0 px-6 md:px-12 flex flex-col justify-between overflow-hidden"
    >
      {/* Warm ambient gradient behind content */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 80% 60%, rgba(196,149,106,0.06) 0%, transparent 60%)',
        }}
      />

      {/* ─── Top grid ──────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 w-full max-w-7xl mx-auto">

        {/* Quote & info */}
        <motion.div
          style={{ y: textY }}
          className="lg:col-span-7 flex flex-col justify-center"
        >
          {/* Overline */}
          <motion.span
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-label uppercase tracking-[0.3em] text-terracotta mb-8 block"
          >
            Maseru · Lesotho · Contemporary Art
          </motion.span>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.0] text-charcoal mb-10"
            style={{ letterSpacing: '-0.02em' }}
          >
            "To give meaning<br />
            <em className="not-italic text-terracotta">to one's life</em><br />
            and life to one's senses."
          </motion.h1>

          {/* Divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
            className="w-16 h-px bg-terracotta/40 origin-left mb-10"
          />

          {/* Contact + social */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-6 flex-wrap">
              <a
                href="mailto:hello@mapheane.art"
                className="text-sm text-charcoal/60 border-b border-charcoal/20 pb-px hover:border-terracotta hover:text-terracotta transition-all duration-300"
              >
                hello@mapheane.art
              </a>
              <a
                href="tel:+26622000000"
                className="text-sm text-charcoal/60 border-b border-charcoal/20 pb-px hover:border-terracotta hover:text-terracotta transition-all duration-300"
              >
                +266 22 000 000
              </a>
            </div>
            <div className="flex items-center gap-4 text-charcoal/50">
              <a href="https://facebook.com/mapheane" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook" className="hover:text-terracotta transition-colors duration-300">
                <Facebook size={16} />
              </a>
              <a href="https://instagram.com/mapheane" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram" className="hover:text-terracotta transition-colors duration-300">
                <Instagram size={16} />
              </a>
              <a href="mailto:hello@mapheane.art"
                aria-label="Email" className="hover:text-terracotta transition-colors duration-300">
                <Mail size={16} />
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero image */}
        <div className="lg:col-span-5 relative flex flex-col items-end">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-right mb-6 w-full"
          >
            <p className="text-label uppercase tracking-[0.2em] text-muted mb-1">Mixed Media</p>
            <p className="font-serif italic text-xl text-charcoal/80">2025 Collection</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full aspect-[3/4] max-w-md ml-auto overflow-hidden artwork-container"
            style={{ y: imageY }}
          >
            {/* Warm tint layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-terracotta/6 to-transparent z-10 pointer-events-none" />
            <img
              src="/artportfolio.jpg"
              alt="Mapheane — Featured Artwork"
              className="w-full h-full object-cover object-center hover:scale-[1.03] transition-transform duration-[1800ms] ease-out"
              draggable="false"
            />
            {/* Subtle frame */}
            <div className="absolute inset-0 border border-charcoal/6 z-10 pointer-events-none" />
          </motion.div>

          {/* Floating year stamp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute -bottom-2 left-0 hidden lg:flex items-center gap-3"
          >
            <div className="w-px h-12 bg-terracotta/30" />
            <div>
              <p className="text-label uppercase tracking-[0.2em] text-muted">Est.</p>
              <p className="font-serif text-2xl italic text-charcoal/30">2019</p>
            </div>
          </motion.div>

          {/* Arrow bounce */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="absolute -bottom-14 -left-10 hidden lg:block"
          >
            <ArrowDown className="w-10 h-10 text-terracotta/40 animate-bounce stroke-[1]" />
          </motion.div>
        </div>
      </div>

      {/* ─── Press strip ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="relative z-10 w-full max-w-7xl mx-auto mt-16 pt-6 pb-8 border-t border-charcoal/8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-10 flex-wrap">
          <span className="text-label uppercase tracking-[0.28em] text-muted/60 flex-shrink-0">As featured in</span>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {PRESS_FEATURES.map(p => (
              <div key={p.outlet} className="flex items-center gap-2">
                <span className="font-serif italic text-charcoal/50 text-sm">{p.outlet}</span>
                <span className="text-label text-muted/40 hidden sm:inline">{p.note}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
