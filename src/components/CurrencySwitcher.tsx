import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useCurrency, CURRENCIES, Currency } from '../context/CurrencyContext';

interface CurrencySwitcherProps {
  variant?: 'compact' | 'full'; // compact = flag+code only, full = with label
  className?: string;
}



export function CurrencySwitcher({ variant = 'compact', className = '' }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen]           = useState(false);
  const ref                       = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs font-sans text-muted hover:text-charcoal transition-colors py-1 px-1.5 border border-charcoal/0 hover:border-charcoal/12 transition-all duration-200"
        aria-label="Switch currency"
        aria-expanded={open}
      >
        <span style={{ fontSize: 14 }}>{currency.flag}</span>
        <span className="uppercase tracking-wider">{currency.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-1.5 right-0 bg-background border border-charcoal/10 shadow-card z-50 min-w-[160px]"
            role="listbox"
          >
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-parchment/50 transition-colors ${
                  currency.code === c.code ? 'text-terracotta' : 'text-charcoal/70'
                }`}
                role="option"
                aria-selected={currency.code === c.code}
              >
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                <span className="font-sans uppercase tracking-wider text-xs">{c.code}</span>
                {variant === 'full' && (
                  <span className="text-xs text-muted ml-1 truncate">{c.symbol}</span>
                )}
                {currency.code === c.code && (
                  <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
