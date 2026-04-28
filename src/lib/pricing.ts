import type { Currency } from '../context/CurrencyContext';

export const EUR_TO_ZAR_RATE = Number(import.meta.env.VITE_EUR_TO_ZAR_RATE ?? 18);

export const EUR_RATES: Record<Currency, number> = {
  ZAR: EUR_TO_ZAR_RATE,
  EUR: 1,
  USD: Number(import.meta.env.VITE_EUR_TO_USD_RATE ?? 1.09),
  GBP: Number(import.meta.env.VITE_EUR_TO_GBP_RATE ?? 0.86),
};

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function eurToZar(eur: number): number {
  return roundMoney(eur * EUR_TO_ZAR_RATE);
}

export function zarToEur(zar: number): number {
  return roundMoney(zar / EUR_TO_ZAR_RATE);
}

export function formatMoney(amount: number, currency: Currency = 'ZAR', showCode = false): string {
  const formatted = roundMoney(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbols: Record<Currency, string> = { ZAR: 'R', EUR: '€', USD: '$', GBP: '£' };
  return showCode ? `${symbols[currency]}${formatted} ${currency}` : `${symbols[currency]}${formatted}`;
}

export function formatZar(amount: number, showCode = false): string {
  return formatMoney(amount, 'ZAR', showCode);
}
