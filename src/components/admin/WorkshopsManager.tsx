import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Users, Calendar, Clock, MapPin, Check, X,
  ChevronDown, ChevronUp, Mail, AlertCircle, BookOpen,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatZar } from '../../lib/pricing';

interface Booking {
  id: string;
  name: string;
  email: string;
  country: string;
  tickets: number;
  status: 'confirmed' | 'waitlist' | 'pending';
  paidAt?: string;
  notes?: string;
}

interface Workshop {
  id: string; // UUID from Supabase
  title: string;
  medium: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  capacity: number;
  price: { local: string; intl: string };
  bookings: Booking[];
  waitlist: Booking[];
  status: 'upcoming' | 'full' | 'past' | 'draft';
  revenue: number;
  description: string;
  materials: string[];
}

function mapRow(row: Record<string, unknown>): Workshop {
  return {
    id:          row.id as string,
    title:       (row.title       as string) ?? '',
    medium:      (row.medium      as string) ?? '',
    date:        (row.date        as string) ?? '',
    time:        (row.time        as string) ?? '',
    duration:    (row.duration    as string) ?? '',
    location:    (row.location    as string) ?? '',
    capacity:    (row.capacity    as number) ?? 8,
    price:       { local: (row.price_local as string) ?? '', intl: (row.price_intl as string) ?? '' },
    bookings:    Array.isArray(row.bookings)  ? (row.bookings  as Booking[]) : [],
    waitlist:    Array.isArray(row.waitlist)  ? (row.waitlist  as Booking[]) : [],
    status:      ((row.status ?? 'upcoming') as Workshop['status']),
    revenue:     (row.revenue     as number) ?? 0,
    description: (row.description as string) ?? '',
    materials:   Array.isArray(row.materials) ? (row.materials as string[]) : [],
  };
}

const STATUS_PILL: Record<string, string> = {
  upcoming: 'bg-sage/12 text-sageDark',
  full:     'bg-terracotta/12 text-terracotta',
  past:     'bg-charcoal/8 text-muted',
  draft:    'bg-gold/15 text-charcoalLight',
};

