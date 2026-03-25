import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: any) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const links = [
    { label: 'Return Home',       page: 'home'       },
    { label: 'Browse Gallery',    page: 'gallery'    },
    { label: 'Commission a Work', page: 'commission' },
    { label: 'View Workshops',    page: 'workshops'  },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pt-24 pb-20 relative overflow-hidden"
    >
      {/* Giant ghost number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.span
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-serif text-[35vw] leading-none text-charcoal/[0.025] italic"
        >
          404
        </motion.span>
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6"
        >
          Page Not Found
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-serif text-5xl md:text-6xl italic text-charcoal mb-6"
          style={{ letterSpacing: '-0.02em', lineHeight: '1.05' }}
        >
          This page wandered<br />into the mountains.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-muted leading-relaxed mb-12 text-sm"
        >
          The work you were looking for may have moved, sold, or never existed here.
          The studio is still open.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap"
        >
          {links.map((link, i) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className={`flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] transition-all duration-300 ${
                i === 0
                  ? 'bg-terracotta text-white px-6 py-3 hover:bg-terracottaDark shadow-button hover:shadow-button-hover'
                  : 'text-muted hover:text-charcoal border-b border-charcoal/15 pb-px hover:border-charcoal/40'
              }`}
            >
              {link.label}
              {i === 0 && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          ))}
        </motion.div>

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.0 }}
          className="font-serif italic text-charcoal/25 text-lg mt-16"
        >
          "Every path through the mountains leads somewhere worth being."
        </motion.p>
      </div>
    </motion.div>
  );
}
