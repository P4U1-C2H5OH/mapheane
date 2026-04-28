import React, { useState } from 'react';
import { Instagram, Facebook, Mail, ArrowRight, MapPin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackInteraction } from '../lib/interactions';

interface FooterProps {
  onNavigate?: (page: any) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [trap,  setTrap]  = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subscribed) return;
    setSubscribing(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, trap }),
      });
      trackInteraction({
        action: 'newsletter_signup',
        targetType: 'newsletter',
        targetTitle: 'Studio Letters',
        source: 'footer',
        metadata: { email },
      });
    } catch {
      // Silently succeed — newsletter signup failure shouldn't block the user
    } finally {
      setSubscribing(false);
      setSubscribed(true);
      setEmail('');
    }
  };

  const navLinks = [
    { label: 'Portfolio',           page: 'gallery'      },
    { label: 'About',               page: 'about'        },
    { label: 'Moments',             page: 'moments'      },
    { label: 'Events',              page: 'events'       },
    { label: 'Commissions',         page: 'commission'   },
    { label: "Collector's Circle",  page: 'circle'       },
    { label: 'Studio Visit',        page: 'studio-visit' },
    { label: 'Contact',             page: 'contact'      },
    { label: 'Track Order',         page: 'track-order'  },
    { label: 'Press & CV',          page: 'presskit'     },
    { label: 'Workshops',           page: 'workshops'    },
    { label: 'Shop',                page: 'shop'         },
    { label: 'Certificate of Authenticity', page: 'certificate' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', page: 'privacy' },
    { label: 'Terms of Use',   page: 'terms'   },
  ];

  return (
    <footer className="bg-charcoal text-background/80 relative overflow-hidden">
      {/* Subtle grain on dark bg */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Terracotta top rule */}
      <div className="w-full h-px bg-terracotta/40" />

      <div className="relative z-10 container mx-auto px-6 md:px-12 max-w-7xl">

        {/* Upper section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 py-16 md:py-20 border-b border-white/8">

          {/* Brand column */}
          <div className="md:col-span-4">
            <button
              onClick={() => onNavigate?.('home')}
              className="font-serif text-5xl md:text-6xl italic text-background hover:text-gold transition-colors duration-500 block mb-4"
            >
              Mapheane
            </button>
            <p className="text-xs uppercase tracking-[0.25em] text-background/40 mb-6">
              Contemporary Artist · Lesotho
            </p>
            <div className="flex items-start gap-2 text-background/40 mb-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span className="text-xs leading-relaxed">
                Maseru, Kingdom of Lesotho<br />
                Southern Africa
              </span>
            </div>
            <a
              href="mailto:hello@mapheane.art"
              className="text-xs text-background/50 hover:text-gold transition-colors duration-300 flex items-center gap-2 mt-3"
            >
              <Mail className="w-3.5 h-3.5" />
              hello@mapheane.art
            </a>

            {/* Social links */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://instagram.com/mapheane"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/15 flex items-center justify-center text-background/50 hover:bg-terracotta hover:text-white hover:border-terracotta transition-all duration-400"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://facebook.com/mapheane"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/15 flex items-center justify-center text-background/50 hover:bg-terracotta hover:text-white hover:border-terracotta transition-all duration-400"
                aria-label="Facebook"
              >
                <Facebook size={15} />
              </a>
            </div>
          </div>

          {/* Navigation column */}
          <div className="md:col-span-3 md:col-start-6">
            <p className="text-xs uppercase tracking-[0.2em] text-background/35 mb-6">Navigate</p>
            <ul className="space-y-3">
              {navLinks.map(link => (
                <li key={link.page}>
                  <button
                    onClick={() => onNavigate?.(link.page)}
                    className="text-sm text-background/60 hover:text-gold transition-colors duration-300 link-underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div className="md:col-span-4 md:col-start-9">
            <p className="text-xs uppercase tracking-[0.2em] text-background/35 mb-3">Studio Letters</p>
            <p className="text-sm text-background/55 leading-relaxed mb-6 max-w-xs">
              First access to new work, studio moments, upcoming exhibitions, and the quiet stories behind each piece.
            </p>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-sage text-sm"
              >
                <div className="w-5 h-5 rounded-full bg-sage/20 flex items-center justify-center">
                  <span className="text-sage text-xs">✓</span>
                </div>
                <span>You're on the list. Welcome.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="group">
                {/* Honeypot */}
                <input name="trap" type="text" value={trap} onChange={e => setTrap(e.target.value)} aria-hidden="true" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
                <div className="relative border-b border-white/20 focus-within:border-gold transition-colors duration-400">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-transparent py-2 pr-10 text-sm text-background/80 placeholder:text-background/25 placeholder:italic outline-none"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-background/40 hover:text-gold transition-colors duration-300 disabled:opacity-50"
                    aria-label="Subscribe"
                  >
                    {subscribing ? (
                      <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-background/25 mt-2">No noise. Only studio.</p>
              </form>
            )}
          </div>
        </div>

        {/* Platform credits & editorial statement */}
        <div className="py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

            {/* Quote / mission */}
            <p className="font-serif italic text-sm text-background/30 max-w-sm">
              "To give meaning to one's life and life to one's senses."
            </p>

            {/* Legal & copyright */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <div className="flex gap-5">
                {legalLinks.map(link => (
                  <button
                    key={link.page}
                    onClick={() => onNavigate?.(link.page)}
                    className="text-xs text-background/25 hover:text-background/50 transition-colors duration-300 uppercase tracking-widest"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-background/20 tracking-wide">
                © {new Date().getFullYear()} Mapheane. All rights reserved.
              </p>
            </div>
          </div>

          {/* Latitudes / Artsy integration hint — future */}
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2">
            <span className="text-xs text-background/15 uppercase tracking-widest">Available on</span>
            <a
              href="https://latitudes.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-background/20 hover:text-background/40 transition-colors flex items-center gap-1"
            >
              Latitudes Online <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
