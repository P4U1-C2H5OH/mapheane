import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, MapPin, Phone, Instagram, Facebook,
  ArrowRight, Check, Clock
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface Props { onNavigate: (page: any) => void; }

type InquiryType = 'Purchase' | 'Commission' | 'Workshop' | 'Press' | 'General';
const INQUIRY_TYPES: InquiryType[] = ['Purchase', 'Commission', 'Workshop', 'Press', 'General'];

export function ContactPage({ onNavigate }: Props) {
  useSEO({ title: 'Contact', description: 'Get in touch with Mapheane — for purchase inquiries, commissions, workshop bookings, and press.' });

  const [form, setForm]       = useState({ name: '', email: '', phone: '', type: '' as InquiryType | '', message: '', trap: '' });
  const [errors, setErrors]   = useState<Partial<typeof form>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [sendError, setSendError] = useState('');

  const update = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }));
    if ((errors as any)[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())  e.name  = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.message.trim()) e.message = 'Please write a message';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setSendError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          type: form.type || 'General',
          message: form.message,
          trap: form.trap,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Send failed');
      }
      setSent(true);
    } catch (err: any) {
      setSendError(err.message || 'Something went wrong. Please try emailing hello@mapheane.art directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-background min-h-screen pt-28 pb-24"
    >
      <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-6xl">

        <button onClick={() => onNavigate('home')}
          className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-10">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left: info */}
          <div className="lg:col-span-4">
            <motion.span
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4"
            >
              Get in Touch
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
              className="font-serif text-4xl sm:text-5xl italic text-charcoal mb-5"
              style={{ letterSpacing: '-0.015em', lineHeight: 1.05 }}
            >
              Let's begin<br />
              <em style={{ color: '#A0522D' }}>a conversation.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-muted leading-relaxed text-sm mb-10"
            >
              For purchase inquiries, commissions, workshop bookings, press, or anything else — Mapheane responds personally to every message within 48 hours.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <a href="mailto:hello@mapheane.art"
                className="flex items-center gap-3 text-sm text-charcoal/70 hover:text-terracotta transition-colors group">
                <div className="w-9 h-9 border border-charcoal/10 flex items-center justify-center group-hover:border-terracotta group-hover:bg-terracotta/5 transition-all duration-300">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                hello@mapheane.art
              </a>
              <div className="flex items-center gap-3 text-sm text-charcoal/50">
                <div className="w-9 h-9 border border-charcoal/10 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                +266 22 000 000
              </div>
              <div className="flex items-center gap-3 text-sm text-charcoal/50">
                <div className="w-9 h-9 border border-charcoal/10 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                Maseru, Kingdom of Lesotho
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex gap-3 mt-7"
            >
              {[
                { href: 'https://instagram.com/mapheane', Icon: Instagram, label: 'Instagram' },
                { href: 'https://facebook.com/mapheane',  Icon: Facebook,  label: 'Facebook'  },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 border border-charcoal/12 flex items-center justify-center text-charcoal/50 hover:bg-terracotta hover:text-white hover:border-terracotta transition-all duration-400"
                  aria-label={label}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </motion.div>

            {/* Response time + studio hours */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="mt-10 pt-8 border-t border-charcoal/6 space-y-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage" style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                  <span className="text-xs font-sans uppercase tracking-widest text-muted">Response time</span>
                </div>
                <p className="text-sm text-charcoal/70">Within 48 hours, personally.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-muted" />
                  <span className="text-xs font-sans uppercase tracking-widest text-muted">Studio hours</span>
                </div>
                <p className="text-sm text-charcoal/70">Mon–Sat · 9am–5pm SAST</p>
              </div>
            </motion.div>

            {/* Quick CTAs */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="mt-10 space-y-2"
            >
              <button onClick={() => onNavigate('commission')}
                className="flex items-center justify-between w-full px-4 py-3 border border-charcoal/10 text-sm text-muted hover:border-terracotta/30 hover:text-terracotta transition-all duration-300 group">
                <span>Commission a work</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => onNavigate('workshops')}
                className="flex items-center justify-between w-full px-4 py-3 border border-charcoal/10 text-sm text-muted hover:border-terracotta/30 hover:text-terracotta transition-all duration-300 group">
                <span>Book a workshop</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => onNavigate('presskit')}
                className="flex items-center justify-between w-full px-4 py-3 border border-charcoal/10 text-sm text-muted hover:border-terracotta/30 hover:text-terracotta transition-all duration-300 group">
                <span>Press &amp; media inquiries</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-16 h-16 bg-sage/12 flex items-center justify-center mb-7">
                    <Check className="w-7 h-7 text-sage" />
                  </div>
                  <h2 className="font-serif text-3xl italic text-charcoal mb-4">Message Received</h2>
                  <p className="text-muted leading-relaxed max-w-sm mb-2 text-sm">
                    Thank you, <strong className="text-charcoal font-sans">{form.name.split(' ')[0]}</strong>. Mapheane will respond to <em>{form.email}</em> within 48 hours.
                  </p>
                  <button onClick={() => onNavigate('gallery')}
                    className="mt-8 flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors">
                    Explore Gallery <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
                  {/* Honeypot — hidden from real users, bots fill this */}
                  <input name="trap" type="text" aria-hidden="true" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />

                  {/* Inquiry type */}
                  <div>
                    <p className="text-label uppercase tracking-widest text-muted mb-3">Inquiry type</p>
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

                  {/* Name + email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {[
                      { id: 'name',  label: 'Name',  type: 'text',  ph: 'Your name'      },
                      { id: 'email', label: 'Email', type: 'email', ph: 'your@email.com' },
                    ].map(({ id, label, type, ph }) => (
                      <div key={id} className="group">
                        <label className="block text-label uppercase tracking-widest text-muted mb-2 group-focus-within:text-terracotta transition-colors">
                          {label} <span className="text-terracotta">*</span>
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

                  {/* Phone */}
                  <div className="group">
                    <label className="block text-label uppercase tracking-widest text-muted mb-2 group-focus-within:text-terracotta transition-colors">
                      Phone <span className="text-muted/40">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="+266 or +27…"
                      className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-xl focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic"
                    />
                  </div>

                  {/* Message */}
                  <div className="group">
                    <label className="block text-label uppercase tracking-widest text-muted mb-2 group-focus-within:text-terracotta transition-colors">
                      Message <span className="text-terracotta">*</span>
                    </label>
                    <textarea
                      rows={6}
                      value={form.message}
                      onChange={e => update('message', e.target.value)}
                      placeholder="Write your message here…"
                      className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-xl focus:outline-none focus:border-terracotta transition-colors resize-none placeholder:text-charcoal/25 placeholder:italic"
                    />
                    {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <div className="flex-1">
                      <p className="text-xs text-muted/50 leading-relaxed max-w-xs">
                        Your information is used only to respond to your inquiry and is never shared.
                      </p>
                      {sendError && (
                        <p className="mt-2 text-xs text-red-600">{sendError}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex items-center gap-3 bg-terracotta text-white px-8 py-4 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-all duration-400 disabled:opacity-60 shadow-button hover:shadow-button-hover flex-shrink-0"
                    >
                      {sending
                        ? <div className="w-4 h-4 border border-white/50 border-t-white rounded-full animate-spin" />
                        : <><ArrowRight className="w-4 h-4" /> Send Message</>}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
