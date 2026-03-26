import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Contexts
import { CartProvider }     from './context/CartContext';
import { AuthProvider }     from './context/AuthContext';
import { ToastProvider }    from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';

// Hooks
import { useExitIntent }    from './hooks/useExitIntent';

// Layout
import { Navigation }       from './components/Navigation';
import { Footer }           from './components/Footer';
import { ScrollToTop }      from './components/ScrollToTop';
import { SearchOverlay }    from './components/SearchOverlay';
import { NewsletterModal }  from './components/NewsletterModal';
import { CookieBanner }     from './components/CookieBanner';

// Home sections
import { HeroSection }          from './components/HeroSection';
import { AboutSection }         from './components/AboutSection';
import { GallerySection }       from './components/GallerySection';
import { MarqueeSection }       from './components/MarqueeSection';
import { ArtistMomentsSection } from './components/ServicesSection';
import { EventsSection }        from './components/EventsSection';
import { ContactSection }       from './components/ContactSection';
import { TestimonialsSection }  from './components/TestimonialsSection';

// Pages
import { AboutPage }            from './pages/AboutPage';
import { ArtworkPage }          from './pages/ArtworkPage';
import { GalleryPage }          from './pages/GalleryPage';
import { CartPage }             from './pages/CartPage';
import { CheckoutPage }         from './pages/CheckoutPage';
import { MomentsPage }          from './pages/MomentsPage';
import { MomentDetailPage }     from './pages/MomentDetailPage';
import { EventsPage }           from './pages/EventsPage';
import { EventDetailPage }      from './pages/EventDetailPage';
import { AuthPage }             from './pages/AuthPage';
import { AdminDashboard }       from './pages/AdminDashboard';
import { CommissionPage }       from './pages/CommissionPage';
import { WorkshopsPage }        from './pages/WorkshopsPage';
import { ShopPage }             from './pages/ShopPage';
import { WishlistPage }         from './pages/WishlistPage';
import { NotFoundPage }         from './pages/NotFoundPage';
import { PrivacyPage }          from './pages/PrivacyPage';
import { TermsPage }            from './pages/TermsPage';
import { CollectorCirclePage }  from './pages/CollectorCirclePage';
import { PressKitPage }         from './pages/PressKitPage';
import { ContactPage }          from './pages/ContactPage';
import { OrderTrackingPage }    from './pages/OrderTrackingPage';
import { StudioVisitPage }      from './pages/StudioVisitPage';
import { CertificatePage }      from './pages/CertificatePage';

export type PageName =
  | 'home' | 'about' | 'artwork' | 'gallery'
  | 'cart' | 'checkout' | 'wishlist'
  | 'moments' | 'moment-detail'
  | 'events' | 'event-detail'
  | 'commission' | 'workshops' | 'shop'
  | 'circle' | 'presskit' | 'contact' | 'track-order'
  | 'studio-visit' | 'certificate'
  | 'auth' | 'admin'
  | 'privacy' | 'terms' | '404';

const pv = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1,  y: 0  },
  exit:    { opacity: 0,  y: -6 },
};
const pt = { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] };

