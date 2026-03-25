import { useEffect, useCallback, useRef } from 'react';

interface UseExitIntentOptions {
  onTrigger: () => void;
  delay?: number;       // ms before exit intent becomes active (default 8000)
  sensitivity?: number; // px from top to trigger (default 20)
  once?: boolean;       // only trigger once per session (default true)
  storageKey?: string;
}

export function useExitIntent({
  onTrigger,
  delay = 8000,
  sensitivity = 20,
  once = true,
  storageKey = 'mapheane_newsletter_shown',
}: UseExitIntentOptions) {
  const triggered = useRef(false);
  const ready     = useRef(false);
  const timer     = useRef<ReturnType<typeof setTimeout>>();

  const checkDismissed = useCallback(() => {
    if (!once) return false;
    try { return !!sessionStorage.getItem(storageKey); } catch { return false; }
  }, [once, storageKey]);

  const markDismissed = useCallback(() => {
    try { sessionStorage.setItem(storageKey, '1'); } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (checkDismissed()) return;

    // Activate after delay so it doesn't fire instantly
    timer.current = setTimeout(() => { ready.current = true; }, delay);

    const handleMouseOut = (e: MouseEvent) => {
      if (!ready.current || triggered.current) return;
      if (e.clientY > sensitivity) return;
      if ((e.target as HTMLElement)?.closest?.('a, button')) return;

      triggered.current = true;
      markDismissed();
      onTrigger();
    };

    // Fallback: trigger after 45s of inactivity on mobile
    const handleScroll = (() => {
      let lastY = 0;
      let idleTimer: ReturnType<typeof setTimeout>;
      return () => {
        const y = window.scrollY;
        if (Math.abs(y - lastY) > 50) {
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            if (!triggered.current && ready.current && !checkDismissed()) {
              triggered.current = true;
              markDismissed();
              onTrigger();
            }
          }, 45000);
          lastY = y;
        }
      };
    })();

    document.addEventListener('mouseleave', handleMouseOut, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer.current);
      document.removeEventListener('mouseleave', handleMouseOut);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onTrigger, delay, sensitivity, checkDismissed, markDismissed]);

  return { dismiss: markDismissed };
}
