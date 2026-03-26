import React, { useEffect, useState, useRef } from 'react';
import { Menu, X, User as UserIcon, LogOut, ShoppingBag, Heart, Settings, Search } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { CartIcon } from './CartIcon';
import { CurrencySwitcher } from './CurrencySwitcher';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

interface NavigationProps {
  onNavigate?: (page: any) => void;
  onSearchOpen?: () => void;
}

export function Navigation({ onNavigate, onSearchOpen }: NavigationProps) {
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMenuOpen, setIsMenuOpen]       = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { count: wishlistCount }          = useWishlist();
  const userMenuRef                       = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Keyboard shortcut: Cmd/Ctrl+K opens search
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearchOpen?.();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onSearchOpen]);

  const handleNavClick = (page: string) => {
    setIsMenuOpen(false);
    onNavigate?.(page);
  };

  const menuLinks: { name: string; page: string }[] = [
    { name: 'Gallery',      page: 'gallery'      },
    { name: 'About',        page: 'about'        },
    { name: 'Moments',      page: 'moments'      },
    { name: 'Events',       page: 'events'       },
    { name: 'Commissions',  page: 'commission'   },
    { name: 'Workshops',    page: 'workshops'    },
    { name: 'Studio Visit', page: 'studio-visit' },
    { name: 'Shop',         page: 'shop'         },
    { name: 'Circle',       page: 'circle'       },
    { name: 'Contact',      page: 'contact'      },
  ];

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    onNavigate?.('home');
  };

  return (
    <>
      {/* Scroll progress */}
      <motion.div
        style={{ width: progressWidth }}
        className="fixed top-0 left-0 h-px bg-terracotta/60 z-[100] origin-left"
      />

      {/* Main nav bar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-luxury ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-charcoal/6 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-5 sm:px-8 md:px-12 flex items-center justify-between">

          {/* Left — desktop nav links */}
          <div className="hidden md:flex items-center gap-6 w-1/3">
            {['gallery', 'about', 'shop'].map(p => (
              <button
                key={p}
                onClick={() => onNavigate?.(p === 'gallery' ? 'gallery' : p === 'about' ? 'about' : 'shop')}
                className="text-label uppercase text-muted tracking-[0.25em] hover:text-terracotta transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Centre — wordmark */}
          <div className="flex justify-start md:justify-center flex-1 md:w-1/3">
            <button
              onClick={() => { onNavigate?.('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="font-serif text-3xl italic text-charcoal hover:text-terracotta transition-colors duration-400"
              style={{ letterSpacing: '-0.02em' }}
              aria-label="Mapheane — home"
            >
              Mapheane
            </button>
          </div>

          {/* Right — actions */}
          <div className="flex justify-end items-center gap-1 md:gap-2 md:w-1/3">

            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="p-2 text-charcoal/60 hover:text-terracotta transition-colors group relative"
              aria-label="Search (⌘K)"
              title="Search ⌘K"
            >
              <Search className="w-[18px] h-[18px] stroke-[1.5]" />
            </button>

            {/* Currency switcher — hidden on small mobile */}
            <div className="hidden sm:block">
              <CurrencySwitcher />
            </div>

            {/* Language toggle — hidden on small mobile */}
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* Cart */}
            <CartIcon onClick={() => onNavigate?.('cart')} />

            {/* Wishlist */}
            {wishlistCount > 0 && (
              <button
                onClick={() => onNavigate?.('wishlist')}
                className="relative p-2 text-charcoal/60 hover:text-terracotta transition-colors"
                aria-label={`Wishlist (${wishlistCount})`}
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta text-white text-[9px] font-sans font-500 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              </button>
            )}

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(o => !o)}
                className="flex items-center gap-2 text-charcoal hover:text-terracotta transition-colors p-2"
                aria-label="Account menu"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border border-charcoal/15 object-cover" />
                ) : (
                  <div className="w-7 h-7 bg-terracotta text-white flex items-center justify-center text-xs font-sans font-500">
                    {isAuthenticated ? user?.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-sans uppercase tracking-widest text-muted">
                  {isAuthenticated ? user?.name?.split(' ')[0] : 'Account'}
                </span>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-3 w-52 bg-background border border-charcoal/8 shadow-modal z-50"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-charcoal/6">
                          <p className="text-xs font-sans font-500 text-charcoal">{user?.name}</p>
                          <p className="text-xs text-muted truncate">{user?.email}</p>
                        </div>
                        {[
                          { icon: ShoppingBag, label: 'My Orders',   action: () => onNavigate?.('cart'),    show: true },
                          { icon: Heart,       label: 'Saved Works', action: () => onNavigate?.('wishlist'), show: true },
                          { icon: Settings,    label: 'Admin',       action: () => onNavigate?.('admin'),   show: user?.role === 'admin' || user?.role === 'artist' },
                        ].filter(item => item.show).map(({ icon: Icon, label, action }) => (
                          <button key={label} onClick={() => { setIsUserMenuOpen(false); action(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/70 hover:bg-parchment/40 hover:text-terracotta transition-colors text-left">
                            <Icon className="w-4 h-4 flex-shrink-0" />{label}
                          </button>
                        ))}
                        <div className="border-t border-charcoal/6 mt-1">
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:bg-parchment/40 hover:text-terracotta transition-colors text-left">
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); onNavigate?.('auth'); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-charcoal/70 hover:bg-parchment/40 hover:text-terracotta transition-colors text-left"
                        >
                          <UserIcon className="w-4 h-4" /> Sign in
                        </button>
                        <div className="border-t border-charcoal/6 px-4 py-3">
                          <p className="text-xs text-muted">New? Orders and wishlist are saved to your account.</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-charcoal/70 hover:text-terracotta transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Full-screen overlay menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
            className="fixed inset-0 z-[60] bg-ink flex flex-col overflow-hidden"
          >
            {/* Gold grain overlay */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
              className="absolute left-0 top-0 bottom-0 w-px bg-terracotta/40 origin-top"
            />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start px-6 sm:px-8 md:px-14 pt-6 sm:pt-8">
              <button
                onClick={() => { setIsMenuOpen(false); onNavigate?.('home'); }}
                className="font-serif text-2xl italic text-background/60 hover:text-gold transition-colors duration-400"
              >
                Mapheane
              </button>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-background/50 hover:text-background hover:rotate-90 transition-all duration-500"
                aria-label="Close menu"
              >
                <X className="w-7 h-7 stroke-[1]" />
              </button>
            </div>

            {/* Menu items */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-8 md:px-14 overflow-y-auto">
              <ul className="space-y-0.5 py-4">
                {menuLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 + 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <button
                      onClick={() => handleNavClick(link.page)}
                      className="group flex items-baseline gap-4 py-2.5 w-full text-left"
                    >
                      <span className="text-label text-background/20 group-hover:text-terracotta transition-colors duration-300 w-5 text-right tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-serif text-3xl sm:text-4xl md:text-5xl italic text-background/70 group-hover:text-background transition-colors duration-300 leading-tight capitalize">
                        {link.name}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>

              {/* Mobile-only: currency + language toggles */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="flex items-center gap-4 mt-4 sm:hidden"
              >
                <CurrencySwitcher className="[&_button]:text-background/50 [&_button]:hover:text-background" />
                <LanguageToggle className="[&_button]:border-background/15 [&_button.bg-charcoal]:bg-background/15 [&_button]:text-background/50" />
              </motion.div>
            </div>

            {/* Footer info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="relative z-10 px-6 sm:px-8 md:px-14 pb-8 sm:pb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4"
            >
              <div>
                <p className="text-label uppercase tracking-[0.25em] text-background/30 mb-1.5">Studio</p>
                <p className="text-sm text-background/50">Maseru, Lesotho · Southern Africa</p>
              </div>
              <div className="sm:text-right">
                <p className="text-label uppercase tracking-[0.25em] text-background/30 mb-1.5">Contact</p>
                <a
                  href="mailto:hello@mapheane.art"
                  className="font-serif text-lg italic text-background/60 hover:text-gold transition-colors"
                >
                  hello@mapheane.art
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
