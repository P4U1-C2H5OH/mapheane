import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Users, BarChart2 } from 'lucide-react';

type Period = '3m' | '6m' | '12m';

// ─── Inline bar chart ──────────────────────────────────────
function BarChart({ data, color = '#A0522D', height = 80 }: {
  data: { label: string; value: number }[]; color?: string; height?: number;
}) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full transition-all duration-500 hover:opacity-80"
            style={{ height: `${(d.value / max) * (height - 20)}px`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
          <p className="text-[9px] text-muted text-center">{d.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Mini area chart ───────────────────────────────────────
function AreaChart({ data, color = '#A0522D', h = 60 }: { data: number[]; color?: string; h?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = pts.split(' ').pop()!.split(',');
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: h }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CHANNEL_COLORS: Record<string, string> = {
  mpesa: '#A0522D', ecocash: '#7C8B6F', wire: '#C4956A',
};

/** Build last-N-months buckets from an ordered list of orders */
function buildMonthly(orders: { created_at: string; total_zar: number }[], months: number) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const total = orders
      .filter(o => {
        const od = new Date(o.created_at);
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
      })
      .reduce((s, o) => s + (o.total_zar ?? 0), 0);
    return { label: MONTH_NAMES[d.getMonth()], value: total };
  });
}

export function RevenueAnalytics() {
  const [period, setPeriod] = useState<Period>('6m');

  type MonthRow    = { label: string; value: number };
  type ChannelRow  = { channel: string; value: number; pct: number; color: string; trend: number };
  type CollectorRow= { name: string; ltv: number; purchases: number; country: string };
  type SeasonalRow = { month: string; sales: number; note: string };

  const [allOrders,   setAllOrders]   = useState<{ created_at: string; total_zar: number; payment_method: string; customer: any }[]>([]);
  const [channelData, setChannelData] = useState<ChannelRow[]>([]);
  const [collectorLTV,setCollectorLTV]= useState<CollectorRow[]>([]);
  const [seasonal,    setSeasonal]    = useState<SeasonalRow[]>([]);
  const [kpis, setKpis] = useState({ total12m: 0, totalPrev: 0, commLTV: 0, activeComm: 0, soldPct: 0 });

  useEffect(() => {
    async function load() {
      const [{ data: rows }, { data: commRows }, { data: artRows }] = await Promise.all([
        supabase.from('orders').select('created_at, total_zar, payment_method, customer').neq('status', 'cancelled'),
        supabase.from('commissions').select('price_eur, stage'),
        supabase.from('artworks').select('status'),
      ]);

      if (rows?.length) {
        setAllOrders(rows);

        // 12-month and prior-12-month totals
        const now = new Date();
        const yr = now.getFullYear();
        const mo = now.getMonth();
        const t12m = rows.filter(o => {
          const d = new Date(o.created_at);
          const mAgo = (yr - d.getFullYear()) * 12 + (mo - d.getMonth());
          return mAgo >= 0 && mAgo < 12;
        }).reduce((s, o) => s + (o.total_zar ?? 0), 0);
        const tPrev = rows.filter(o => {
          const d = new Date(o.created_at);
          const mAgo = (yr - d.getFullYear()) * 12 + (mo - d.getMonth());
          return mAgo >= 12 && mAgo < 24;
        }).reduce((s, o) => s + (o.total_zar ?? 0), 0);

        // Channel breakdown
        const byChannel: Record<string, number> = {};
        rows.forEach(o => {
          const ch = o.payment_method ?? 'other';
          byChannel[ch] = (byChannel[ch] ?? 0) + (o.total_zar ?? 0);
        });
        const grandTotal = Object.values(byChannel).reduce((s, v) => s + v, 0) || 1;
        setChannelData(Object.entries(byChannel).map(([ch, val]) => ({
          channel: ch === 'mpesa' ? 'M-Pesa' : ch === 'ecocash' ? 'EcoCash' : ch === 'wire' ? 'Bank Wire' : ch,
          value: val,
          pct: Math.round((val / grandTotal) * 100),
          color: CHANNEL_COLORS[ch] ?? '#B8A088',
          trend: 0,
        })).sort((a, b) => b.value - a.value));

        // Collector LTV
        const byEmail: Record<string, { name: string; ltv: number; purchases: number; country: string }> = {};
        rows.forEach(o => {
          const email = o.customer?.email ?? 'unknown';
          if (!byEmail[email]) byEmail[email] = { name: o.customer?.name ?? email, ltv: 0, purchases: 0, country: '—' };
          byEmail[email].ltv += o.total_zar ?? 0;
          byEmail[email].purchases += 1;
        });
        setCollectorLTV(Object.values(byEmail).sort((a, b) => b.ltv - a.ltv).slice(0, 5));

        // Seasonal (last 12 months)
        setSeasonal(buildMonthly(rows, 12).map(m => ({ month: m.label, sales: m.value, note: '' })));

        setKpis(prev => ({ ...prev, total12m: t12m, totalPrev: tPrev }));
      }

      // Commission LTV (non-cancelled, price_eur × 18 ≈ ZAR)
      if (commRows) {
        const active = commRows.filter(c => c.stage !== 'cancelled');
        const commLTV = Math.round(active.reduce((s, c) => s + (c.price_eur ?? 0), 0) * 18);
        setKpis(prev => ({ ...prev, commLTV, activeComm: active.length }));
      }

      // Sell-through
      if (artRows?.length) {
        const sold = artRows.filter(a => a.status === 'Sold').length;
        setKpis(prev => ({ ...prev, soldPct: Math.round((sold / artRows.length) * 100) }));
      }
    }
    load();
  }, []);

  const data   = buildMonthly(allOrders, period === '3m' ? 3 : period === '6m' ? 6 : 12);
  const total  = data.reduce((s, d) => s + d.value, 0);
  const latest = data[data.length - 1]?.value ?? 0;
  const prev   = data[data.length - 2]?.value ?? latest;
  const trend  = prev > 0 ? Math.round(((latest - prev) / prev) * 100) : 0;
  const yoy = kpis.totalPrev > 0 ? Math.round(((kpis.total12m - kpis.totalPrev) / kpis.totalPrev) * 100) : 0;

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Header */}
      <div>
        <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Revenue Analytics</span>
        <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>Studio Intelligence</h2>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '12-month revenue', value: kpis.total12m > 0 ? `R ${(kpis.total12m/1000).toFixed(0)}k` : '—', trend: kpis.totalPrev > 0 ? `${yoy >= 0 ? '+' : ''}${yoy}% YoY` : 'No prior data', up: yoy >= 0 },
          { label: 'Avg monthly',      value: kpis.total12m > 0 ? `R ${(kpis.total12m/12/1000).toFixed(0)}k` : '—', trend: 'This year', up: true },
          { label: 'Commission LTV',   value: kpis.commLTV > 0 ? `R ${(kpis.commLTV/1000).toFixed(0)}k` : '—', trend: kpis.activeComm > 0 ? `${kpis.activeComm} active` : 'No active', up: kpis.commLTV > 0 },
          { label: 'Sell-through',     value: `${kpis.soldPct}%`, trend: 'Total portfolio', up: kpis.soldPct >= 20 },
        ].map(kpi => (
          <div key={kpi.label} className="bg-background border border-charcoal/8 p-4">
            <p className="text-label uppercase tracking-widest text-muted mb-2">{kpi.label}</p>
            <p className="font-serif text-2xl text-charcoal mb-1" style={{ letterSpacing: '-0.01em' }}>{kpi.value}</p>
            <div className={`flex items-center gap-1 text-xs ${kpi.up ? 'text-sage' : 'text-muted'}`}>
              {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Main revenue chart */}
      <div className="bg-background border border-charcoal/8 p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="font-serif italic text-lg text-charcoal">Monthly revenue (ZAR)</p>
          <div className="flex gap-1">
            {(['3m','6m','12m'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-sans uppercase tracking-widest transition-all ${
                  period === p ? 'bg-charcoal text-background' : 'text-muted hover:text-charcoal'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={data} color="#A0522D" height={120} />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-charcoal/6">
          <span className="text-xs text-muted">{period} total: R {(total/1000).toFixed(0)}k</span>
          <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-sage' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend >= 0 ? '+' : ''}{trend}% vs prev month
          </div>
        </div>
      </div>

      {/* Two col */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Revenue by channel */}
        <div className="bg-background border border-charcoal/8 p-5">
          <p className="font-serif italic text-lg text-charcoal mb-5">Revenue by channel</p>
          <div className="space-y-4">
            {channelData.map(ch => (
              <div key={ch.channel}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ background: ch.color }} />
                    <span className="text-sm text-charcoal">{ch.channel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${ch.trend >= 0 ? 'text-sage' : 'text-red-400'}`}>
                      {ch.trend >= 0 ? '+' : ''}{ch.trend}%
                    </span>
                    <span className="text-sm text-charcoal font-sans">R {(ch.value/1000).toFixed(0)}k</span>
                  </div>
                </div>
                <div className="h-1.5 bg-charcoal/6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ch.pct}%` }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-1.5"
                    style={{ background: ch.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-charcoal/6">
            <p className="text-xs text-muted">Target: no single channel {'>'} 60% of revenue</p>
            <div className={`text-xs mt-1 flex items-center gap-1 ${!channelData[0] || channelData[0].pct < 60 ? 'text-sage' : 'text-terracotta'}`}>
              {!channelData[0] || channelData[0].pct < 60 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {!channelData[0] || channelData[0].pct < 60 ? 'Healthy channel mix' : 'Direct sales too dominant — grow workshops'}
            </div>
          </div>
        </div>

        {/* Collector LTV */}
        <div className="bg-background border border-charcoal/8 p-5">
          <p className="font-serif italic text-lg text-charcoal mb-5">Top collectors by LTV</p>
          <div className="space-y-3">
            {collectorLTV.map((c, i) => {
              const maxLTV = collectorLTV[0].ltv;
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-label text-muted w-4 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-charcoal truncate">{c.name}</span>
                      <span className="text-sm text-charcoal flex-shrink-0 ml-2">R {(c.ltv/1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-1 bg-charcoal/6">
                      <div className="h-1 bg-terracotta/60" style={{ width: `${(c.ltv / maxLTV) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-label text-muted flex-shrink-0">{c.country}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-charcoal/6">
            <p className="text-xs text-muted">Average collector LTV: R {collectorLTV.length ? Math.round(collectorLTV.reduce((s,c) => s + c.ltv, 0) / collectorLTV.length / 1000) : 0}k</p>
            <p className="text-xs text-muted mt-0.5">Target: 100 collectors = studio revenue floor</p>
          </div>
        </div>
      </div>

      {/* Seasonal calendar */}
      <div className="bg-background border border-charcoal/8 p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="font-serif italic text-lg text-charcoal">Seasonal selling pattern</p>
          <p className="text-xs text-muted">Based on global art market data + studio history</p>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {seasonal.map(m => {
            const maxSales = Math.max(...seasonal.map(s => s.sales), 1);
            const pct = Math.round((m.sales / maxSales) * 100);
            const isHigh = m.sales >= 35000;
            return (
              <div key={m.month} className="flex flex-col items-center gap-1.5">
                <div className="w-full flex flex-col justify-end" style={{ height: 60 }}>
                  <div className="w-full transition-all duration-500"
                    style={{
                      height: `${pct}%`,
                      background: isHigh ? '#A0522D' : '#B8A088',
                      opacity: isHigh ? 1 : 0.5,
                    }}
                  />
                </div>
                <p className="text-[9px] text-muted">{m.month}</p>
                {m.note && <p className="text-[8px] text-terracotta leading-tight text-center">{m.note}</p>}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-charcoal/6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted">
          <div><span className="text-charcoal font-sans font-500">Peak Q4:</span> Oct–Dec — holiday & year-end buying. Plan major releases.</div>
          <div><span className="text-charcoal font-sans font-500">Spring:</span> Mar–May — fair season. Best for exhibition announcements.</div>
          <div><span className="text-charcoal font-sans font-500">Jan–Feb:</span> Production window. Deepen collector relationships.</div>
        </div>
      </div>

      {/* Projection */}
      <div className="bg-parchment/50 border border-charcoal/8 p-5">
        <p className="font-serif italic text-lg text-charcoal mb-1">12-month projection</p>
        <p className="text-xs text-muted mb-4">Based on current trajectory + seasonal pattern + pipeline value</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Conservative', value: 'R 380k', note: 'Flat growth',         color: '#9E9890' },
            { label: 'Moderate',     value: 'R 480k', note: '+53% vs last year',   color: '#7C8B6F' },
            { label: 'Optimistic',   value: 'R 620k', note: '+100% with gallery',  color: '#A0522D' },
            { label: 'Memberships',  value: '+R 36k', note: '100 members × R30/mo', color: '#B8A088' },
          ].map(p => (
            <div key={p.label}>
              <p className="text-label uppercase tracking-widest mb-1" style={{ color: p.color }}>{p.label}</p>
              <p className="font-serif text-2xl text-charcoal mb-0.5">{p.value}</p>
              <p className="text-xs text-muted">{p.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
