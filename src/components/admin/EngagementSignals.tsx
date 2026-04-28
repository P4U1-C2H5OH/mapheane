import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Activity, Bell, CalendarPlus, ExternalLink, Heart, MousePointerClick,
  RefreshCcw, Share2, ShoppingBag, Star,
} from 'lucide-react';

interface InteractionRow {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  target_title: string | null;
  source: string | null;
  visitor_id: string | null;
  page: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  artwork_view: 'Artwork views',
  event_view: 'Event views',
  moment_view: 'Moment views',
  quick_view: 'Quick views',
  wishlist_add: 'Saves',
  wishlist_remove: 'Unsaves',
  moment_like: 'Moment likes',
  moment_unlike: 'Moment unlikes',
  cart_add: 'Cart adds',
  share: 'Shares',
  calendar_add: 'Calendar adds',
  ticket_click: 'Ticket clicks',
  rsvp: 'RSVPs',
  notify_request: 'Notify requests',
  newsletter_signup: 'Newsletter signups',
};

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  artwork_view: MousePointerClick,
  event_view: MousePointerClick,
  moment_view: MousePointerClick,
  quick_view: MousePointerClick,
  wishlist_add: Heart,
  wishlist_remove: Heart,
  moment_like: Heart,
  moment_unlike: Heart,
  cart_add: ShoppingBag,
  share: Share2,
  calendar_add: CalendarPlus,
  ticket_click: ExternalLink,
  rsvp: Star,
  notify_request: Bell,
  newsletter_signup: Bell,
};

function formatTime(value: string) {
  return new Date(value).toLocaleString('en-ZA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function countBy<T extends string>(rows: InteractionRow[], getKey: (row: InteractionRow) => T | null | undefined) {
  const counts = new Map<T, number>();
  rows.forEach(row => {
    const key = getKey(row);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function StatCard({ label, value, sub, icon: Icon }: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-charcoal/8 bg-background p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 bg-terracotta/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-terracotta" />
        </div>
      </div>
      <p className="text-label uppercase tracking-widest text-muted mb-1">{label}</p>
      <p className="font-serif text-3xl text-charcoal">{value}</p>
      <p className="text-xs text-muted mt-1">{sub}</p>
    </div>
  );
}

export function EngagementSignals() {
  const [rows, setRows] = useState<InteractionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data, error } = await supabase
      .from('public_interactions')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(250);

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as InteractionRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const visitors = new Set(rows.map(row => row.visitor_id).filter(Boolean)).size;
    const intent = rows.filter(row => ['wishlist_add', 'moment_like', 'cart_add', 'rsvp', 'notify_request', 'ticket_click'].includes(row.action)).length;
    const commerce = rows.filter(row => ['cart_add', 'notify_request'].includes(row.action)).length;
    return { visitors, intent, commerce };
  }, [rows]);

  const byAction = useMemo(() => countBy(rows, row => row.action), [rows]);
  const byTarget = useMemo(() => countBy(rows, row =>
    row.target_title ? `${row.target_type}: ${row.target_title}` : row.target_type
  ).slice(0, 8), [rows]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Signals</span>
          <h2 className="font-serif text-3xl italic text-charcoal">Public engagement</h2>
          <p className="text-sm text-muted mt-1">Visitor intent from the last 30 days, captured from public gallery, shop, moments, and events.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 border border-charcoal/12 px-4 py-2.5 text-xs font-sans uppercase tracking-widest text-muted hover:text-charcoal hover:border-charcoal/25 disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Unable to load engagement signals: {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Interactions" value={String(rows.length)} sub="Captured public events" icon={Activity} />
        <StatCard label="Visitors" value={String(stats.visitors)} sub="Anonymous browser IDs" icon={MousePointerClick} />
        <StatCard label="Intent" value={String(stats.intent)} sub="Saves, likes, RSVPs, cart adds" icon={Heart} />
        <StatCard label="Commerce" value={String(stats.commerce)} sub="Cart adds and notify requests" icon={ShoppingBag} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="border border-charcoal/8 bg-background">
          <div className="px-5 py-4 border-b border-charcoal/8">
            <p className="font-serif italic text-lg text-charcoal">Actions</p>
          </div>
          <div className="divide-y divide-charcoal/6">
            {byAction.map(([action, count]) => {
              const Icon = ACTION_ICONS[action] ?? Activity;
              return (
                <div key={action} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-terracotta" />
                    <span className="text-sm text-charcoal">{ACTION_LABELS[action] ?? action}</span>
                  </div>
                  <span className="font-serif text-xl text-charcoal">{count}</span>
                </div>
              );
            })}
            {!loading && byAction.length === 0 && (
              <div className="px-5 py-10 text-center text-muted font-serif italic">No public signals captured yet.</div>
            )}
          </div>
        </div>

        <div className="border border-charcoal/8 bg-background">
          <div className="px-5 py-4 border-b border-charcoal/8">
            <p className="font-serif italic text-lg text-charcoal">Top targets</p>
          </div>
          <div className="divide-y divide-charcoal/6">
            {byTarget.map(([target, count]) => (
              <div key={target} className="px-5 py-3 flex items-center justify-between gap-4">
                <span className="text-sm text-charcoal truncate">{target}</span>
                <span className="font-serif text-xl text-charcoal">{count}</span>
              </div>
            ))}
            {!loading && byTarget.length === 0 && (
              <div className="px-5 py-10 text-center text-muted font-serif italic">No target data yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="border border-charcoal/8 bg-background">
        <div className="px-5 py-4 border-b border-charcoal/8">
          <p className="font-serif italic text-lg text-charcoal">Recent signals</p>
        </div>
        <div className="divide-y divide-charcoal/6">
          {rows.slice(0, 30).map(row => {
            const Icon = ACTION_ICONS[row.action] ?? Activity;
            return (
              <div key={row.id} className="px-5 py-3 grid grid-cols-12 gap-3 items-center">
                <div className="col-span-12 md:col-span-5 flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 text-terracotta flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-charcoal truncate">{row.target_title ?? row.target_type}</p>
                    <p className="text-xs text-muted">{ACTION_LABELS[row.action] ?? row.action}</p>
                  </div>
                </div>
                <p className="col-span-6 md:col-span-3 text-xs text-muted truncate">{row.source ?? 'public'}</p>
                <p className="col-span-6 md:col-span-2 text-xs text-muted truncate">{row.target_type}</p>
                <p className="col-span-12 md:col-span-2 text-xs text-muted md:text-right">{formatTime(row.created_at)}</p>
              </div>
            );
          })}
          {loading && (
            <div className="px-5 py-10 text-center text-muted font-serif italic">Loading engagement signals...</div>
          )}
        </div>
      </div>
    </div>
  );
}
