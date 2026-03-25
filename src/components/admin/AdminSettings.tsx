import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Check, Phone, Mail, MapPin, CreditCard, Truck,
  Globe, Bell, Shield, ChevronDown, ChevronUp
} from 'lucide-react';

interface Section { id: string; label: string; icon: React.ComponentType<{className?: string}>; }

const SECTIONS: Section[] = [
  { id: 'studio',    label: 'Studio Details',       icon: MapPin      },
  { id: 'payment',   label: 'Payment Numbers',       icon: CreditCard  },
  { id: 'shipping',  label: 'Shipping Rates (ZAR)',  icon: Truck       },
  { id: 'commission',label: 'Commission Settings',   icon: Globe       },
  { id: 'email',     label: 'Email & Notifications', icon: Bell        },
  { id: 'security',  label: 'Account Security',      icon: Shield      },
];

function Field({ label, value, onChange, type = 'text', placeholder, hint, prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; prefix?: string;
}) {
  return (
    <div className="group">
      <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-0">
        {prefix && (
          <span className="bg-parchment/60 border border-r-0 border-charcoal/12 px-3 py-2.5 text-sm text-muted flex-shrink-0">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent border border-charcoal/12 px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25 ${prefix ? '' : ''}`}
        />
      </div>
      {hint && <p className="text-xs text-muted/60 mt-1">{hint}</p>}
    </div>
  );
}

function Accordion({ section, isOpen, onToggle, children }: {
  section: Section; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  const Icon = section.icon;
  return (
    <div className="bg-background border border-charcoal/8 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-parchment/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-terracotta/8 flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-terracotta" />
          </div>
          <p className="font-sans font-500 text-sm text-charcoal">{section.label}</p>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-2 border-t border-charcoal/6 space-y-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminSettings() {
  const [open, setOpen] = useState<string>('studio');
  const [saved, setSaved] = useState<string | null>(null);

  const [studio, setStudio] = useState({
    name: 'Mapheane',
    email: 'hello@mapheane.art',
    phone: '+266 22 000 000',
    address: 'Studio 4, Kingsway Arts Quarter, Maseru CBD',
    city: 'Maseru',
    country: 'Kingdom of Lesotho',
    instagram: '@mapheane_art',
    facebook: 'facebook.com/mapheane',
    studioHours: 'Mon–Sat 9am–5pm SAST',
  });

  const [payment, setPayment] = useState({
    mpesaName: 'Mapheane Arts Studio',
    mpesaNumber: '+266 5912 3456',
    ecocashName: 'Mapheane Arts',
    ecocashNumber: '+266 5878 9012',
  });

  const [shipping, setShipping] = useState({
    maseru: '150',
    lesotho: '280',
    southAfrica: '450',
    international: '950',
  });

  const [commission, setCommission] = useState({
    slotsTotal: '4',
    slotsTaken: '1',
    status: 'open' as 'open' | 'waitlist' | 'closed',
    depositPct: '50',
    responseHours: '48',
  });

  const [email, setEmail] = useState({
    orderEmail: 'hello@mapheane.art',
    replyTo: 'hello@mapheane.art',
    orderSubject: 'New order — [REF]',
    contactSubject: '[TYPE] inquiry from [NAME]',
    newsletterFrom: 'Studio Letters <studio@mapheane.art>',
  });

  const handleSave = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  const SaveBtn = ({ section }: { section: string }) => (
    <button
      onClick={() => handleSave(section)}
      className={`flex items-center gap-2 px-5 py-2.5 text-xs font-sans uppercase tracking-widest transition-all ${
        saved === section
          ? 'bg-sage text-background'
          : 'bg-terracotta text-background hover:bg-terracottaDark shadow-button'
      }`}
    >
      {saved === section ? <><Check className="w-3.5 h-3.5" /> Saved</> : <><Save className="w-3.5 h-3.5" /> Save</>}
    </button>
  );

  const toggle = (id: string) => setOpen(o => o === id ? '' : id);

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Admin</span>
        <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>Studio Settings</h2>
        <p className="text-xs text-muted mt-1.5 leading-relaxed">
          These values are used as defaults throughout the platform. When backend is connected, changes here will update the database.
        </p>
      </div>

      <div className="space-y-2">

        {/* Studio Details */}
        <Accordion section={SECTIONS[0]} isOpen={open === 'studio'} onToggle={() => toggle('studio')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Artist Name"     value={studio.name}        onChange={v => setStudio(s => ({...s, name: v}))}        placeholder="Mapheane" />
            <Field label="Public Email"    value={studio.email}       onChange={v => setStudio(s => ({...s, email: v}))}       type="email" placeholder="hello@mapheane.art" />
            <Field label="Phone"           value={studio.phone}       onChange={v => setStudio(s => ({...s, phone: v}))}       placeholder="+266 22 000 000" />
            <Field label="Studio Hours"    value={studio.studioHours} onChange={v => setStudio(s => ({...s, studioHours: v}))} placeholder="Mon–Sat 9am–5pm" />
            <div className="sm:col-span-2">
              <Field label="Studio Address" value={studio.address} onChange={v => setStudio(s => ({...s, address: v}))} placeholder="Address line" />
            </div>
            <Field label="City"     value={studio.city}    onChange={v => setStudio(s => ({...s, city: v}))}    placeholder="Maseru" />
            <Field label="Country"  value={studio.country} onChange={v => setStudio(s => ({...s, country: v}))} placeholder="Kingdom of Lesotho" />
            <Field label="Instagram" value={studio.instagram} onChange={v => setStudio(s => ({...s, instagram: v}))} placeholder="@mapheane_art" />
            <Field label="Facebook"  value={studio.facebook}  onChange={v => setStudio(s => ({...s, facebook: v}))}  placeholder="facebook.com/mapheane" />
          </div>
          <div className="pt-2 flex justify-end"><SaveBtn section="studio" /></div>
        </Accordion>

        {/* Payment Numbers */}
        <Accordion section={SECTIONS[1]} isOpen={open === 'payment'} onToggle={() => toggle('payment')}>
          <div className="space-y-4">
            <p className="text-xs text-muted bg-parchment/60 border border-charcoal/8 p-3 leading-relaxed">
              These numbers are shown to customers on the checkout page. Keep them up to date — incorrect numbers will cause failed payments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="M-Pesa Account Name"   value={payment.mpesaName}     onChange={v => setPayment(p => ({...p, mpesaName: v}))}     placeholder="Mapheane Arts Studio" />
              <Field label="M-Pesa Number"         value={payment.mpesaNumber}   onChange={v => setPayment(p => ({...p, mpesaNumber: v}))}   placeholder="+266 5912 3456" />
              <Field label="EcoCash Account Name"  value={payment.ecocashName}   onChange={v => setPayment(p => ({...p, ecocashName: v}))}   placeholder="Mapheane Arts" />
              <Field label="EcoCash Number"        value={payment.ecocashNumber} onChange={v => setPayment(p => ({...p, ecocashNumber: v}))} placeholder="+266 5878 9012" />
            </div>
          </div>
          <div className="pt-2 flex justify-end"><SaveBtn section="payment" /></div>
        </Accordion>

        {/* Shipping Rates */}
        <Accordion section={SECTIONS[2]} isOpen={open === 'shipping'} onToggle={() => toggle('shipping')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Maseru (city)"         value={shipping.maseru}        onChange={v => setShipping(s => ({...s, maseru: v}))}        type="number" prefix="R" placeholder="150" />
            <Field label="Other Lesotho"         value={shipping.lesotho}       onChange={v => setShipping(s => ({...s, lesotho: v}))}       type="number" prefix="R" placeholder="280" />
            <Field label="South Africa"          value={shipping.southAfrica}   onChange={v => setShipping(s => ({...s, southAfrica: v}))}   type="number" prefix="R" placeholder="450" />
            <Field label="International (DHL)"  value={shipping.international} onChange={v => setShipping(s => ({...s, international: v}))} type="number" prefix="R" placeholder="950" />
          </div>
          <p className="text-xs text-muted">All rates in ZAR. Displayed in customer's chosen currency on checkout.</p>
          <div className="pt-2 flex justify-end"><SaveBtn section="shipping" /></div>
        </Accordion>

        {/* Commission Settings */}
        <Accordion section={SECTIONS[3]} isOpen={open === 'commission'} onToggle={() => toggle('commission')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-label uppercase tracking-widest text-muted mb-1.5">Commission Status</p>
              <div className="flex gap-2">
                {(['open','waitlist','closed'] as const).map(s => (
                  <button key={s} onClick={() => setCommission(c => ({...c, status: s}))}
                    className={`text-xs font-sans px-3 py-2 border transition-all capitalize ${
                      commission.status === s ? 'bg-charcoal text-background border-charcoal' : 'border-charcoal/15 text-muted hover:border-charcoal/25'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Total Slots per Quarter" value={commission.slotsTotal} onChange={v => setCommission(c => ({...c, slotsTotal: v}))} type="number" placeholder="4" />
            <Field label="Slots Currently Taken"   value={commission.slotsTaken} onChange={v => setCommission(c => ({...c, slotsTaken: v}))} type="number" placeholder="1" />
            <Field label="Deposit Percentage"      value={commission.depositPct} onChange={v => setCommission(c => ({...c, depositPct: v}))} type="number" prefix="%" placeholder="50" />
            <Field label="Response Time (hours)"   value={commission.responseHours} onChange={v => setCommission(c => ({...c, responseHours: v}))} type="number" placeholder="48" />
          </div>
          <div className="pt-2 flex justify-end"><SaveBtn section="commission" /></div>
        </Accordion>

        {/* Email */}
        <Accordion section={SECTIONS[4]} isOpen={open === 'email'} onToggle={() => toggle('email')}>
          <div className="space-y-4">
            <Field label="Order notification email" value={email.orderEmail} onChange={v => setEmail(e => ({...e, orderEmail: v}))} type="email" hint="Where new order alerts are sent" />
            <Field label="Reply-to address" value={email.replyTo} onChange={v => setEmail(e => ({...e, replyTo: v}))} type="email" />
            <Field label="Order email subject" value={email.orderSubject} onChange={v => setEmail(e => ({...e, orderSubject: v}))} hint="Use [REF] for order reference" placeholder="New order — [REF]" />
            <Field label="Contact email subject" value={email.contactSubject} onChange={v => setEmail(e => ({...e, contactSubject: v}))} hint="Use [TYPE] and [NAME] as placeholders" />
            <Field label="Newsletter From name" value={email.newsletterFrom} onChange={v => setEmail(e => ({...e, newsletterFrom: v}))} placeholder="Studio Letters <studio@mapheane.art>" />
          </div>
          <div className="pt-2 flex justify-end"><SaveBtn section="email" /></div>
        </Accordion>

        {/* Security */}
        <Accordion section={SECTIONS[5]} isOpen={open === 'security'} onToggle={() => toggle('security')}>
          <div className="space-y-4">
            <div className="bg-parchment/40 border border-charcoal/8 p-4">
              <p className="text-sm font-sans font-500 text-charcoal mb-1">Password change</p>
              <p className="text-xs text-muted leading-relaxed">
                Password changes require backend authentication. Once Supabase auth is connected, this will update your login credentials.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Current password" type="password" value="" onChange={() => {}} placeholder="••••••••" />
              <Field label="New password" type="password" value="" onChange={() => {}} placeholder="••••••••" />
            </div>
            <div className="pt-2 flex justify-end">
              <button className="flex items-center gap-2 px-5 py-2.5 text-xs font-sans uppercase tracking-widest border border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal transition-all">
                Update Password
              </button>
            </div>
          </div>
        </Accordion>
      </div>
    </div>
  );
}
