import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, GitBranch,
  MessageSquare, Plus, ArrowRight, AlertCircle, CheckCircle,
  Clock, Star, Eye, Package, FileText, Megaphone, BarChart3
} from 'lucide-react';
import { artworks } from '../../data/artworks';
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

export function CommandCenter({ onNavigate }: CommandCenterProps) {
  const totalArtworks   = artworks.length;
  const availableWorks  = artworks.filter(a => a.status === 'Available').length;
  const soldWorks       = artworks.filter(a => a.status === 'Sold').length;
  const totalRevenue    = artworks.filter(a => a.status === 'Sold').reduce((s, a) => s + a.price * 18, 0);
  const sellThrough     = Math.round((soldWorks / totalArtworks) * 100);

  // Simulated data — wire to real backend
  const revenueData  = [12000, 18500, 14000, 22000, 19500, 28000, 24000, 31500];
  const visitorData  = [340, 420, 380, 510, 480, 620, 590, 710];
  const collectorsN  = 14;
  const commissionsN = 3;
  const pendingOrders = 2;
  const unreadMsgs   = 5;

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
          value={`R ${(totalRevenue / 1000).toFixed(0)}k`}
          sub="Total studio revenue"
          trend="+18%"
          trendUp
          sparkData={revenueData}
          color="#A0522D"
          icon={TrendingUp}
          onClick={() => onNavigate('analytics')}
        />
        <KpiCard
          label="Collectors"
          value={String(collectorsN)}
          sub={`${collectorsN} in CRM`}
          trend="+3 this month"
          trendUp
          sparkData={[6,7,8,9,10,11,12,14]}
          color="#7C8B6F"
          icon={Users}
          onClick={() => onNavigate('collectors')}
        />
        <KpiCard
          label="Commission Pipeline"
          value={String(commissionsN)}
          sub="Active commissions"
          sparkData={[1,2,1,3,2,4,3,3]}
          color="#C4956A"
          icon={GitBranch}
          onClick={() => onNavigate('commissions')}
        />
        <KpiCard
          label="Sell-through"
          value={`${sellThrough}%`}
          sub={`${soldWorks} of ${totalArtworks} works sold`}
          trend="Above 80% target"
          trendUp={sellThrough >= 80}
          sparkData={[60,62,65,68,70,72,75,sellThrough]}
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
          <ActionItem icon={MessageSquare} title={`${unreadMsgs} unread messages`}
            sub="3 commission inquiries" urgent onClick={() => onNavigate('messages')} />
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
                { label: 'Paintings', count: artworks.filter(a => a.medium === 'Painting').length, color: '#A0522D' },
                { label: 'Drawings',  count: artworks.filter(a => a.medium === 'Drawing').length,  color: '#7C8B6F' },
                { label: 'Sculpture', count: artworks.filter(a => a.medium === 'Clay Model').length, color: '#B8A088' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className="font-serif text-3xl text-charcoal mb-0.5" style={{ letterSpacing: '-0.02em' }}>
                    {m.count}
                  </p>
                  <div className="h-1 mx-auto mb-1" style={{ background: m.color, width: `${(m.count / totalArtworks) * 100}%`, maxWidth: '100%' }} />
                  <p className="text-label uppercase tracking-widest text-muted">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Recent artworks */}
            <div className="space-y-2">
              {artworks.slice(0, 4).map(art => (
                <div key={art.id}
                  className="flex items-center gap-3 py-2 border-t border-charcoal/5">
                  <div className="w-10 h-10 overflow-hidden flex-shrink-0 bg-parchment">
                    <img src={art.images[0]} alt={art.title} draggable={false}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: art.cropPosition }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-serif text-charcoal truncate">{art.title}</p>
                    <p className="text-xs text-muted">{art.technique}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-charcoal">R {(art.price * 18).toLocaleString()}</p>
                    <span className={`text-label uppercase tracking-widest ${art.status === 'Available' ? 'text-sage' : 'text-muted/50'}`}>
                      {art.status}
                    </span>
                  </div>
                </div>
              ))}
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


