import { useCurrency } from '../context/CurrencyContext';
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PickupMap, PickupPoint } from '../components/PickupMap';
import {
  ArrowLeft, ArrowRight, Check, MapPin, Truck, Package,
  Upload, X, Image as ImageIcon, Copy, CheckCircle, AlertCircle,
  Phone, Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { eurToZar, formatZar, zarToEur } from '../lib/pricing';

interface CheckoutPageProps {
  onNavigate: (page: any) => void;
}

// ─── Types ───────────────────────────────────────────────────
type FulfilmentMethod = 'delivery' | 'pickup';
type DeliveryZone     = 'maseru' | 'lesotho' | 'southafrica' | 'international';
type PaymentMethod    = 'mpesa' | 'ecocash' | 'wire';
type CheckoutStep     = 'fulfilment' | 'payment' | 'confirmation';

// ─── Pickup points ───────────────────────────────────────────
const PICKUP_POINTS: import('../components/PickupMap').PickupPoint[] = [
  { id: 'studio',       name: "Mapheane's Studio",          address: 'Studio 4, Kingsway Arts Quarter, Maseru CBD',            city: 'Maseru',        hours: 'Mon–Fri 9am–5pm, Sat 9am–1pm',  note: 'Collection by appointment — Mapheane will confirm your slot.', primary: true,  lat: -29.3167, lng: 27.4833 },
  { id: 'pioneer-mall', name: 'Pioneer Mall Collection',    address: 'Pioneer Mall, Kingsway Road, Level 1 — Customer Services',city: 'Maseru',        hours: 'Mon–Sat 8am–7pm, Sun 9am–4pm',  note: 'Parcels held for 5 working days.',                             primary: false, lat: -29.3100, lng: 27.4760 },
  { id: 'maseru-west',  name: 'Maseru West Hub',            address: 'Maseru West Shopping Centre, Main Counter',              city: 'Maseru West',   hours: 'Mon–Sat 8am–6pm',               note: null,                                                           primary: false, lat: -29.3250, lng: 27.4600 },
  { id: 'leribe',       name: 'Leribe Town Centre',         address: 'Main Street Collection Office, Leribe',                  city: 'Leribe',        hours: 'Mon–Fri 8am–5pm',               note: 'Available 2–3 days after dispatch from Maseru.',               primary: false, lat: -28.8667, lng: 28.0500 },
  { id: 'mafeteng',     name: 'Mafeteng Drop Point',        address: 'Standard Lesotho Bank Branch, Mafeteng',                 city: 'Mafeteng',      hours: 'Mon–Fri 8:30am–3:30pm',         note: 'Available 2–3 days after dispatch.',                           primary: false, lat: -29.8167, lng: 27.2333 },
  { id: 'mohales-hoek', name: "Mohale's Hoek Point",        address: "Main Road Agency, Mohale's Hoek",                        city: "Mohale's Hoek", hours: 'Mon–Fri 9am–4pm',               note: 'Available 3–4 days after dispatch.',                           primary: false, lat: -30.1333, lng: 27.4667 },
];

// ─── Delivery zones ──────────────────────────────────────────
const DELIVERY_ZONES: { id: DeliveryZone; label: string; price: number; eta: string }[] = [
  { id: 'maseru',        label: 'Maseru (city delivery)',           price: 150,  eta: '1–2 working days'   },
  { id: 'lesotho',       label: 'Other Lesotho districts',          price: 280,  eta: '3–5 working days'   },
  { id: 'southafrica',   label: 'South Africa',                     price: 450,  eta: '3–5 working days'   },
  { id: 'international', label: 'International (DHL Express)',       price: 950,  eta: '5–10 working days'  },
];

// ─── Payment methods ─────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'mpesa' as PaymentMethod,
    name: 'M-Pesa',
    description: 'Pay via Vodacom M-Pesa',
    color: '#00A651',
    isWire: false,
    details: {
      accountName: 'Mapheane Arts Studio',
      number: '+266 5912 3456',
      instructions: [
        'Go to M-Pesa on your phone',
        'Select "Send Money" or "Lipa"',
        'Enter the number above',
        'Enter the exact amount shown',
        'Use your order reference as the reason',
        'Save your confirmation SMS',
        'Upload the screenshot below',
      ],
    },
  },
  {
    id: 'ecocash' as PaymentMethod,
    name: 'EcoCash',
    description: 'Pay via EcoCash wallet',
    color: '#E87722',
    isWire: false,
    details: {
      accountName: 'Mapheane Arts',
      number: '+266 5878 9012',
      instructions: [
        'Open your EcoCash app or dial *151#',
        'Select "Send Money"',
        'Enter the number above',
        'Enter the exact amount shown',
        'Use your order reference as the message',
        'Save your transaction confirmation',
        'Upload the screenshot below',
      ],
    },
  },
  {
    id: 'wire' as PaymentMethod,
    name: 'Bank Wire',
    description: 'International SWIFT transfer',
    color: '#2D2A26',
    isWire: true,
    details: {
      accountName: 'Mapheane',
      // Placeholder — update in Admin Settings once business account is ready
      bankName: 'Standard Lesotho Bank',
      accountNumber: '000-000-000-000',
      swift: 'STANLSLM',
      branch: 'Kingsway, Maseru, Kingdom of Lesotho',
    },
  },
];

