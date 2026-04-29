import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Archive, Mail, Search, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type RequestStatus = 'new' | 'contacted' | 'converted' | 'archived';

interface AvailabilityRequest {
  id: string;
  artworkId?: string;
  artworkTitle: string;
  email: string;
  name?: string;
  phone?: string;
  source?: string;
  status: RequestStatus;
  collectorId?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<RequestStatus, string> = {
  new:       'bg-terracotta/10 text-terracotta',
  contacted: 'bg-gold/15 text-charcoalLight',
  converted: 'bg-sage/12 text-sageDark',
  archived:  'bg-charcoal/8 text-muted',
};

function mapRow(row: any): AvailabilityRequest {
  return {
    id: row.id,
    artworkId: row.artwork_id ?? undefined,
    artworkTitle: row.artwork_title ?? 'Untitled',
    email: row.email,
    name: row.name ?? undefined,
    phone: row.phone ?? undefined,
    source: row.source ?? undefined,
    status: row.status ?? 'new',
    collectorId: row.collector_id ?? undefined,
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })
      : '—',
  };
}

export function AvailabilityRequests() {
  const [requests, setRequests] = useState<AvailabilityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('new');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState('');

  useEffect(() => {
    supabase
      .from('availability_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Availability requests load error:', error);
          setError('Unable to load availability requests.');
        } else {
          setRequests((data ?? []).map(mapRow));
        }
        setLoading(false);
      });
  }, []);

  const filtered = requests.filter(req => {
    if (filter !== 'all' && req.status !== filter) return false;
    const haystack = `${req.artworkTitle} ${req.email} ${req.name ?? ''}`.toLowerCase();
    return !search || haystack.includes(search.toLowerCase());
  });

  const counts = {
    new: requests.filter(r => r.status === 'new').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    converted: requests.filter(r => r.status === 'converted').length,
    archived: requests.filter(r => r.status === 'archived').length,
  };

  const updateStatus = async (request: AvailabilityRequest, status: RequestStatus) => {
    setUpdating(request.id);
    setError('');
    const { error } = await supabase
      .from('availability_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', request.id);
    if (error) {
      console.error('Availability request update error:', error);
      setError('Unable to update request.');
      setUpdating('');
      return;
    }
    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status } : r));
    setUpdating('');
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Waitlist</span>
          <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            Availability Requests
          </h2>
          <p className="text-xs text-muted mt-1.5">People asking to be notified about sold works.</p>
        </div>
        <div className="flex items-center gap-2 bg-background border border-charcoal/8 px-4 py-3">
          <Bell className="w-4 h-4 text-terracotta" />
          <span className="font-serif text-xl text-charcoal">{counts.new}</span>
          <span className="text-label uppercase tracking-widest text-muted">new</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          ['new', 'New'],
          ['contacted', 'Contacted'],
          ['converted', 'Converted'],
          ['archived', 'Archived'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`bg-background border p-4 text-left transition-all ${
              filter === key ? 'border-terracotta/40 shadow-card' : 'border-charcoal/8 hover:border-charcoal/20'
            }`}
          >
            <p className="text-label uppercase tracking-widest text-muted mb-1">{label}</p>
            <p className="font-serif text-2xl text-charcoal">{counts[key]}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search artwork, email, or name..."
            className="w-full bg-background border border-charcoal/12 pl-9 pr-4 py-2.5 text-sm text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-terracotta/40 transition-colors"
          />
        </div>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2.5 text-xs font-sans uppercase tracking-widest border transition-all ${
            filter === 'all' ? 'bg-charcoal text-background border-charcoal' : 'border-charcoal/15 text-muted hover:border-charcoal/30'
          }`}
        >
          All
        </button>
      </div>

      {loading && (
        <div className="py-16 text-center text-muted font-serif italic">Loading requests...</div>
      )}

      {!loading && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map(req => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-background border border-charcoal/8 p-5 flex flex-col lg:flex-row lg:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${STATUS_STYLES[req.status]}`}>
                      {req.status}
                    </span>
                    <span className="text-label text-muted">{req.source ?? 'public'}</span>
                  </div>
                  <p className="font-serif italic text-charcoal text-lg truncate">{req.artworkTitle}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted">
                    <span>{req.name ?? 'No name'}</span>
                    <a href={`mailto:${req.email}`} className="hover:text-terracotta">{req.email}</a>
                    {req.phone && <span>{req.phone}</span>}
                    <span>{req.createdAt}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${req.email}?subject=${encodeURIComponent(`About ${req.artworkTitle}`)}`}
                    className="flex items-center gap-2 px-3 py-2 bg-terracotta text-background text-[10px] font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors"
                  >
                    <Mail className="w-3 h-3" /> Email
                  </a>
                  {req.status !== 'contacted' && (
                    <button
                      disabled={updating === req.id}
                      onClick={() => updateStatus(req, 'contacted')}
                      className="flex items-center gap-2 px-3 py-2 border border-charcoal/15 text-muted text-[10px] font-sans uppercase tracking-widest hover:border-charcoal/30 hover:text-charcoal transition-all disabled:opacity-50"
                    >
                      <ExternalLink className="w-3 h-3" /> Contacted
                    </button>
                  )}
                  {req.status !== 'converted' && (
                    <button
                      disabled={updating === req.id}
                      onClick={() => updateStatus(req, 'converted')}
                      className="flex items-center gap-2 px-3 py-2 border border-sage/30 text-sageDark text-[10px] font-sans uppercase tracking-widest hover:bg-sage/10 transition-all disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" /> Converted
                    </button>
                  )}
                  {req.status !== 'archived' && (
                    <button
                      disabled={updating === req.id}
                      onClick={() => updateStatus(req, 'archived')}
                      className="flex items-center gap-2 px-3 py-2 border border-charcoal/10 text-muted text-[10px] font-sans uppercase tracking-widest hover:border-charcoal/25 transition-all disabled:opacity-50"
                    >
                      <Archive className="w-3 h-3" /> Archive
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="bg-background border border-charcoal/8 p-8 text-center text-muted font-serif italic">
              No availability requests found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
