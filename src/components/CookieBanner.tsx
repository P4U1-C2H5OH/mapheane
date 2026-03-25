import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const STORAGE_KEY = 'mapheane_cookie_consent';

type ConsentState = 'accepted' | 'declined' | null;

export function CookieBanner({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [state, setState] = useState<ConsentState | 'loading'>('loading');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ConsentState | null;
      setState(saved ?? null);
    } catch {
      setState(null);
    }
  }, []);

  const respond = (choice: 'accepted' | 'declined') => {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch {}
    setState(choice);
    // In production: if accepted, initialise analytics (Plausible/GA)
  };

  const visible = state === null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 2 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[60] bg-background border border-charcoal/10 shadow-modal"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="p-5">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-serif italic text-lg text-charcoal leading-tight">
                  We use cookies
                </p>
              </div>
              <button
                onClick={() => respond('declined')}
                className="text-muted hover:text-charcoal hover:rotate-90 transition-all duration-300 flex-shrink-0 mt-0.5"
                aria-label="Decline and close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed mb-5">
              We use minimal analytics cookies to understand how visitors use the studio — no advertising, no tracking.{' '}
              <button
                onClick={() => onNavigate('privacy')}
                className="text-terracotta hover:text-terracottaDark transition-colors underline underline-offset-2"
              >
                Privacy policy
              </button>
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => respond('accepted')}
                className="flex-1 flex items-center justify-center gap-2 bg-terracotta text-background py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button"
              >
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
              <button
                onClick={() => respond('declined')}
                className="flex-1 py-2.5 text-xs font-sans uppercase tracking-widest text-muted border border-charcoal/15 hover:border-charcoal/30 hover:text-charcoal transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