export function WorkshopsManager() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selected, setSelected]   = useState<Workshop | null>(null);
  const [expandedMat, setExpandMat] = useState(false);
  const [filter, setFilter]       = useState<'all' | 'upcoming' | 'past'>('all');
  const [creating, setCreating]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [newForm, setNewForm]     = useState({
    title: '', medium: '', date: '', time: '', duration: '',
    location: "Mapheane's Studio, Maseru", capacity: '8',
    priceLocal: '', priceIntl: '', description: '', materials: '',
  });

  useEffect(() => {
    supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []).map(mapRow);
        setWorkshops(rows);
        if (rows.length > 0) setSelected(rows[0]);
        setLoading(false);
      });
  }, []);

  const filtered = workshops.filter(w =>
    filter === 'all'      ? true :
    filter === 'upcoming' ? ['upcoming','full','draft'].includes(w.status) :
    w.status === 'past'
  );

  const totalRevenue  = workshops.filter(w => w.status === 'past').reduce((s, w) => s + w.revenue, 0);
  const upcomingCount = workshops.filter(w => w.status === 'upcoming').length;
  const totalStudents = workshops.filter(w => w.status === 'past')
    .reduce((s, w) => s + w.bookings.reduce((b, bk) => b + bk.tickets, 0), 0);

  const handleAdd = async () => {
    if (!newForm.title?.trim()) {
      alert('Please provide a workshop title.');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('workshops')
        .insert({
          title:       newForm.title,
          medium:      newForm.medium,
          date:        newForm.date,
          time:        newForm.time,
          duration:    newForm.duration,
          location:    newForm.location,
          capacity:    Number(newForm.capacity) || 8,
          price_local: newForm.priceLocal,
          price_intl:  newForm.priceIntl,
          status:      'upcoming',
          revenue:     0,
          description: '',
          materials:   newForm.materials.split(',').map(m => m.trim()).filter(Boolean),
          bookings:    [],
          waitlist:    [],
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setWorkshops(prev => [mapRow(data), ...prev]);
        setCreating(false);
        setNewForm({
          title: '', medium: '', date: '', time: '', duration: '',
          location: "Mapheane's Studio, Maseru", capacity: '8',
          priceLocal: '', priceIntl: '', description: '', materials: '',
        });
      }
    } catch (error) {
      console.error('Failed to create workshop:', error);
      alert('Unable to create the workshop right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Workshops</span>
          <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>Workshop Manager</h2>
        </div>
        <button onClick={() => setCreating(c => !c)}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans uppercase tracking-widest transition-all shadow-button ${creating ? 'bg-charcoal text-background hover:bg-charcoal/80' : 'bg-terracotta text-background hover:bg-terracottaDark'}`}>
          {creating ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> New Workshop</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Revenue (completed)', value: `R ${(totalRevenue / 1000).toFixed(0)}k`, color: '#A0522D' },
          { label: 'Upcoming sessions',   value: String(upcomingCount),                    color: '#7C8B6F' },
          { label: 'Students taught',     value: String(totalStudents),                    color: '#C4956A' },
        ].map(s => (
          <div key={s.label} className="bg-background border border-charcoal/8 p-4">
            <p className="text-label uppercase tracking-widest text-muted mb-1">{s.label}</p>
            <p className="font-serif text-2xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {(['all','upcoming','past'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-sans uppercase tracking-widest transition-all capitalize ${
              filter === f ? 'bg-charcoal text-background' : 'border border-charcoal/15 text-muted hover:border-charcoal/30'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Create new workshop form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="bg-background border border-terracotta/20 p-5 sm:p-6 overflow-hidden"
          >
            <p className="font-serif italic text-lg text-charcoal mb-5">New workshop details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { label: 'Title',            field: 'title',      ph: 'Resin Canvas Magic'     },
                { label: 'Medium / focus',   field: 'medium',     ph: 'Mixed Media Painting'   },
                { label: 'Date',             field: 'date',       ph: 'August 14, 2026'        },
                { label: 'Time',             field: 'time',       ph: '9:00 AM – 4:00 PM'      },
                { label: 'Duration',         field: 'duration',   ph: '7 hours'                },
                { label: 'Max participants', field: 'capacity',   ph: '8'                      },
                { label: 'Local price',      field: 'priceLocal', ph: 'R1,400'                 },
                { label: 'Intl price',       field: 'priceIntl',  ph: '$80 USD'                },
              ] as const).map(({ label, field, ph }) => (
                <div key={field} className="group">
                  <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">{label}</label>
                  <input value={newForm[field]} onChange={e => setNewForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={ph}
                    className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
                </div>
              ))}
              <div className="sm:col-span-2 group">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">Location</label>
                <input value={newForm.location} onChange={e => setNewForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors" />
              </div>
              <div className="sm:col-span-2 group">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">Materials (comma-separated)</label>
                <input value={newForm.materials} onChange={e => setNewForm(f => ({ ...f, materials: e.target.value }))}
                  placeholder="Resin kit (provided), Canvas 50×70cm, Pigments"
                  className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-charcoal/8">
              <button onClick={() => setCreating(false)}
                className="px-4 py-2.5 text-xs font-sans uppercase tracking-widest text-muted border border-charcoal/15 hover:border-charcoal/25 transition-all">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={!newForm.title || saving}
                className="flex items-center gap-2 bg-terracotta text-background px-5 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button disabled:opacity-50">
                {saving
                  ? <div className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full animate-spin" />
                  : 'Create Workshop'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="py-16 text-center text-muted font-serif italic">Loading workshops…</div>
      )}

      {/* Workshop list + detail */}
      {!loading && (
        <div className={`grid gap-4 ${selected ? 'lg:grid-cols-5' : 'grid-cols-1'}`}>

          {/* List */}
          <div className={`${selected ? 'lg:col-span-2' : 'col-span-full grid sm:grid-cols-2 lg:grid-cols-3 gap-4'} space-y-3`}>
            {filtered.map(w => {
              const filled      = w.bookings.reduce((s, b) => s + b.tickets, 0);
              const pct         = Math.round((filled / w.capacity) * 100);
              const isSelected  = selected?.id === w.id;
              return (
                <motion.div key={w.id} layout
                  onClick={() => setSelected(isSelected ? null : w)}
                  className={`bg-background border cursor-pointer transition-all duration-300 p-4 ${isSelected ? 'border-terracotta shadow-card' : 'border-charcoal/8 hover:border-charcoal/20 hover:shadow-card-hover'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif italic text-charcoal truncate">{w.title}</p>
                      <p className="text-xs text-muted">{w.medium}</p>
                    </div>
                    <span className={`text-[10px] font-sans px-2 py-0.5 uppercase tracking-widest ml-2 flex-shrink-0 ${STATUS_PILL[w.status]}`}>
                      {w.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{w.date}</span>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-label text-muted">{filled}/{w.capacity} booked</span>
                      <span className="text-label" style={{ color: pct === 100 ? '#A0522D' : '#7C8B6F' }}>{pct}%</span>
                    </div>
                    <div className="h-1 bg-charcoal/8">
                      <div className="h-1 transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#A0522D' : '#7C8B6F' }} />
                    </div>
                  </div>

                  {w.waitlist.length > 0 && (
                    <p className="text-xs text-terracotta flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {w.waitlist.length} on waitlist
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-charcoal/5">
                    <span className="text-xs text-muted">{w.price.local} / {w.price.intl}</span>
                    <span className="text-xs text-charcoal font-sans">{formatZar(w.revenue)}</span>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && !loading && (
              <div className="text-center py-16 text-muted font-serif italic">No workshops found.</div>
            )}
          </div>

          {/* Detail */}
          <AnimatePresence>
            {selected && (
              <motion.div key={selected.id}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="lg:col-span-3 bg-background border border-charcoal/8 overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 14rem)' }}
              >
                <div className="sticky top-0 bg-background border-b border-charcoal/8 px-5 py-4 flex justify-between items-start">
                  <div>
                    <p className="font-serif italic text-xl text-charcoal">{selected.title}</p>
                    <p className="text-xs text-muted mt-0.5">{selected.medium}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-muted hover:text-charcoal transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Workshop info */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { Icon: Calendar, label: selected.date },
                      { Icon: Clock,    label: `${selected.time} · ${selected.duration}` },
                      { Icon: MapPin,   label: selected.location },
                      { Icon: Users,    label: `${selected.bookings.reduce((s,b) => s+b.tickets, 0)} / ${selected.capacity} participants` },
                    ].map(({ Icon, label }) => (
                      <div key={label} className="flex items-start gap-2 text-sm text-charcoal/70">
                        <Icon className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Revenue */}
                  <div className="bg-parchment/50 p-4 border border-charcoal/6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-label text-muted mb-0.5">Workshop revenue</p>
                        <p className="font-serif text-2xl text-terracotta">{formatZar(selected.revenue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-label text-muted mb-0.5">Pricing</p>
                        <p className="text-sm text-charcoal">{selected.price.local}</p>
                        <p className="text-xs text-muted">{selected.price.intl}</p>
                      </div>
                    </div>
                  </div>

                  {/* Materials */}
                  {selected.materials.length > 0 && (
                    <div>
                      <button onClick={() => setExpandMat(e => !e)}
                        className="flex items-center gap-2 text-sm font-sans text-muted hover:text-charcoal transition-colors mb-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        Materials list
                        {expandedMat ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <AnimatePresence>
                        {expandedMat && (
                          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-1 pl-5">
                            {selected.materials.map(m => (
                              <li key={m} className="text-xs text-charcoal/70 flex items-center gap-2">
                                <div className="w-1 h-1 bg-terracotta rounded-full flex-shrink-0" />
                                {m}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Bookings */}
                  <div>
                    <p className="text-label uppercase tracking-widest text-muted mb-3">
                      Confirmed bookings ({selected.bookings.reduce((s,b) => s+b.tickets, 0)})
                    </p>
                    <div className="space-y-2">
                      {selected.bookings.map(b => (
                        <div key={b.id} className="flex items-center gap-3 p-3 border border-charcoal/6 hover:border-charcoal/12 transition-colors">
                          <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-sans bg-sage/15 text-sageDark">
                            {b.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-charcoal truncate">{b.name}</p>
                            <p className="text-xs text-muted">{b.country} · {b.tickets} ticket{b.tickets !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {b.paidAt && <span className="text-xs text-muted">{b.paidAt}</span>}
                            <Check className="w-3.5 h-3.5 text-sage" />
                            <a href={`mailto:${b.email}`} className="text-muted hover:text-terracotta transition-colors">
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                      {selected.bookings.length === 0 && (
                        <p className="text-xs text-muted italic py-2">No confirmed bookings yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Waitlist */}
                  {selected.waitlist.length > 0 && (
                    <div>
                      <p className="text-label uppercase tracking-widest text-muted mb-3">
                        Waitlist ({selected.waitlist.length})
                      </p>
                      <div className="space-y-2">
                        {selected.waitlist.map(b => (
                          <div key={b.id} className="flex items-center gap-3 p-3 border border-terracotta/15 bg-terracotta/4">
                            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-sans bg-terracotta/15 text-terracotta">
                              {b.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-charcoal">{b.name}</p>
                              <p className="text-xs text-muted">{b.country}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {selected.status === 'upcoming' && (
                    <div className="space-y-2 pt-2">
                      <a href={`mailto:${selected.bookings.map(b => b.email).join(',')}`}
                        className="w-full flex items-center justify-center gap-2 bg-terracotta text-background py-3 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors">
                        <Mail className="w-3.5 h-3.5" /> Email All Participants
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
