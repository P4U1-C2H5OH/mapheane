import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle } from 'lucide-react';
import { Artwork } from '../data/artworks';
import { useToast } from '../context/ToastContext';

interface CommissionModalProps {
  prefillArtwork?: Artwork | null;
  onClose: () => void;
  onNavigateCommission?: () => void;
}

type Step = 'form' | 'sent';

export function CommissionModal({ prefillArtwork, onClose, onNavigateCommission }: CommissionModalProps) {
  const { success } = useToast();
  const [step, setStep] = useState<Step>('form');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    vision: prefillArtwork
      ? `I am interested in commissioning a work similar to "${prefillArtwork.title}" (${prefillArtwork.medium}).`
      : '',
    budget: '',
    medium: prefillArtwork?.medium || '',
    trap: '',
  });

  const mediumOptions = ['Painting', 'Drawing', 'Clay / Sculpture', 'Mixed Media', 'Open to suggestion'];
  const budgetOptions = [
    'Under R5,000',
    'R5,000 – R15,000',
    'R15,000 – R40,000',
    'R40,000 – R80,000',
    'R80,000+',
    'Let\'s discuss',
  ];

  const update = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          type: 'Commission',
          message: form.vision,
          budget: form.budget,
          medium: form.medium,
          trap: form.trap,
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      setStep('sent');
      success('Inquiry received', 'Mapheane will respond within 48 hours.');
    } catch {
      success('Send failed', 'Please email hello@mapheane.art directly.');
    } finally {
      setSending(false);
    }
  };

  // Lock scroll
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="cm-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-ink/55 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        key="cm-panel"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl top-1/2 -translate-y-1/2 z-[80] bg-background overflow-hidden shadow-modal"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Terracotta top accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-terracotta/60 via-terracotta to-terracotta/60" />

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 2px)' }}>
          <div className="p-7 md:p-9">

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-2">
                  Commission Inquiry
                </span>
                <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
                  {prefillArtwork
                    ? `Something like "${prefillArtwork.title}"`
                    : 'Begin a Commission'}
                </h2>
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  This inquiry is non-binding. Mapheane will respond within 48 hours with a personal quote.
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center text-muted hover:text-charcoal hover:rotate-90 transition-all duration-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 'form' ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Honeypot */}
                  <input name="trap" type="text" aria-hidden="true" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { id: 'name',  label: 'Your Name',  type: 'text',  placeholder: 'Full name',         required: true },
                      { id: 'email', label: 'Email',       type: 'email', placeholder: 'your@email.com',    required: true },
                    ].map(({ id, label, type, placeholder, required }) => (
                      <div key={id} className="group">
                        <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-2">
                          {label}
                        </label>
                        <input
                          type={type}
                          required={required}
                          value={(form as any)[id]}
                          onChange={e => update(id, e.target.value)}
                          placeholder={placeholder}
                          className="input-editorial text-base"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Medium */}
                  <div className="group">
                    <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-3">
                      Preferred Medium
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {mediumOptions.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => update('medium', opt)}
                          className={`text-xs font-sans px-3 py-1.5 border transition-all duration-200 ${
                            form.medium === opt
                              ? 'bg-terracotta text-white border-terracotta'
                              : 'border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="group">
                    <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-3">
                      Budget Range (ZAR)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {budgetOptions.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => update('budget', opt)}
                          className={`text-xs font-sans px-3 py-1.5 border transition-all duration-200 ${
                            form.budget === opt
                              ? 'bg-charcoal text-background border-charcoal'
                              : 'border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vision */}
                  <div className="group">
                    <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-2">
                      Your Vision
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={form.vision}
                      onChange={e => update('vision', e.target.value)}
                      placeholder="Describe what you have in mind — subject, mood, size, where it will live, any references…"
                      className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal focus:outline-none focus:border-terracotta transition-colors font-serif text-base resize-none placeholder:text-charcoal/30 placeholder:italic"
                    />
                    <p className="text-xs text-muted/50 mt-1">No commitment required. The more detail, the better Mapheane can quote accurately.</p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={sending || !form.name || !form.email || !form.vision}
                    className="w-full flex items-center justify-center gap-3 bg-terracotta text-white py-4 text-xs font-sans uppercase tracking-[0.25em] hover:bg-terracottaDark transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-button hover:shadow-button-hover"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border border-white/60 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Inquiry
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Full page CTA */}
                  {onNavigateCommission && (
                    <p className="text-center text-xs text-muted">
                      Want to learn more first?{' '}
                      <button
                        type="button"
                        onClick={() => { onClose(); onNavigateCommission(); }}
                        className="text-terracotta underline underline-offset-2 hover:no-underline transition-all"
                      >
                        See the full commission page
                      </button>
                    </p>
                  )}
                </motion.form>
              ) : (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-sage/12 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-sage" />
                  </div>
                  <h3 className="font-serif text-2xl italic text-charcoal mb-3">Inquiry Received</h3>
                  <p className="text-muted leading-relaxed mb-2 max-w-sm mx-auto">
                    Thank you, <strong className="text-charcoal font-sans font-500">{form.name.split(' ')[0]}</strong>.
                    Mapheane will review your vision and respond personally within 48 hours.
                  </p>
                  <p className="text-xs text-muted/60 mb-8">A confirmation has been sent to {form.email}</p>
                  <button
                    onClick={onClose}
                    className="text-xs font-sans uppercase tracking-[0.25em] text-charcoal border-b border-charcoal/20 pb-px hover:border-terracotta hover:text-terracotta transition-all duration-300"
                  >
                    Continue Exploring
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
