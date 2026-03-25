import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Mail } from 'lucide-react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [email, setEmail]     = useState('');
  const [name,  setName]      = useState('');
  const [trap,  setTrap]      = useState('');
  const [sending, setSending] = useState(false);
  const [done,  setDone]      = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, trap }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Signup failed');
      }
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); }, 2800);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] bg-ink/55 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-x-4 bottom-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-[80] bg-background shadow-modal overflow-hidden"
          >
            {/* Terracotta top accent */}
            <div className="h-0.5 bg-terracotta" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-muted hover:text-charcoal hover:rotate-90 transition-all duration-300"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-7 sm:p-8">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="w-14 h-14 bg-sage/12 flex items-center justify-center mx-auto mb-5">
                      <Check className="w-7 h-7 text-sage" />
                    </div>
                    <p className="font-serif italic text-2xl text-charcoal mb-3">You're on the list.</p>
                    <p className="text-sm text-muted">
                      Expect new works, studio letters, and collector previews in your inbox — never more than twice a month.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Icon */}
                    <div className="w-10 h-10 bg-terracotta/10 flex items-center justify-center mb-5">
                      <Mail className="w-5 h-5 text-terracotta" />
                    </div>

                    <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-2">
                      Studio Letters
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl italic text-charcoal mb-2" style={{ letterSpacing: '-0.01em' }}>
                      First look at new works.
                    </h2>
                    <p className="text-sm text-muted leading-relaxed mb-7">
                      Collectors on the Studio Letters list see new works 48 hours before they're made public. 
                      No spam — just the work, the process, and the story behind it.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                      {/* Honeypot */}
                      <input name="trap" type="text" value={trap} onChange={e => setTrap(e.target.value)} aria-hidden="true" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
                      {/* Name */}
                      <div className="group">
                        <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
                          First name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Your name"
                          className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic"
                        />
                      </div>

                      {/* Email */}
                      <div className="group">
                        <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
                          Email address <span className="text-terracotta">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => { setEmail(e.target.value); setError(''); }}
                          placeholder="your@email.com"
                          required
                          className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic"
                        />
                        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-2">
                        <p className="text-xs text-muted/60 leading-relaxed max-w-[200px]">
                          Unsubscribe anytime. Never shared.
                        </p>
                        <button
                          type="submit"
                          disabled={sending}
                          className="flex items-center gap-2 bg-terracotta text-background px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors duration-400 disabled:opacity-60 shadow-button hover:shadow-button-hover flex-shrink-0"
                        >
                          {sending
                            ? <div className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full animate-spin" />
                            : <><ArrowRight className="w-3.5 h-3.5" /> Subscribe</>}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