// ── Inner app (needs context access for useExitIntent) ────────────────────────
function AppInner() {
  const [page,       setPage]       = useState<PageName>('home');
  const [artworkId,  setArtworkId]  = useState<string | null>(null);
  const [momentId,   setMomentId]   = useState<string | null>(null);
  const [eventId,    setEventId]    = useState<string | null>(null);
  const [certRef,    setCertRef]    = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const go = (p: PageName) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goArtwork     = (id: string) => { setArtworkId(id); go('artwork'); };
  const goMoment      = (id: string) => { setMomentId(id);  go('moment-detail'); };
  const goEvent       = (id: string) => { setEventId(id);   go('event-detail'); };
  const goCertificate = (ref: string) => { setCertRef(ref); go('certificate'); };

  const isAdmin = page === 'admin';

  // Exit intent → newsletter modal (suppressed in admin)
  useExitIntent({ onTrigger: () => { if (!isAdmin) setNewsletter(true); }, delay: 10000 });

  return (
    <div className="min-h-screen bg-background text-charcoal overflow-x-hidden selection:bg-terracotta/15 selection:text-terracotta">

      {/* Global overlays */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={go}
        onSelectArtwork={goArtwork}
        onSelectMoment={goMoment}
        onSelectEvent={goEvent}
      />
      {!isAdmin && <NewsletterModal isOpen={newsletter} onClose={() => setNewsletter(false)} />}
      {!isAdmin && <CookieBanner onNavigate={go} />}

      {/* Navigation */}
      {!isAdmin && (
        <Navigation
          onNavigate={go}
          onSearchOpen={() => setSearchOpen(true)}
        />
      )}

      {/* Page content */}
      <main>
        <AnimatePresence mode="wait">

          {/* ── HOME ── */}
          {page === 'home' && (
            <motion.div key="home" variants={pv} initial="initial" animate="animate" exit="exit" transition={pt}>
              <HeroSection />
              <AboutSection onNavigate={go} />
              <GallerySection onSelectArtwork={goArtwork} onViewFullGallery={() => go('gallery')} />
              <MarqueeSection />
              <TestimonialsSection />
              <ArtistMomentsSection onNavigate={go} />
              <EventsSection onNavigate={go} onSelectEvent={goEvent} />
              <ContactSection />
            </motion.div>
          )}

          {/* ── PUBLIC PAGES ── */}
          {page === 'gallery'       && <GalleryPage       key="gallery"       onNavigate={go} onSelectArtwork={goArtwork} />}
          {page === 'artwork'       && <ArtworkPage        key="artwork"       artworkId={artworkId!} onNavigate={go} />}
          {page === 'about'         && <AboutPage          key="about"         onNavigate={go} />}
          {page === 'cart'          && <CartPage           key="cart"          onNavigate={go} />}
          {page === 'checkout'      && <CheckoutPage       key="checkout"      onNavigate={go} />}
          {page === 'moments'       && <MomentsPage        key="moments"       onNavigate={go} onSelectMoment={goMoment} />}
          {page === 'moment-detail' && <MomentDetailPage   key="moment-detail" momentId={momentId!} onNavigate={go} onSelectMoment={goMoment} />}
          {page === 'events'        && <EventsPage         key="events"        onNavigate={go} onSelectEvent={goEvent} />}
          {page === 'event-detail'  && <EventDetailPage    key="event-detail"  eventId={eventId!} onNavigate={go} onSelectEvent={goEvent} />}
          {page === 'commission'    && <CommissionPage      key="commission"    onNavigate={go} />}
          {page === 'workshops'     && <WorkshopsPage       key="workshops"     onNavigate={go} />}
          {page === 'shop'          && <ShopPage            key="shop"          onNavigate={go} />}
          {page === 'wishlist'      && <WishlistPage        key="wishlist"      onNavigate={go} onSelectArtwork={goArtwork} />}
          {page === 'contact'       && <ContactPage         key="contact"       onNavigate={go} />}
          {page === 'track-order'   && <OrderTrackingPage   key="track-order"   onNavigate={go} onViewCertificate={goCertificate} />}
          {page === 'circle'        && <CollectorCirclePage key="circle"        onNavigate={go} />}
          {page === 'presskit'      && <PressKitPage        key="presskit"      onNavigate={go} />}
          {page === 'studio-visit'  && <StudioVisitPage     key="studio-visit"  onNavigate={go} />}
          {page === 'certificate'   && <CertificatePage     key="certificate"   onNavigate={go} orderRef={certRef ?? undefined} />}

          {/* ── LEGAL ── */}
          {page === 'privacy'  && <PrivacyPage  key="privacy"  onNavigate={go} />}
          {page === 'terms'    && <TermsPage    key="terms"    onNavigate={go} />}

          {/* ── AUTH / ADMIN ── */}
          {page === 'auth'  && <AuthPage       key="auth"  onNavigate={go} />}
          {page === 'admin' && <AdminDashboard key="admin" onNavigate={go} />}

          {/* ── 404 ── */}
          {page === '404'   && <NotFoundPage key="404" onNavigate={go} />}

        </AnimatePresence>
      </main>

      {/* Footer + scroll-to-top */}
      {!isAdmin && <Footer onNavigate={go} />}
      <ScrollToTop />
    </div>
  );
}

// ── Error boundary — catches render crashes after bad deployments ─────────────
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  handleReset = () => {
    // Clear all persisted app state that could be incompatible with a new build
    ['mapheane-cart', 'mapheane-cart-v2', 'mapheane_wishlist', 'mapheane-user'].forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
    // Clear Supabase session keys
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-'))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', flexDirection: 'column', gap: 16,
          background: '#FAF7F2', fontFamily: 'DM Sans, sans-serif',
        }}>
          <p style={{ color: '#9E9890', fontSize: 13, letterSpacing: '0.05em' }}>
            Something went wrong loading the studio.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: '#A0522D', color: '#FAF7F2', border: 'none',
              padding: '10px 28px', cursor: 'pointer', fontSize: 11,
              letterSpacing: '0.15em', textTransform: 'uppercase',
            }}
          >
            Clear data &amp; reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Root: wrap all providers ───────────────────────────────────────────────────
export function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CurrencyProvider>
              <LanguageProvider>
                <ToastProvider>
                  <AppInner />
                </ToastProvider>
              </LanguageProvider>
            </CurrencyProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
