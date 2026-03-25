import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Info, AlertTriangle, ShoppingBag, Heart } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning' | 'cart' | 'wishlist';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (options: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  // convenience helpers
  success:  (title: string, message?: string) => void;
  error:    (title: string, message?: string) => void;
  info:     (title: string, message?: string) => void;
  cartAdded:(title: string, message?: string, action?: Toast['action']) => void;
  wishlisted:(title: string) => void;
}

// ─── Context ──────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Icons per type ───────────────────────────────────────
const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success:  <Check className="w-4 h-4" />,
  error:    <X className="w-4 h-4" />,
  info:     <Info className="w-4 h-4" />,
  warning:  <AlertTriangle className="w-4 h-4" />,
  cart:     <ShoppingBag className="w-4 h-4" />,
  wishlist: <Heart className="w-4 h-4" />,
};

// ─── Color accent per type ────────────────────────────────
const TOAST_COLORS: Record<ToastType, string> = {
  success:  'bg-sage/10 border-sage/20 text-sage',
  error:    'bg-red-50 border-red-100 text-red-600',
  info:     'bg-stone/30 border-stone/40 text-charcoal',
  warning:  'bg-clay/10 border-clay/20 text-clay',
  cart:     'bg-terracotta/8 border-terracotta/15 text-terracotta',
  wishlist: 'bg-terracotta/8 border-terracotta/15 text-terracotta',
};

// ─── Single Toast card ────────────────────────────────────
function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const iconStyle = TOAST_COLORS[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      className="relative w-80 bg-background border border-charcoal/8 shadow-toast overflow-hidden"
      role="alert"
      aria-live="assertive"
    >
      {/* Terracotta accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-terracotta opacity-60" />

      <div className="px-5 py-4 flex gap-3 items-start">
        {/* Icon bubble */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${iconStyle}`}>
          {TOAST_ICONS[toast.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[0.8125rem] font-500 text-charcoal leading-snug">
            {toast.title}
          </p>
          {toast.message && (
            <p className="font-sans text-xs text-muted mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          )}
          {toast.action && (
            <button
              onClick={() => { toast.action!.onClick(); onDismiss(toast.id); }}
              className="mt-2 text-xs font-sans font-500 text-terracotta uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 text-muted hover:text-charcoal transition-colors mt-0.5"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const showToast = useCallback((options: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = options.duration ?? 4000;

    setToasts(prev => {
      // max 3 toasts visible
      const next = [...prev, { ...options, id }];
      return next.slice(-3);
    });

    if (duration > 0) {
      const timer = setTimeout(() => dismissToast(id), duration);
      timers.current.set(id, timer);
    }

    return id;
  }, [dismissToast]);

  // Convenience helpers
  const success  = useCallback((title: string, message?: string) =>
    showToast({ type: 'success', title, message }), [showToast]);
  const error    = useCallback((title: string, message?: string) =>
    showToast({ type: 'error', title, message, duration: 6000 }), [showToast]);
  const info     = useCallback((title: string, message?: string) =>
    showToast({ type: 'info', title, message }), [showToast]);
  const cartAdded = useCallback((title: string, message?: string, action?: Toast['action']) =>
    showToast({ type: 'cart', title, message, action }), [showToast]);
  const wishlisted = useCallback((title: string) =>
    showToast({ type: 'wishlist', title, duration: 2500 }), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, success, error, info, cartAdded, wishlisted }}>
      {children}

      {/* Toast container — bottom-right */}
      <div
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastCard toast={toast} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
