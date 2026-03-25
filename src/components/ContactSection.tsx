import React, { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ArrowRight, Mail, MapPin, Instagram, Facebook, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type InquiryType = 'Purchase' | 'Commission' | 'Workshop' | 'Press' | 'General';

const INQUIRY_TYPES: InquiryType[] = ['Purchase', 'Commission', 'Workshop', 'Press', 'General'];

export function ContactSection() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [form, setForm] = useState({ name: '', email: '', type: '' as InquiryType | '', message: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }));
    if ((errors as any)[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                              e.email   = 'Valid email required';
    if (!form.message.trim()) e.message = 'Please write a message';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1100));
    setSending(false);
    setSent(true);
  };

  return (
    <section id="contact" className="py-24 md:py-32 w-full bg-parchment/20 border-t border-charcoal/5 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 80% 50%, rgba(160,82,45,0.04) 0%, transparent 55%)' }} />

      <div ref={ref} className="relative z-10 container mx-auto px-6 md:px-12 max-w-6xl">

        {/* Header */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 transition-all duration-1000 ease-luxury ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          {/* Left: Info */}
          <div className="lg:col-span-4">
            <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6">Get in Touch</span>
            <h2 className="font-serif text-5xl md:text-6xl text-charcoal mb-6" style={{ letterSpacing: '-0.02em', lineHeight: '1.0' }}>
              Let's begin<br />
              <em className="italic text-terracotta">a conversation.</em>
            </h2>
            <p className="text-muted leading-relaxed text-sm mb-10">
              For inquiries about original works, commissions, workshops, press, or anything else — Mapheane responds personally to every message within 48 hours.
            </p>

            <div className="space-y-5">
              <a href="mailto:hello@mapheane.art"
                className="flex items-center gap-3 text-sm text-charcoal/70 hover:text-terracotta transition-colors group">
                <div className="w-8 h-8 border border-charcoal/10 flex items-center justify-center group-hover:border-terracotta group-hover:bg-terracotta/5 transition-all duration-300">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                hello@mapheane.art
              </a>
              <div className="flex items-center gap-3 text-sm text-charcoal/50">
                <div className="w-8 h-8 border border-charcoal/10 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                Maseru, Kingdom of Lesotho
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              {[
                { href: 'https://instagram.com/mapheane', Icon: Instagram, label: 'Instagram' },
                { href: 'https://facebook.com/mapheane',  Icon: Facebook,  label: 'Facebook'  },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 border border-charcoal/12 flex items-center justify-center text-charcoal/50 hover:bg-terracotta hover:text-white hover:border-terracotta transition-all duration-400"
                  aria-label={label}>
                  <Icon size={15} />
                </a>
              ))}
            </div>

            {/* Response time promise */}
            <div className="mt-10 pt-8 border-t border-charcoal/6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-soft" />
                <span className="text-xs font-sans uppercase tracking-widest text-muted">Response time</span>
              </div>
              <p className="text-sm text-charcoal/70">Within 48 hours, personally.</p>
            </div>
          </div>

          {/* Right: Form */}
          <div className={`lg:col-span-8 transition-all duration-1000 delay-200 ease-luxury ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="h-full flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-16 h-16 bg-sage/12 flex items-center justify-center mb-7">
                    <Check className="w-7 h-7 text-sage" />
                  </div>
                  <h3 className="font-serif text-3xl italic text-charcoal mb-4">Message Received</h3>
                  <p className="text-muted leading-relaxed max-w-sm mb-2">
                    Thank you, <strong className="text-charcoal font-sans font-500">{form.name.split(' ')[0]}</strong>. Mapheane will respond to <em>{form.email}</em> within 48 hours.
                  </p>
                  <p className="text-xs text-muted/50 mt-4">In the meantime, explore the gallery or browse print editions.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                  noValidate
                >
                  {/* Inquiry type */}
                  <div>
                    <p className="text-label uppercase tracking-widest text-muted mb-3">Inquiry Type</p>
                    <div className="flex flex-wrap gap-2">
                      {INQUIRY_TYPES.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => update('type', type)}
                          className={`text-xs font-sans px-4 py-2 border transition-all duration-200 ${
                            form.type === type
                              ? 'bg-terracotta text-white border-terracotta'
                              : 'border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { id: 'name',  label: 'Name',  type: 'text',  ph: 'Your name'       },
                      { id: 'email', label: 'Email', type: 'email', ph: 'your@email.com'  },
                    ].map(({ id, label, type, ph }) => (
                      <div key={id} className="group">
                        <label className="block text-label uppercase tracking-widest text-muted mb-2 group-focus-within:text-terracotta transition-colors">
                          {label}
                        </label>
                        <input
                          type={type}
                          value={(form as any)[id]}
                          onChange={e => update(id, e.target.value)}
                          placeholder={ph}
                          className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-xl focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic"
                        />
                        {(errors as any)[id] && (
                          <p className="text-xs text-red-400 mt-1">{(errors as any)[id]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Message */}
                  <div className="group">
                    <label className="block text-label uppercase tracking-widest text-muted mb-2 group-focus-within:text-terracotta transition-colors">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => update('message', e.target.value)}
                      placeholder="Write your message here…"
                      className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-xl focus:outline-none focus:border-terracotta transition-colors resize-none placeholder:text-charcoal/25 placeholder:italic"
                    />
                    {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-muted/50 max-w-xs leading-relaxed">
                      Your information is used only to respond to your inquiry and is never shared.
                    </p>
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex items-center gap-3 bg-terracotta text-white px-8 py-4 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-all duration-400 disabled:opacity-60 shadow-button hover:shadow-button-hover"
                    >
                      {sending
                        ? <div className="w-4 h-4 border border-white/50 border-t-white rounded-full animate-spin" />
                        : <><ArrowRight className="w-4 h-4" /> Send Message</>
                      }
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
