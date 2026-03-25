import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Currency = 'ZAR' | 'EUR' | 'USD' | 'GBP';

interface CurrencyConfig {
  code: Currency;
  symbol: string;
  label: string;
  flag: string;
  rateFromEUR: number; // 1 EUR = X of this currency
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'ZAR', symbol: 'R',  label: 'South African Rand', flag: '🇿🇦', rateFromEUR: 18   },
  { code: 'EUR', symbol: '€',  label: 'Euro',               flag: '🇪🇺', rateFromEUR: 1    },
  { code: 'USD', symbol: '$',  label: 'US Dollar',          flag: '🇺🇸', rateFromEUR: 1.09 },
  { code: 'GBP', symbol: '£',  label: 'British Pound',      flag: '🇬🇧', rateFromEUR: 0.86 },
];

const STORAGE_KEY = 'mapheane_currency';

interface CurrencyContextType {
  currency: CurrencyConfig;
  setCurrency: (code: Currency) => void;
  /** Format a price given in EUR into the user's chosen currency */
  format: (eur: number, opts?: { decimals?: boolean; showCode?: boolean }) => string;
  /** Convert EUR to the user's chosen currency (raw number) */
  convert: (eur: number) => number;
  /** Convert ZAR to the user's chosen currency (for ZAR-native prices like shipping) */
  fromZAR: (zar: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Currency | null;
      if (saved && CURRENCIES.find(c => c.code === saved)) return saved;
    } catch {}
    return 'ZAR';
  });

  const currency = CURRENCIES.find(c => c.code === currencyCode)!;

  // Persist choice across sessions and page refreshes
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, currencyCode); } catch {}
  }, [currencyCode]);

  const convert = useCallback((eur: number): number => {
    return Math.round(eur * currency.rateFromEUR);
  }, [currency]);

  const format = useCallback((eur: number, opts: { decimals?: boolean; showCode?: boolean } = {}): string => {
    const amount = convert(eur);
    const formatted = opts.decimals
      ? amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount.toLocaleString('en-ZA');
    return opts.showCode
      ? `${currency.symbol}${formatted} ${currency.code}`
      : `${currency.symbol}${formatted}`;
  }, [convert, currency]);

  /** For ZAR-native prices (shipping zones, workshop fees). Converts ZAR→EUR first then to chosen currency */
  const fromZAR = useCallback((zar: number): string => {
    const eur = zar / 18;
    return format(eur);
  }, [format]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: setCurrencyCode, format, convert, fromZAR }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
