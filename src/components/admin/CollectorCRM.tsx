import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Heart, MapPin, Mail, Phone, Clock, Edit3, X, Check, AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Segment = 'all' | 'vip' | 'collector' | 'prospect' | 'workshop';

interface Collector {
  id: string; // UUID from Supabase
  name: string;
  email: string;
  phone?: string;
  location: string;
  country: string;
  segment: 'VIP' | 'Collector' | 'Prospect' | 'Workshop Participant';
  mediumPref: string[];
  totalSpend: number;
  purchaseCount: number;
  lastContact: string;
  notes: string;
  source: string;
  ltv: number;
  wishlistCount: number;
  tags: string[];
}

function mapRow(row: Record<string, unknown>): Collector {
  return {
    id:            row.id as string,
    name:          (row.name as string)         ?? '—',
    email:         (row.email as string)        ?? '',
    phone:         (row.phone as string | undefined) ?? undefined,
    location:      (row.location as string)     ?? '—',
    country:       (row.country as string)      ?? '—',
    segment:       ((row.tier ?? 'Prospect') as Collector['segment']),
    mediumPref:    Array.isArray(row.medium_pref) ? (row.medium_pref as string[]) : [],
    totalSpend:    (row.total_spend as number)  ?? 0,
    purchaseCount: (row.purchase_count as number) ?? 0,
    lastContact:   (row.last_contact as string) ?? 'Never',
    notes:         (row.notes as string)        ?? '',
    source:        (row.source as string)       ?? 'Direct',
    ltv:           (row.ltv_zar as number)      ?? 0,
    wishlistCount: (row.wishlist_count as number) ?? 0,
    tags:          Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

const SEGMENT_COLORS: Record<string, string> = {
  'VIP':                  'bg-terracotta/15 text-terracotta',
  'Collector':            'bg-sage/15 text-sageDark',
  'Prospect':             'bg-gold/20 text-charcoalLight',
  'Workshop Participant': 'bg-charcoal/8 text-muted',
};

function CollectorCard({ c, onSelect }: { c: Collector; onSelect: () => void }) {
  return (
    <motion.div layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-background border border-charcoal/8 p-5 hover:border-charcoal/20 hover:shadow-card transition-all duration-300 cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center font-sans text-background text-sm flex-shrink-0"
            style={{ background: c.segment === 'VIP' ? '#A0522D' : '#7C8B6F' }}>
            {c.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-sans text-charcoal text-sm group-hover:text-terracotta transition-colors">{c.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-muted/60" />
              <p className="text-xs text-muted">{c.location}, {c.country}</p>
            </div>
          </div>
        </div>
        <span className={`text-[10px] font-sans px-2 py-0.5 uppercase tracking-widest ${SEGMENT_COLORS[c.segment]}`}>
          {c.segment}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 pt-3 border-t border-charcoal/5">
        <div>
          <p className="text-label text-muted mb-0.5">Total spent</p>
          <p className="text-sm font-sans text-charcoal">
            {c.totalSpend > 1000 ? `R ${(c.totalSpend / 1000).toFixed(0)}k` : `R ${c.totalSpend}`}
          </p>
        </div>
        <div>
          <p className="text-label text-muted mb-0.5">Purchases</p>
          <p className="text-sm font-sans text-charcoal">{c.purchaseCount}</p>
        </div>
        <div>
          <p className="text-label text-muted mb-0.5">LTV est.</p>
          <p className="text-sm font-sans text-terracotta">
            {c.ltv > 1000 ? `R ${(c.ltv / 1000).toFixed(0)}k` : `R ${c.ltv}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {c.mediumPref.map(m => (
          <span key={m} className="text-label text-muted bg-charcoal/4 px-2 py-0.5 uppercase tracking-widest">{m}</span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {c.tags.slice(0, 2).map(t => (
          <span key={t} className="text-[10px] text-muted/70 border border-charcoal/10 px-1.5 py-0.5">{t}</span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-charcoal/5">
        <div className="flex items-center gap-1 text-xs text-muted">
          <Clock className="w-3 h-3" />
          {c.lastContact}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <Heart className="w-3 h-3" />
          {c.wishlistCount} saved
        </div>
      </div>
    </motion.div>
  );
}

function CollectorDetail({ c, onClose }: { c: Collector; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.35 }}
      className="bg-background border border-charcoal/8 h-full overflow-y-auto"
    >
      <div className="sticky top-0 bg-background border-b border-charcoal/8 px-6 py-4 flex items-center justify-between">
        <p className="font-serif italic text-lg text-charcoal">{c.name}</p>
        <button onClick={onClose} className="text-muted hover:text-charcoal transition-colors hover:rotate-90 duration-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-sans px-3 py-1 uppercase tracking-widest ${SEGMENT_COLORS[c.segment]}`}>
            {c.segment}
          </span>
          <div className="text-right">
            <p className="text-label text-muted">Estimated LTV</p>
            <p className="font-serif text-2xl text-terracotta">R {c.ltv.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <a href={`mailto:${c.email}`} className="flex items-center gap-3 text-sm text-charcoal/70 hover:text-terracotta transition-colors">
            <Mail className="w-4 h-4 text-muted flex-shrink-0" /> {c.email}
          </a>
          {c.phone && (
            <a href={`tel:${c.phone}`} className="flex items-center gap-3 text-sm text-charcoal/70 hover:text-terracotta transition-colors">
              <Phone className="w-4 h-4 text-muted flex-shrink-0" /> {c.phone}
            </a>
          )}
          <div className="flex items-center gap-3 text-sm text-muted">
            <MapPin className="w-4 h-4 flex-shrink-0" /> {c.location}, {c.country}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total spent',      value: `R ${c.totalSpend.toLocaleString()}` },
            { label: 'Purchases',         value: String(c.purchaseCount) },
            { label: 'Works wishlisted',  value: String(c.wishlistCount) },
            { label: 'Source',            value: c.source },
          ].map(m => (
            <div key={m.label} className="bg-parchment/50 p-3 border border-charcoal/6">
              <p className="text-label text-muted mb-1">{m.label}</p>
              <p className="text-sm text-charcoal">{m.value}</p>
            </div>
          ))}
        </div>

        {c.mediumPref.length > 0 && (
          <div>
            <p className="text-label uppercase tracking-widest text-muted mb-2">Prefers</p>
            <div className="flex flex-wrap gap-2">
              {c.mediumPref.map(m => (
                <span key={m} className="text-xs bg-terracotta/8 text-terracotta px-3 py-1 border border-terracotta/20">{m}</span>
              ))}
            </div>
          </div>
        )}

        {c.tags.length > 0 && (
          <div>
            <p className="text-label uppercase tracking-widest text-muted mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {c.tags.map(t => (
                <span key={t} className="text-xs text-muted border border-charcoal/10 px-2 py-0.5">{t}</span>
              ))}
            </div>
          </div>
        )}

        {c.notes && (
          <div>
            <p className="text-label uppercase tracking-widest text-muted mb-2">Studio notes</p>
            <p className="text-sm text-charcoal/70 leading-relaxed bg-parchment/40 p-4 border border-charcoal/6">
              {c.notes}
            </p>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <a href={`mailto:${c.email}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-terracotta text-background text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors">
            <Mail className="w-3.5 h-3.5" /> Send Email
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function CollectorCRM() {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [segment, setSegment]       = useState<Segment>('all');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<Collector | null>(null);
  const [adding, setAdding]         = useState(false);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState('');
  const [newForm, setNewForm]       = useState({
    name: '', email: '', phone: '', location: '', country: '',
    segment: 'Prospect' as Collector['segment'],
    source: '', mediumPref: '', notes: '',
  });

  useEffect(() => {
    supabase
      .from('collectors')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setLoadError('Failed to load collectors.');
        } else {
          setCollectors((data ?? []).map(mapRow));
        }
        setLoading(false);
      });
  }, []);

  const filtered = collectors.filter(c => {
    if (segment === 'vip'       && c.segment !== 'VIP')                  return false;
    if (segment === 'collector' && c.segment !== 'Collector')             return false;
    if (segment === 'prospect'  && c.segment !== 'Prospect')              return false;
    if (segment === 'workshop'  && c.segment !== 'Workshop Participant')   return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.location.toLowerCase().includes(search.toLowerCase()))         return false;
    return true;
  });

  const totalLTV = collectors.reduce((s, c) => s + c.ltv, 0);
  const spenders = collectors.filter(c => c.totalSpend > 0);
  const avgSpend = spenders.length ? spenders.reduce((s, c) => s + c.totalSpend, 0) / spenders.length : 0;
  const vipCount = collectors.filter(c => c.segment === 'VIP').length;

  const handleAdd = async () => {
    if (!newForm.name || !newForm.email) return;
    setSaving(true);
    const mediumPref = newForm.mediumPref
      ? newForm.mediumPref.split(',').map(m => m.trim()).filter(Boolean)
      : [];
    const { data, error } = await supabase
      .from('collectors')
      .insert({
        name:           newForm.name,
        email:          newForm.email,
        phone:          newForm.phone || null,
        location:       newForm.location || '—',
        country:        newForm.country || '—',
        tier:           newForm.segment,
        medium_pref:    mediumPref,
        source:         newForm.source || 'Direct',
        notes:          newForm.notes,
        ltv_zar:        0,
        total_spend:    0,
        purchase_count: 0,
        wishlist_count: 0,
        last_contact:   'Just added',
        tags:           [],
      })
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setCollectors(prev => [mapRow(data), ...prev]);
      setAdding(false);
      setNewForm({ name: '', email: '', phone: '', location: '', country: '', segment: 'Prospect', source: '', mediumPref: '', notes: '' });
    }
  };

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Collector CRM</span>
          <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            Your Collector Base
          </h2>
        </div>
        <button
          onClick={() => setAdding(c => !c)}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans uppercase tracking-widest transition-all shadow-button ${adding ? 'bg-charcoal text-background hover:bg-charcoal/80' : 'bg-terracotta text-background hover:bg-terracottaDark'}`}>
          {adding ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> Add Collector</>}
        </button>
      </div>

      {/* Add collector form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="bg-background border border-terracotta/20 p-5 sm:p-6 overflow-hidden"
          >
            <p className="font-serif italic text-lg text-charcoal mb-5">New collector</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { label: 'Full name *',  field: 'name',     ph: 'Tsepiso Mokhehle'            },
                { label: 'Email *',      field: 'email',    ph: 'collector@example.com'        },
                { label: 'Phone',        field: 'phone',    ph: '+266 5800 0000'               },
                { label: 'City',         field: 'location', ph: 'Maseru'                       },
                { label: 'Country',      field: 'country',  ph: 'Lesotho'                      },
                { label: 'Source',       field: 'source',   ph: 'Instagram, fair, studio visit…' },
              ] as const).map(({ label, field, ph }) => (
                <div key={field} className="group">
                  <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">{label}</label>
                  <input value={newForm[field]} onChange={e => setNewForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={ph}
                    className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
                </div>
              ))}
              <div className="group">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">Segment</label>
                <select value={newForm.segment} onChange={e => setNewForm(f => ({ ...f, segment: e.target.value as Collector['segment'] }))}
                  className="w-full bg-background border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors">
                  {(['Prospect', 'Workshop Participant', 'Collector', 'VIP'] as const).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="group">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">Medium preferences</label>
                <input value={newForm.mediumPref} onChange={e => setNewForm(f => ({ ...f, mediumPref: e.target.value }))}
                  placeholder="Painting, Drawing, Clay Model"
                  className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
              </div>
              <div className="sm:col-span-2 group">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">Studio notes</label>
                <input value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Key interests, context, budget range…"
                  className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-charcoal/8">
              <button onClick={() => setAdding(false)}
                className="px-4 py-2.5 text-xs font-sans uppercase tracking-widest text-muted border border-charcoal/15 hover:border-charcoal/25 transition-all">
                Cancel
              </button>
              <button disabled={!newForm.name || !newForm.email || saving}
                onClick={handleAdd}
                className="flex items-center gap-2 bg-terracotta text-background px-5 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button disabled:opacity-50">
                {saving
                  ? <div className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full animate-spin" />
                  : <><Check className="w-3.5 h-3.5" /> Add Collector</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total collectors', value: String(collectors.length),              color: '#A0522D' },
          { label: 'VIP collectors',   value: String(vipCount),                       color: '#7C8B6F' },
          { label: 'Total LTV',        value: `R ${(totalLTV / 1000).toFixed(0)}k`,  color: '#C4956A' },
          { label: 'Avg. spend',       value: `R ${(avgSpend / 1000).toFixed(0)}k`,  color: '#B8A088' },
        ].map(s => (
          <div key={s.label} className="bg-background border border-charcoal/8 p-4">
            <p className="text-label uppercase tracking-widest text-muted mb-1">{s.label}</p>
            <p className="font-serif text-2xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search collectors…"
            className="w-full bg-background border border-charcoal/12 pl-9 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-terracotta/40 transition-colors" />
        </div>
        <div className="flex gap-1.5">
          {([['all','All'],['vip','VIP'],['collector','Collectors'],['prospect','Prospects'],['workshop','Workshop']] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => setSegment(val as Segment)}
              className={`px-3 py-2 text-xs font-sans uppercase tracking-widest transition-all ${
                segment === val ? 'bg-charcoal text-background' : 'border border-charcoal/15 text-muted hover:border-charcoal/30'
              }`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center text-muted font-serif italic">Loading collectors…</div>
      )}
      {loadError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {/* Grid + detail panel */}
      {!loading && !loadError && (
        <div className={`grid gap-4 ${selected ? 'lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          <div className={selected ? 'lg:col-span-3 grid sm:grid-cols-2 gap-4 content-start' : 'col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'}>
            <AnimatePresence mode="popLayout">
              {filtered.map(c => (
                <CollectorCard key={c.id} c={c}
                  onSelect={() => setSelected(selected?.id === c.id ? null : c)} />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted font-serif italic">
                No collectors found.
              </div>
            )}
          </div>

          <AnimatePresence>
            {selected && (
              <div className="lg:col-span-2">
                <CollectorDetail c={selected} onClose={() => setSelected(null)} />
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
