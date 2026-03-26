import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Clock, Truck, Package, X, Eye, Mail,
  AlertCircle, Check, Filter
} from 'lucide-react';

type OrderStatus = 'pending' | 'verified' | 'dispatched' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  ref: string;
  customer: string;
  email: string;
  country: string;
  items: { title: string; price: number }[];
  total: number;
  payment: 'mpesa' | 'ecocash';
  fulfilment: 'delivery' | 'pickup';
  deliveryZone?: string;
  pickupPoint?: string;
  proofUrl?: string;
  status: OrderStatus;
  createdAt: string;
  tracking?: string;
}

/** Map a Supabase orders row (snake_case) to our Order interface. */
function mapRow(row: any): Order {
  const customer = row.customer ?? {};
  const items: { title: string; price: number }[] = (row.cart_items ?? []).map((i: any) => ({
    title: i.title ?? '',
    price: i.priceZar ?? i.price_zar ?? 0,
  }));
  return {
    id: row.id,
    ref: row.ref,
    customer: customer.name ?? '',
    email: customer.email ?? '',
    country: (row.address?.country ?? customer.phone ?? '').slice(0, 2).toUpperCase() || 'LS',
    items,
    total: row.total_zar ?? 0,
    payment: row.payment_method ?? 'mpesa',
    fulfilment: row.fulfilment ?? 'delivery',
    deliveryZone: row.delivery_zone ?? undefined,
    pickupPoint: row.pickup_point ?? undefined,
    proofUrl: row.proof_url ?? undefined,
    status: row.status ?? 'pending',
    createdAt: row.created_at ? new Date(row.created_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }) : '—',
    tracking: row.tracking ?? undefined,
  };
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
  pending:    { label: 'Pending verification', color: '#A0522D', bg: 'rgba(160,82,45,0.1)',  icon: AlertCircle },
  verified:   { label: 'Verified',            color: '#7C8B6F', bg: 'rgba(124,139,111,0.1)', icon: CheckCircle },
  dispatched: { label: 'Dispatched',          color: '#B8A088', bg: 'rgba(184,160,136,0.1)', icon: Truck       },
  delivered:  { label: 'Delivered',           color: '#2D2A26', bg: 'rgba(45,42,38,0.07)',   icon: Package     },
  cancelled:  { label: 'Cancelled',           color: '#9E9890', bg: 'rgba(158,152,144,0.1)', icon: X           },
};

const PIPELINE: OrderStatus[] = ['pending', 'verified', 'dispatched', 'delivered'];

