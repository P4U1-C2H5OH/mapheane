import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, GitBranch,
  MessageSquare, Plus, ArrowRight, AlertCircle, CheckCircle,
  Clock, Star, Eye, Package, FileText, Megaphone, BarChart3
} from 'lucide-react';
import type { AdminView } from '../../pages/AdminDashboard';

interface CommandCenterProps {
  onNavigate: (view: AdminView) => void;
}

// ─── Inline sparkline ──────────────────────────────────────
function Sparkline({ data, color = '#A0522D', height = 28 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      <circle cx={pts.split(' ').pop()!.split(',')[0]} cy={pts.split(' ').pop()!.split(',')[1]}
        r="2.5" fill={color} />
    </svg>
  );
}

// ─── KPI card ─────────────────────────────────────────────
function KpiCard({
  label, value, sub, trend, trendUp, sparkData, color, icon: Icon, onClick
}: {
  label: string; value: string; sub: string; trend?: string; trendUp?: boolean;
  sparkData?: number[]; color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className={`bg-background border border-charcoal/8 p-5 ${onClick ? 'cursor-pointer hover:border-charcoal/20 hover:shadow-card' : ''} transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {sparkData && <Sparkline data={sparkData} color={color} />}
      </div>
      <p className="text-label uppercase tracking-widest text-muted mb-1">{label}</p>
      <p className="font-serif text-3xl text-charcoal mb-1" style={{ letterSpacing: '-0.01em' }}>{value}</p>
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted">{sub}</p>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs ${trendUp ? 'text-sage' : 'text-red-400'}`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Action item ───────────────────────────────────────────
function ActionItem({ icon: Icon, title, sub, urgent, onClick }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string; sub: string; urgent?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 border border-charcoal/8 hover:border-terracotta/30 hover:bg-parchment/40 transition-all duration-300 text-left group">
      <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${urgent ? 'bg-terracotta/12' : 'bg-charcoal/5'}`}>
        <Icon className={`w-4 h-4 ${urgent ? 'text-terracotta' : 'text-muted'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-charcoal group-hover:text-terracotta transition-colors truncate">{title}</p>
        <p className="text-xs text-muted">{sub}</p>
      </div>
      {urgent && <div className="w-2 h-2 rounded-full bg-terracotta flex-shrink-0 animate-pulse-soft" />}
      <ArrowRight className="w-3.5 h-3.5 text-muted/0 group-hover:text-muted/50 transition-all duration-200 flex-shrink-0" />
    </button>
  );
}

type DbArtwork = { id: string; title: string; medium: string; technique?: string; status: string; images: any[]; price_eur?: number };

export function CommandCenter({ onNavigate }: CommandCenterProps) {
  const [totalRevenue,      setTotalRevenue]      = useState(0);
  const [revenueData,       setRevenueData]       = useState<number[]>([0,0,0,0,0,0,0,0]);
  const [collectorsN,       setCollectorsN]       = useState(0);
  const [collectorsSparkline, setCollectorsSparkline] = useState<number[]>([0,0,0,0,0,0,0,0]);
  const [commissionsN,      setCommissionsN]      = useState(0);
  const [commSparkline,     setCommSparkline]     = useState<number[]>([0,0,0,0,0,0,0,0]);
  const [pendingOrders,     setPendingOrders]     = useState(0);
  const [unreadMsgs,        setUnreadMsgs]        = useState(0);
  const [dbArtworks,        setDbArtworks]        = useState<DbArtwork[]>([]);

  const totalArtworks  = dbArtworks.length;
  const soldWorks      = dbArtworks.filter(a => a.status === 'Sold').length;
  const sellThrough    = totalArtworks > 0 ? Math.round((soldWorks / totalArtworks) * 100) : 0;

  useEffect(() => {
    async function load() {
      const [ordersRes, commissionsRes, messagesRes, artworksRes] = await Promise.all([
        supabase.from('orders').select('total_zar, status, created_at, customer').neq('status', 'cancelled'),
        supabase.from('commissions').select('id, stage, created_at'),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
        supabase.from('artworks').select('id, title, medium, technique, status, images, price_eur'),
      ]);

      const orders = ordersRes.data ?? [];
      const commissions = commissionsRes.data ?? [];

      // Revenue + pending orders
      setTotalRevenue(orders.reduce((s, o) => s + (o.total_zar ?? 0), 0));
      setPendingOrders(orders.filter(o => o.status === 'pending').length);
      setUnreadMsgs(messagesRes.count ?? 0);

      // Artworks
      if (artworksRes.data?.length) {
        setDbArtworks(artworksRes.data.map(a => ({
          ...a,
          images: Array.isArray(a.images) ? a.images : (a.images ? [a.images] : []),
        })));
      }

      // Build last-8-month buckets
      const now = new Date();
      const monthBuckets = Array.from({ length: 8 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (7 - i), 1);
        return { year: d.getFullYear(), month: d.getMonth() };
      });

      // Revenue sparkline
      setRevenueData(monthBuckets.map(b =>
        orders.filter(o => {
          const d = new Date(o.created_at);
          return d.getFullYear() === b.year && d.getMonth() === b.month;
        }).reduce((s, o) => s + (o.total_zar ?? 0), 0)
      ));

      // Collectors sparkline: cumulative unique buyers up to end of each month
      const collectorSpark = monthBuckets.map(b => {
        const cutoff = new Date(b.year, b.month + 1, 0, 23, 59, 59);
        return new Set(
          orders
            .filter(o => new Date(o.created_at) <= cutoff)
            .map(o => o.customer?.email)
            .filter(Boolean)
        ).size;
      });
      setCollectorsN(collectorSpark[collectorSpark.length - 1]);
      setCollectorsSparkline(collectorSpark);

      // Commissions: active = not complete/cancelled
      const activeComms = commissions.filter(c => c.stage !== 'complete' && c.stage !== 'cancelled');
      setCommissionsN(activeComms.length);

      // Commission sparkline: count opened per month (cumulative active)
      setCommSparkline(monthBuckets.map(b => {
        const cutoff = new Date(b.year, b.month + 1, 0, 23, 59, 59);
        return commissions.filter(c => {
          const d = new Date(c.created_at);
          return d <= cutoff && c.stage !== 'cancelled';
        }).length;
      }));
    }
    load();
  }, []);

  const today = new Date();
  const hour  = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-label uppercase tracking-[0.25em] text-terracotta mb-1">
            {today.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            {greeting}, Mapheane.
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigate('gallery')}
            className="flex items-center gap-2 bg-terracotta text-background px-5 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button"
          >
            <Plus className="w-3.5 h-3.5" /> Add Artwork
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Revenue"
          value={totalRevenue > 0 ? `R ${(totalRevenue / 1000).toFixed(0)}k` : 'R 0'}
          sub="Revenue from orders"
          trend={pendingOrders > 0 ? `${pendingOrders} pending` : 'Up to date'}
          trendUp
          sparkData={revenueData}
          color="#A0522D"
          icon={TrendingUp}
          onClick={() => onNavigate('analytics')}
        />
        <KpiCard
          label="Collectors"
          value={String(collectorsN)}
          sub={`${collectorsN} unique buyers`}
          trend={collectorsN > 0 ? `${collectorsN} total` : 'None yet'}
          trendUp
          sparkData={collectorsSparkline}
          color="#7C8B6F"
          icon={Users}
          onClick={() => onNavigate('collectors')}
        />
        <KpiCard
          label="Commission Pipeline"
          value={String(commissionsN)}
          sub="Active commissions"
          sparkData={commSparkline}
          color="#C4956A"
          icon={GitBranch}
          onClick={() => onNavigate('commissions')}
        />
        <KpiCard
          label="Sell-through"
          value={`${sellThrough}%`}
          sub={totalArtworks > 0 ? `${soldWorks} of ${totalArtworks} works sold` : 'No artworks yet'}
          trend={sellThrough >= 80 ? 'Above 80% target' : 'Below 80% target'}
          trendUp={sellThrough >= 80}
          sparkData={[0,0,0,0,0,0,0,sellThrough]}
          color="#B8A088"
          icon={Star}
        />
      </div>

      {/* Main two-col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pending actions */}
        <div className="lg:col-span-1 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-serif italic text-lg text-charcoal">Needs attention</p>
            <span className="text-label text-muted">
              {pendingOrders + unreadMsgs + commissionsN} items
            </span>
          </div>

          <ActionItem icon={ShoppingBag} title={`${pendingOrders} orders awaiting verification`}
            sub="Payment proof uploaded" urgent onClick={() => onNavigate('orders')} />
          <ActionItem icon={MessageSquare} title={`${unreadMsgs} unread message${unreadMsgs !== 1 ? 's' : ''}`}
            sub="Check inbox for inquiries" urgent={unreadMsgs > 0} onClick={() => onNavigate('messages')} />
          <ActionItem icon={GitBranch} title="Commission: Ce Père Idéal"
            sub="Deposit received — begin creation" onClick={() => onNavigate('commissions')} />
          <ActionItem icon={Clock} title="Workshop — June 14"
            sub="3 spots remaining, 1 waitlist" onClick={() => onNavigate('workshops')} />
          <ActionItem icon={AlertCircle} title="Gallery Readiness: 68%"
            sub="Review checklist before Stevenson approach" onClick={() => onNavigate('readiness')} />
        </div>

        {/* Portfolio snapshot */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-serif italic text-lg text-charcoal">Portfolio snapshot</p>
            <button onClick={() => onNavigate('gallery')}
              className="text-xs font-sans uppercase tracking-widest text-muted hover:text-terracotta transition-colors">
              Manage gallery
            </button>
          </div>

          {/* Medium breakdown */}
          <div className="bg-background border border-charcoal/8 p-5">
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Paintings', count: dbArtworks.filter(a => a.medium === 'Painting').length, color: '#A0522D' },
                { label: 'Drawings',  count: dbArtworks.filter(a => a.medium === 'Drawing').length,  color: '#7C8B6F' },
                { label: 'Sculpture', count: dbArtworks.filter(a => a.medium === 'Clay Model').length, color: '#B8A088' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className="font-serif text-3xl text-charcoal mb-0.5" style={{ letterSpacing: '-0.02em' }}>
                    {m.count}
                  </p>
                  <div className="h-1 mx-auto mb-1" style={{ background: m.color, width: totalArtworks > 0 ? `${(m.count / totalArtworks) * 100}%` : '0%', maxWidth: '100%' }} />
                  <p className="text-label uppercase tracking-widest text-muted">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Recent artworks */}
            <div className="space-y-2">
              {dbArtworks.slice(0, 4).map(art => (
                <div key={art.id}
                  className="flex items-center gap-3 py-2 border-t border-charcoal/5">
                  <div className="w-10 h-10 overflow-hidden flex-shrink-0 bg-parchment">
                    {art.images?.[0] && (
                      <img src={art.images[0]} alt={art.title} draggable={false}
                        className="w-full h-full object-cover object-center" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-serif text-charcoal truncate">{art.title}</p>
                    <p className="text-xs text-muted">{art.technique ?? art.medium}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {art.price_eur != null && (
                      <p className="text-sm text-charcoal">R {(art.price_eur * 18).toLocaleString()}</p>
                    )}
                    <span className={`text-label uppercase tracking-widest ${art.status === 'Available' ? 'text-sage' : 'text-muted/50'}`}>
                      {art.status}
                    </span>
                  </div>
                </div>
              ))}
              {dbArtworks.length === 0 && (
                <p className="text-xs text-muted text-center py-4">No artworks in database yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Direct sales',    value: `R ${(totalRevenue * 0.62 / 1000).toFixed(0)}k`, pct: 62, color: '#A0522D' },
          { label: 'Commissions',     value: `R ${(totalRevenue * 0.21 / 1000).toFixed(0)}k`, pct: 21, color: '#7C8B6F' },
          { label: 'Workshops',       value: `R ${(totalRevenue * 0.11 / 1000).toFixed(0)}k`, pct: 11, color: '#C4956A' },
          { label: 'Print editions',  value: `R ${(totalRevenue * 0.06 / 1000).toFixed(0)}k`, pct:  6, color: '#B8A088' },
        ].map(row => (
          <div key={row.label} className="bg-background border border-charcoal/8 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-label uppercase tracking-widest text-muted">{row.label}</p>
              <p className="text-xs text-muted">{row.pct}%</p>
            </div>
            <p className="font-serif text-xl text-charcoal mb-2">{row.value}</p>
            <div className="h-px bg-charcoal/6">
              <div className="h-px" style={{ width: `${row.pct}%`, background: row.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick links row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'New artwork',    icon: Plus,    view: 'gallery'     as AdminView, color: 'bg-terracotta text-background' },
          { label: 'Write moment',  icon: FileText, view: 'moments'     as AdminView, color: 'bg-charcoal text-background' },
          { label: 'Email blast',   icon: Megaphone,view: 'marketing'   as AdminView, color: 'bg-sage text-background' },
          { label: 'Analytics',     icon: BarChart3,view: 'analytics'   as AdminView, color: 'bg-parchment text-charcoal border border-charcoal/12' },
        ].map(({ label, icon: Icon, view, color }) => (
          <button key={label} onClick={() => onNavigate(view)}
            className={`flex items-center gap-2.5 px-4 py-3 text-xs font-sans uppercase tracking-widest transition-all duration-300 hover:opacity-80 ${color}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}