// ─── Field component ─────────────────────────────────────────
function Field({
  label, type = 'text', value, onChange, placeholder, required, error,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  required?: boolean; error?: string;
}) {
  return (
    <div className="group">
      <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-2">
        {label}{required && <span className="text-terracotta ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-charcoal/18 py-2.5 text-charcoal font-serif text-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic"
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// ─── Step indicator ──────────────────────────────────────────
function StepBar({ step }: { step: CheckoutStep }) {
  const steps: { id: CheckoutStep; label: string }[] = [
    { id: 'fulfilment',   label: 'Delivery'  },
    { id: 'payment',      label: 'Payment'   },
    { id: 'confirmation', label: 'Confirmed' },
  ];
  const idx = steps.findIndex(s => s.id === step);

  return (
    <div className="flex items-center justify-center gap-0 mb-14">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 flex items-center justify-center border transition-all duration-400 ${
              i < idx  ? 'bg-sage border-sage text-white'
              : i === idx ? 'bg-terracotta border-terracotta text-white'
              : 'bg-transparent border-charcoal/15 text-muted/50'
            }`}>
              {i < idx
                ? <Check className="w-3.5 h-3.5" />
                : <span className="text-[10px] font-sans">{i + 1}</span>
              }
            </div>
            <span className={`text-label uppercase tracking-widest hidden sm:inline transition-colors ${
              i === idx ? 'text-charcoal' : i < idx ? 'text-sage' : 'text-muted/40'
            }`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 md:w-20 h-px mx-3 transition-colors duration-500 ${i < idx ? 'bg-sage/40' : 'bg-charcoal/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────
export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { success, info } = useToast();
  const { format: fmt, fromZAR, currency } = useCurrency();

  const [step,            setStep]           = useState<CheckoutStep>('fulfilment');
  const [fulfilment,      setFulfilment]      = useState<FulfilmentMethod>('delivery');
  const [deliveryZone,    setDeliveryZone]    = useState<DeliveryZone>('maseru');
  const [pickupPoint,     setPickupPoint]     = useState<string>('studio');
  const [paymentMethod,   setPaymentMethod]   = useState<PaymentMethod | null>(null);
  const [proofFile,       setProofFile]       = useState<{ name: string; dataUrl: string } | null>(null);
  const [proofError,      setProofError]      = useState('');
  const [copied,          setCopied]          = useState<string | null>(null);
  const [submitting,      setSubmitting]      = useState(false);
  const [orderRef]        = useState(() => 'MAP-' + Math.random().toString(36).slice(2, 8).toUpperCase());
  const fileInputRef      = useRef<HTMLInputElement>(null);

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [address, setAddress] = useState({ line1: '', city: '', district: '', country: '' });
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  // Derived
  const zone        = DELIVERY_ZONES.find(z => z.id === deliveryZone)!;
  const shippingCost = fulfilment === 'pickup' ? 0 : zone.price;
  const subtotalEUR = getCartTotal(); // cart prices are in EUR
  const shippingEUR = zarToEur(shippingCost); // shipping zones defined in ZAR
  const totalEUR    = subtotalEUR + shippingEUR;
  const selectedPickup = PICKUP_POINTS.find(p => p.id === pickupPoint)!;
  const selectedPayment = PAYMENT_METHODS.find(p => p.id === paymentMethod);

  // ── Handlers ───────────────────────────────────────────────
  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setProofError('File must be under 8MB'); return; }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setProofError('Please upload an image or PDF'); return;
    }
    setProofError('');
    const reader = new FileReader();
    reader.onload = () => setProofFile({ name: file.name, dataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const validateFulfilment = () => {
    const e: Record<string, string> = {};
    if (!contact.name.trim())  e.name  = 'Required';
    if (!contact.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
                               e.email = 'Valid email required';
    if (!contact.phone.trim()) e.phone = 'Required';
    if (fulfilment === 'delivery') {
      if (!address.line1.trim()) e.line1   = 'Required';
      if (!address.city.trim())  e.city    = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFulfilmentNext = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validateFulfilment()) setStep('payment');
  };

  const handlePaymentSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!paymentMethod) { info('Select a payment method'); return; }
    if (paymentMethod !== 'wire' && !proofFile) { setProofError('Please upload your payment screenshot'); return; }
    setSubmitting(true);
    try {
      // 1. Upload proof to Supabase Storage (skip for wire transfers)
      let proofPath: string | null = null;
      if (paymentMethod !== 'wire' && proofFile) {
        const ext = proofFile.name.split('.').pop() ?? 'jpg';
        const fileName = `${orderRef}-${Date.now()}.${ext}`;
        const base64 = proofFile.dataUrl.split(',')[1];
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        const mimeType = proofFile.dataUrl.split(':')[1]?.split(';')[0] ?? 'image/jpeg';
        const blob = new Blob([bytes], { type: mimeType });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, blob, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error('Proof upload failed: ' + uploadError.message);
        proofPath = uploadData.path;
      }

      // 2. Submit order to API (inserts into Supabase + sends emails)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: orderRef,
          contact,
          address: fulfilment === 'delivery' ? address : null,
          fulfilment,
          deliveryZone: fulfilment === 'delivery' ? deliveryZone : null,
          pickupPoint: fulfilment === 'pickup' ? pickupPoint : null,
          paymentMethod,
          proofPath,
          cartItems: cartItems.map(i => ({
            artwork: i.artwork,
            edition: i.edition ?? null,
            title: i.artwork.title,
            medium: i.artwork.medium,
            priceZar: eurToZar(i.edition?.price.eur ?? i.artwork.price),
            quantity: i.quantity,
          })),
          totalZar: eurToZar(totalEUR),
          shippingZar: shippingCost,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        throw new Error(data.error ?? 'Order submission failed');
      }

      setStep('confirmation');
      success('Order submitted!', 'Mapheane will confirm within 2 hours.');
      clearCart();
    } catch (err: any) {
      setProofError(err.message ?? 'Something went wrong. Please try again or contact hello@mapheane.art.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Sidebar ─────────────────────────────────────────────────
  const OrderSidebar = () => (
    <div className="bg-parchment/40 border border-charcoal/6 p-6 sticky top-28">
      <p className="text-label uppercase tracking-widest text-muted mb-5">Order Summary</p>

      {/* Items */}
      <div className="space-y-4 mb-5 pb-5 border-b border-charcoal/8">
        {cartItems.map(item => (
          <div key={item.artwork.id} className="flex gap-3">
            <div className="w-14 h-14 overflow-hidden bg-parchment flex-shrink-0">
              <img src={item.artwork.images[0]} alt={item.artwork.title} draggable={false}
                className="w-full h-full object-cover" style={{ objectPosition: item.artwork.cropPosition }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-sans font-500 text-charcoal truncate">{item.artwork.title}</p>
              {item.quantity > 1 && <p className="text-xs text-muted">× {item.quantity}</p>}
              <p className="text-sm text-charcoal mt-0.5">{fmt((item.edition?.price.eur ?? item.artwork.price) * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2.5 mb-5 pb-5 border-b border-charcoal/8">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="text-charcoal">{fmt(subtotalEUR)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">
            {fulfilment === 'pickup' ? 'Pickup' : `Delivery — ${zone.label}`}
          </span>
          <span className={fulfilment === 'pickup' ? 'text-sage font-sans font-500' : 'text-charcoal'}>
            {fulfilment === 'pickup' ? 'Free' : formatZar(shippingCost)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-baseline">
        <span className="font-serif text-lg text-charcoal">Total</span>
        <div className="text-right">
          <span className="font-serif text-2xl text-terracotta">{fmt(totalEUR)}</span>
          
        </div>
      </div>

      {/* Order ref */}
      {step !== 'fulfilment' && (
        <div className="mt-5 pt-5 border-t border-charcoal/8">
          <p className="text-label uppercase tracking-widest text-muted mb-1">Reference</p>
          <p className="font-sans text-sm text-charcoal font-500">{orderRef}</p>
          <p className="text-xs text-muted/60 mt-0.5">Use this when making payment</p>
        </div>
      )}
    </div>
  );

  // ── CONFIRMATION ────────────────────────────────────────────
  if (step === 'confirmation') {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen pt-32 pb-20 px-6 md:px-12 flex items-center justify-center"
      >
        <div className="max-w-lg w-full text-center">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 16 }}
            className="w-20 h-20 bg-sage/15 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-10 h-10 text-sage" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Order Submitted</span>
            <h1 className="font-serif text-4xl md:text-5xl italic text-charcoal mb-5" style={{ letterSpacing: '-0.015em' }}>
              Thank you, {contact.name.split(' ')[0]}.
            </h1>
            <p className="text-muted leading-relaxed mb-3 max-w-sm mx-auto">
              {paymentMethod === 'wire'
                ? 'Please transfer to the bank details provided, using your order reference as the payment note. Your order will be confirmed within 2 business days of funds clearing.'
                : 'Your payment proof has been received. Mapheane will verify and confirm your order within 2 hours during studio hours.'}
            </p>
            <p className="text-xs text-muted/60 mb-2">A confirmation will be sent to <strong className="text-charcoal">{contact.email}</strong></p>
            <p className="text-xs text-muted/60 mb-10">Order reference: <strong className="text-charcoal">{orderRef}</strong></p>

            {fulfilment === 'pickup' && (
              <div className="bg-parchment/50 border border-charcoal/8 p-5 mb-8 text-left">
                <p className="text-xs font-sans uppercase tracking-widest text-muted mb-2">Pickup point</p>
                <p className="font-serif italic text-lg text-charcoal">{selectedPickup.name}</p>
                <p className="text-xs text-muted mt-1">{selectedPickup.address}</p>
                <p className="text-xs text-muted mt-0.5">{selectedPickup.hours}</p>
                {selectedPickup.note && (
                  <p className="text-xs text-terracotta/80 mt-2 italic">{selectedPickup.note}</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => onNavigate('gallery')}
                className="flex items-center justify-center gap-2 bg-terracotta text-white px-8 py-3.5 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors shadow-button">
                Continue Browsing <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onNavigate('home')}
                className="text-xs font-sans uppercase tracking-widest text-muted hover:text-charcoal transition-colors border-b border-charcoal/15 pb-px self-center">
                Return Home
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-28 pb-20 px-6 md:px-12 bg-background"
    >
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => step === 'fulfilment' ? onNavigate('cart') : setStep('fulfilment')}
            className="group flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            {step === 'fulfilment' ? 'Cart' : 'Back'}
          </button>
          <h1 className="font-serif text-4xl md:text-5xl italic text-charcoal" style={{ letterSpacing: '-0.015em' }}>Checkout</h1>
          <div className="w-20" />
        </div>

        <StepBar step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Main ─────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">

              {/* ─── STEP 1: FULFILMENT ───────────────────────── */}
              {step === 'fulfilment' && (
                <motion.form
                  key="fulfilment"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onSubmit={handleFulfilmentNext}
                  className="space-y-10"
                >
                  {/* Contact */}
                  <div className="bg-background border border-charcoal/6 p-7">
                    <p className="font-serif italic text-xl text-charcoal mb-7">Contact Details</p>
                    <div className="space-y-6">
                      <Field label="Full Name"    value={contact.name}  onChange={v => setContact(c => ({...c, name: v}))}  placeholder="Your full name" required error={errors.name} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Field label="Email"  type="email" value={contact.email} onChange={v => setContact(c => ({...c, email: v}))}  placeholder="your@email.com" required error={errors.email} />
                        <Field label="Phone"  type="tel"   value={contact.phone} onChange={v => setContact(c => ({...c, phone: v}))}  placeholder="+266 or +27…"  required error={errors.phone} />
                      </div>
                    </div>
                  </div>

                  {/* Fulfilment method toggle */}
                  <div className="bg-background border border-charcoal/6 p-7">
                    <p className="font-serif italic text-xl text-charcoal mb-6">How would you like to receive your order?</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {/* Delivery */}
                      <button
                        type="button"
                        onClick={() => setFulfilment('delivery')}
                        className={`group relative p-5 border-2 text-left transition-all duration-300 ${
                          fulfilment === 'delivery'
                            ? 'border-terracotta bg-terracotta/4'
                            : 'border-charcoal/10 hover:border-charcoal/25'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Truck className={`w-5 h-5 ${fulfilment === 'delivery' ? 'text-terracotta' : 'text-muted'}`} />
                          <span className="font-sans font-500 text-charcoal text-sm uppercase tracking-widest">Delivery</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">We bring it to you. Shipping charges apply by region.</p>
                        {fulfilment === 'delivery' && (
                          <div className="absolute top-3 right-3 w-4 h-4 bg-terracotta rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>

                      {/* Pickup */}
                      <button
                        type="button"
                        onClick={() => setFulfilment('pickup')}
                        className={`group relative p-5 border-2 text-left transition-all duration-300 ${
                          fulfilment === 'pickup'
                            ? 'border-sage bg-sage/5'
                            : 'border-charcoal/10 hover:border-charcoal/25'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Package className={`w-5 h-5 ${fulfilment === 'pickup' ? 'text-sage' : 'text-muted'}`} />
                          <span className="font-sans font-500 text-charcoal text-sm uppercase tracking-widest">Pickup</span>
                          <span className="text-[10px] font-sans bg-sage text-white px-1.5 py-0.5 uppercase tracking-widest">Free</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">Collect from a pickup point near you. Always free.</p>
                        {fulfilment === 'pickup' && (
                          <div className="absolute top-3 right-3 w-4 h-4 bg-sage rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* ─── DELIVERY: Zone + address ──────────── */}
                    <AnimatePresence mode="wait">
                      {fulfilment === 'delivery' && (
                        <motion.div
                          key="delivery-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-6 pt-2">
                            {/* Zone selector */}
                            <div>
                              <p className="text-label uppercase tracking-widest text-muted mb-3">Delivery Region</p>
                              <div className="space-y-2">
                                {DELIVERY_ZONES.map(z => (
                                  <button
                                    key={z.id}
                                    type="button"
                                    onClick={() => setDeliveryZone(z.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 border transition-all duration-200 text-left ${
                                      deliveryZone === z.id
                                        ? 'border-terracotta bg-terracotta/4'
                                        : 'border-charcoal/10 hover:border-charcoal/20'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center flex-shrink-0 ${deliveryZone === z.id ? 'border-terracotta' : 'border-charcoal/25'}`}>
                                        {deliveryZone === z.id && <div className="w-2 h-2 bg-terracotta rounded-full" />}
                                      </div>
                                      <div>
                                        <p className="text-sm text-charcoal">{z.label}</p>
                                        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                                          <Clock className="w-2.5 h-2.5" /> {z.eta}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="font-sans text-sm text-charcoal flex-shrink-0">
                                      {fromZAR(z.price)}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-5 pt-2">
                              <Field label="Street Address" value={address.line1} onChange={v => setAddress(a => ({...a, line1: v}))}
                                placeholder="Street name and number" required error={errors.line1} />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field label="City / Town" value={address.city} onChange={v => setAddress(a => ({...a, city: v}))}
                                  placeholder="City" required error={errors.city} />
                                <Field label="District / Province" value={address.district} onChange={v => setAddress(a => ({...a, district: v}))}
                                  placeholder="District" />
                              </div>
                              <Field label="Country" value={address.country} onChange={v => setAddress(a => ({...a, country: v}))}
                                placeholder="Country" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* ─── PICKUP: Point selector ──────────── */}
                      {fulfilment === 'pickup' && (
                        <motion.div
                          key="pickup-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2">
                            <p className="text-label uppercase tracking-widest text-muted mb-4">Select a Pickup Point</p>
                            <PickupMap
                              points={PICKUP_POINTS}
                              selectedId={pickupPoint}
                              onSelect={setPickupPoint}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 bg-terracotta text-white py-4 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors duration-400 shadow-button hover:shadow-button-hover"
                  >
                    Continue to Payment <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}

              {/* ─── STEP 2: PAYMENT ──────────────────────────── */}
              {step === 'payment' && (
                <motion.form
                  key="payment"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onSubmit={handlePaymentSubmit}
                  className="space-y-8"
                >
                  {/* Method selector */}
                  <div className="bg-background border border-charcoal/6 p-7">
                    <p className="font-serif italic text-xl text-charcoal mb-6">Choose Payment Method</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PAYMENT_METHODS.map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => { setPaymentMethod(method.id); setProofError(''); }}
                          className={`relative p-5 border-2 text-left transition-all duration-300 ${
                            paymentMethod === method.id
                              ? 'border-2 bg-charcoal/3'
                              : 'border-charcoal/10 hover:border-charcoal/25'
                          }`}
                          style={{ borderColor: paymentMethod === method.id ? method.details ? method.color : undefined : undefined }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {/* Brand badge */}
                            <div
                              className="w-9 h-9 flex items-center justify-center text-white font-sans font-500 text-xs flex-shrink-0"
                              style={{ backgroundColor: method.color }}
                            >
                              {method.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-sans font-500 text-charcoal text-sm">{method.name}</p>
                              <p className="text-xs text-muted">{method.description}</p>
                            </div>
                          </div>
                          {paymentMethod === method.id && (
                            <div className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: method.color }}>
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment details panel */}
                  <AnimatePresence mode="wait">
                    {selectedPayment && (
                      <motion.div
                        key={selectedPayment.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="bg-background border border-charcoal/6 overflow-hidden"
                      >
                        {/* Colored top bar */}
                        <div className="h-1 w-full" style={{ backgroundColor: selectedPayment.color }} />

                        <div className="p-7">
                          <p className="text-label uppercase tracking-[0.25em] mb-6" style={{ color: selectedPayment.color }}>
                            {selectedPayment.name} Payment Details
                          </p>

                          {/* Account info cards */}
                          {selectedPayment.isWire ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                              <div className="bg-parchment/60 border border-charcoal/6 p-4">
                                <p className="text-label uppercase tracking-widest text-muted mb-1.5">Account Name</p>
                                <p className="font-sans font-500 text-charcoal text-sm">{selectedPayment.details.accountName}</p>
                              </div>
                              <div className="bg-parchment/60 border border-charcoal/6 p-4">
                                <p className="text-label uppercase tracking-widest text-muted mb-1.5">Bank</p>
                                <p className="font-sans font-500 text-charcoal text-sm">{selectedPayment.details.bankName}</p>
                              </div>
                              <div className="bg-parchment/60 border border-charcoal/6 p-4">
                                <p className="text-label uppercase tracking-widest text-muted mb-1.5">Account Number</p>
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-sans font-500 text-charcoal text-sm tracking-wide">{selectedPayment.details.accountNumber}</p>
                                  <button type="button" onClick={() => copyToClipboard(selectedPayment.details.accountNumber!, 'phone')}
                                    className="text-muted hover:text-charcoal transition-colors" aria-label="Copy account number">
                                    {copied === 'phone' ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              <div className="bg-parchment/60 border border-charcoal/6 p-4">
                                <p className="text-label uppercase tracking-widest text-muted mb-1.5">SWIFT / BIC</p>
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-sans font-500 text-charcoal text-sm tracking-widest">{selectedPayment.details.swift}</p>
                                  <button type="button" onClick={() => copyToClipboard(selectedPayment.details.swift!, 'swift')}
                                    className="text-muted hover:text-charcoal transition-colors" aria-label="Copy SWIFT code">
                                    {copied === 'swift' ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              <div className="sm:col-span-2 bg-parchment/60 border border-charcoal/6 p-4">
                                <p className="text-label uppercase tracking-widest text-muted mb-1.5">Branch / Address</p>
                                <p className="font-sans font-500 text-charcoal text-sm">{selectedPayment.details.branch}</p>
                              </div>
                            </div>
                          ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                            {/* Name */}
                            <div className="bg-parchment/60 border border-charcoal/6 p-4">
                              <p className="text-label uppercase tracking-widest text-muted mb-1.5">Account Name</p>
                              <p className="font-sans font-500 text-charcoal text-sm">{selectedPayment.details.accountName}</p>
                            </div>

                            {/* Number — copyable */}
                            <div className="bg-parchment/60 border border-charcoal/6 p-4">
                              <p className="text-label uppercase tracking-widest text-muted mb-1.5">Number</p>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5 text-muted/60 flex-shrink-0" />
                                  <p className="font-sans font-500 text-charcoal text-sm tracking-wide">
                                    {selectedPayment.details.number}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(selectedPayment.details.number!, 'phone')}
                                  className="flex-shrink-0 text-muted hover:text-charcoal transition-colors"
                                  aria-label="Copy number"
                                >
                                  {copied === 'phone'
                                    ? <Check className="w-3.5 h-3.5 text-sage" />
                                    : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          )}

                          {/* Amount to pay */}
                          <div className="bg-terracotta/6 border border-terracotta/20 p-4 mb-7">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-label uppercase tracking-widest text-terracotta/70 mb-1">Amount to Pay</p>
                                <p className="font-serif text-3xl text-terracotta">{formatZar(eurToZar(totalEUR), true)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-label uppercase tracking-widest text-muted mb-1">Reference</p>
                                <div className="flex items-center gap-2">
                                  <p className="font-sans font-500 text-charcoal text-sm">{orderRef}</p>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(orderRef, 'ref')}
                                    className="text-muted hover:text-charcoal transition-colors"
                                    aria-label="Copy reference"
                                  >
                                    {copied === 'ref'
                                      ? <Check className="w-3.5 h-3.5 text-sage" />
                                      : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                                <p className="text-xs text-muted/60 mt-0.5">Use as payment note</p>
                              </div>
                            </div>
                          </div>

                          {/* Step-by-step instructions — mobile wallets only */}
                          {!selectedPayment.isWire && <div className="mb-7">
                            <p className="text-label uppercase tracking-widest text-muted mb-4">How to Pay</p>
                            <ol className="space-y-2">
                              {(selectedPayment.details.instructions ?? []).map((inst, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-charcoal/70">
                                  <span
                                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-white text-[10px] font-sans mt-0.5"
                                    style={{ backgroundColor: selectedPayment.color }}
                                  >
                                    {i + 1}
                                  </span>
                                  {inst}
                                </li>
                              ))}
                            </ol>
                          </div>}

                          {/* Proof of payment upload — mobile wallets only */}
                          {!selectedPayment.isWire && <div>
                            <p className="text-label uppercase tracking-widest text-muted mb-3">
                              Upload Proof of Payment <span className="text-terracotta">*</span>
                            </p>
                            <p className="text-xs text-muted leading-relaxed mb-4">
                              Upload a screenshot or photo of your payment confirmation (M-Pesa SMS, EcoCash notification, or screenshot). JPG, PNG, or PDF — max 8MB.
                            </p>

                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                              className="hidden"
                              aria-label="Upload proof of payment"
                            />

                            {proofFile ? (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-sage/40 bg-sage/5 p-4 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3">
                                  <ImageIcon className="w-5 h-5 text-sage flex-shrink-0" />
                                  <div>
                                    <p className="text-sm text-charcoal truncate max-w-[200px]">{proofFile.name}</p>
                                    <p className="text-xs text-sage">Uploaded ✓</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { setProofFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                  className="text-muted hover:text-charcoal transition-colors"
                                  aria-label="Remove file"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:border-charcoal/30 hover:bg-parchment/30 ${
                                  proofError ? 'border-red-300' : 'border-charcoal/15'
                                }`}
                              >
                                <Upload className="w-6 h-6 text-muted/60" />
                                <p className="text-sm text-muted">Click to upload payment screenshot</p>
                                <p className="text-xs text-muted/50">JPG, PNG, PDF — max 8MB</p>
                              </button>
                            )}

                            {proofError && (
                              <div className="flex items-center gap-2 mt-2">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                <p className="text-xs text-red-400">{proofError}</p>
                              </div>
                            )}
                          </div>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={submitting || !paymentMethod || (paymentMethod !== 'wire' && !proofFile)}
                    className="w-full flex items-center justify-center gap-3 bg-terracotta text-white py-4 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors duration-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-button hover:shadow-button-hover"
                  >
                    {submitting
                      ? <div className="w-4 h-4 border border-white/50 border-t-white rounded-full animate-spin" />
                      : <><Check className="w-4 h-4" /> Submit Order</>
                    }
                  </button>

                  <p className="text-center text-xs text-muted/60 leading-relaxed">
                    Your order will be confirmed once payment is verified by Mapheane — usually within 2 hours during studio hours (Mon–Sat, 9am–5pm SAST).
                  </p>
                </motion.form>
              )}

            </AnimatePresence>
          </div>

          {/* ── Sidebar ──────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <OrderSidebar />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