export function OrdersManager() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Order | null>(null);
  const [filterStatus, setFilter] = useState<OrderStatus | 'all'>('all');
  const [tracking, setTracking]   = useState('');

  // Load orders from Supabase on mount
  useEffect(() => {
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Orders load error:', error);
        setOrders((data ?? []).map(mapRow));
        setLoading(false);
      });
  }, []);

  const filtered = orders.filter(o => filterStatus === 'all' || o.status === filterStatus);
  const pending  = orders.filter(o => o.status === 'pending').length;

  const advance = async (orderId: string, next: OrderStatus) => {
    const updates: Record<string, any> = {
      status: next,
      updated_at: new Date().toISOString(),
    };
    if (next === 'dispatched' && tracking) updates.tracking = tracking;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.error('Order update error:', error);
      return;
    }

    const order = orders.find(o => o.id === orderId);
    if (order?.email && ['verified', 'dispatched', 'delivered', 'cancelled'].includes(next)) {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: next,
          customerEmail: order.email,
          customerName: order.customer,
          ref: order.ref,
          items: order.items,
          total: order.total,
          tracking: next === 'dispatched' ? tracking : undefined,
        }),
      }).catch(err => console.error('notify error', err));
    }

    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, status: next, tracking: next === 'dispatched' && tracking ? tracking : o.tracking }
        : o
    ));
    setSelected(prev => prev?.id === orderId ? { ...prev, status: next } : prev);
    setTracking('');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-muted font-sans text-sm">
      Loading orders…
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Orders</span>
          <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>Order Management</h2>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-terracotta/10 border border-terracotta/20 px-4 py-2.5">
            <AlertCircle className="w-4 h-4 text-terracotta" />
            <span className="text-sm text-terracotta font-sans">{pending} order{pending !== 1 ? 's' : ''} awaiting verification</span>
          </div>
        )}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', ...PIPELINE, 'cancelled'] as const).map(s => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
          const cfg   = s !== 'all' ? STATUS_CONFIG[s] : null;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans uppercase tracking-widest transition-all capitalize ${
                filterStatus === s ? 'bg-charcoal text-background' : 'border border-charcoal/15 text-muted hover:border-charcoal/25'
              }`}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              <span className={`ml-1 text-[10px] px-1 ${filterStatus === s ? 'bg-white/20' : 'bg-charcoal/8'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* List + detail */}
      <div className={`grid gap-4 ${selected ? 'lg:grid-cols-5' : 'grid-cols-1'}`}>

        <div className={`${selected ? 'lg:col-span-3' : 'col-span-full'} space-y-3`}>
          <AnimatePresence mode="popLayout">
            {filtered.map(order => {
              const cfg       = STATUS_CONFIG[order.status];
              const StatusIcon = cfg.icon;
              const isSelected = selected?.id === order.id;
              return (
                <motion.div key={order.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={() => setSelected(isSelected ? null : order)}
                  className={`bg-background border cursor-pointer p-4 transition-all duration-300 ${isSelected ? 'border-terracotta shadow-card' : 'border-charcoal/8 hover:border-charcoal/20 hover:shadow-card-hover'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-sans font-500 text-sm text-charcoal">{order.customer}</p>
                        <span className="text-label text-muted">{order.country}</span>
                      </div>
                      <p className="text-xs text-muted mb-1">{order.ref}</p>
                      {order.items.map(i => (
                        <p key={i.title} className="text-xs text-charcoal/70 truncate">{i.title}</p>
                      ))}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-sans"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </div>
                      <p className="font-serif text-lg text-charcoal">R {order.total.toLocaleString()}</p>
                      <p className="text-xs text-muted">{order.createdAt}</p>
                    </div>
                  </div>

                  {/* Payment + fulfilment badges */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-charcoal/5">
                    <span className="text-label text-muted uppercase tracking-widest">{order.payment}</span>
                    <span className="text-muted">·</span>
                    <span className="text-label text-muted uppercase tracking-widest">{order.fulfilment}</span>
                    {order.fulfilment === 'delivery' && order.deliveryZone && (
                      <span className="text-label text-muted">— {order.deliveryZone}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted font-serif italic">No orders in this status.</div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div key={selected.id}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="lg:col-span-2 bg-background border border-charcoal/8 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 14rem)' }}
            >
              <div className="sticky top-0 bg-background border-b border-charcoal/8 px-5 py-4 flex justify-between items-center">
                <p className="font-serif italic text-charcoal">Order {selected.ref}</p>
                <button onClick={() => setSelected(null)} className="text-muted hover:text-charcoal transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Pipeline progress */}
                <div>
                  <p className="text-label text-muted mb-3">Order progress</p>
                  <div className="flex items-center gap-0">
                    {PIPELINE.map((s, i) => {
                      const currentIdx = PIPELINE.indexOf(selected.status);
                      const done = i <= currentIdx;
                      const cfg  = STATUS_CONFIG[s];
                      const Icon = cfg.icon;
                      return (
                        <React.Fragment key={s}>
                          <div className={`flex flex-col items-center gap-1 ${i <= currentIdx ? '' : 'opacity-30'}`}>
                            <div className="w-6 h-6 flex items-center justify-center"
                              style={{ background: done ? cfg.color : 'rgba(45,42,38,0.08)' }}>
                              <Icon className="w-3 h-3" style={{ color: done ? '#FAF7F2' : '#9E9890' }} />
                            </div>
                            <p className="text-[9px] text-muted text-center w-14 leading-tight">{cfg.label.split(' ')[0]}</p>
                          </div>
                          {i < PIPELINE.length - 1 && (
                            <div className="flex-1 h-px mb-4 mx-1" style={{ background: i < currentIdx ? STATUS_CONFIG[s].color : 'rgba(45,42,38,0.08)' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Customer */}
                <div className="space-y-2">
                  <p className="font-sans font-500 text-charcoal">{selected.customer}</p>
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-sm text-charcoal/70 hover:text-terracotta transition-colors">
                    <Mail className="w-3.5 h-3.5 text-muted" /> {selected.email}
                  </a>
                </div>

                {/* Items */}
                <div>
                  <p className="text-label text-muted mb-2">Items</p>
                  {selected.items.map(i => (
                    <div key={i.title} className="flex justify-between py-2 border-b border-charcoal/5">
                      <p className="text-sm text-charcoal">{i.title}</p>
                      <p className="text-sm text-charcoal">R {i.price.toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
                    <p className="font-sans font-500 text-sm text-charcoal">Total</p>
                    <p className="font-serif text-lg text-terracotta">R {selected.total.toLocaleString()}</p>
                  </div>
                </div>

                {/* Fulfilment */}
                <div className="bg-parchment/50 p-4 border border-charcoal/6 space-y-1">
                  <p className="text-label text-muted">Fulfilment</p>
                  <p className="text-sm text-charcoal capitalize">{selected.fulfilment}</p>
                  {selected.deliveryZone && <p className="text-xs text-muted">Zone: {selected.deliveryZone}</p>}
                  {selected.pickupPoint  && <p className="text-xs text-muted">Point: {selected.pickupPoint}</p>}
                  {selected.tracking     && <p className="text-xs text-sage">{selected.tracking}</p>}
                </div>

                {/* Proof of payment */}
                {selected.status === 'pending' && (
                  <div className="border-2 border-dashed border-charcoal/15 p-4 text-center">
                    <Eye className="w-5 h-5 text-muted mx-auto mb-2" />
                    <p className="text-sm text-muted">Payment proof uploaded</p>
                    <button className="mt-2 text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors">
                      View proof →
                    </button>
                  </div>
                )}

                {/* Tracking input for dispatching */}
                {selected.status === 'verified' && (
                  <div>
                    <p className="text-label text-muted mb-2">Tracking number (optional)</p>
                    <input value={tracking} onChange={e => setTracking(e.target.value)}
                      placeholder="DHL / courier reference…"
                      className="w-full bg-transparent border-b border-charcoal/18 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25" />
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {selected.status === 'pending' && (
                    <>
                      <button onClick={() => advance(selected.id, 'verified')}
                        className="w-full flex items-center justify-center gap-2 bg-sage text-background py-3 text-xs font-sans uppercase tracking-widest hover:bg-sageDark transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Verify Payment
                      </button>
                      <button onClick={() => advance(selected.id, 'cancelled')}
                        className="w-full flex items-center justify-center gap-2 border border-charcoal/15 text-muted py-3 text-xs font-sans uppercase tracking-widest hover:border-red-300 hover:text-red-400 transition-all">
                        <X className="w-3.5 h-3.5" /> Cancel Order
                      </button>
                    </>
                  )}
                  {selected.status === 'verified' && (
                    <button onClick={() => advance(selected.id, 'dispatched')}
                      className="w-full flex items-center justify-center gap-2 bg-terracotta text-background py-3 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors">
                      <Truck className="w-3.5 h-3.5" /> Mark as Dispatched
                    </button>
                  )}
                  {selected.status === 'dispatched' && (
                    <button onClick={() => advance(selected.id, 'delivered')}
                      className="w-full flex items-center justify-center gap-2 bg-charcoal text-background py-3 text-xs font-sans uppercase tracking-widest hover:bg-charcoalLight transition-colors">
                      <Package className="w-3.5 h-3.5" /> Mark as Delivered
                    </button>
                  )}
                  <a href={`mailto:${selected.email}?subject=Order Update — ${selected.ref}`}
                    className="flex items-center justify-center gap-2 w-full border border-charcoal/15 text-muted py-3 text-xs font-sans uppercase tracking-widest hover:border-charcoal/30 hover:text-charcoal transition-all">
                    <Mail className="w-3.5 h-3.5" /> Email Customer
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
