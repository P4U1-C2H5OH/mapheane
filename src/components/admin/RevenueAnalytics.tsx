import React, { useState } from 'react';
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

const MONTHLY_DATA: Record<Period, { label: string; value: number }[]> = {
  '3m': [
    { label: 'May',  value: 28000 },
    { label: 'Jun',  value: 34000 },
    { label: 'Jul',  value: 41000 },
  ],
  '6m': [
    { label: 'Feb', value: 18000 },
    { label: 'Mar', value: 22000 },
    { label: 'Apr', value: 19000 },
    { label: 'May', value: 28000 },
    { label: 'Jun', value: 34000 },
    { label: 'Jul', value: 41000 },
  ],
  '12m': [
    { label: 'Aug', value: 12000 },
    { label: 'Sep', value: 15000 },
    { label: 'Oct', value: 31000 },
    { label: 'Nov', value: 44000 },
    { label: 'Dec', value: 38000 },
    { label: 'Jan', value: 11000 },
    { label: 'Feb', value: 18000 },
    { label: 'Mar', value: 22000 },
    { label: 'Apr', value: 19000 },
    { label: 'May', value: 28000 },
    { label: 'Jun', value: 34000 },
    { label: 'Jul', value: 41000 },
  ],
};

const CHANNEL_DATA = [
  { channel: 'Original Sales',  value: 68400, pct: 52, color: '#A0522D', trend: +18 },
  { channel: 'Commissions',     value: 42000, pct: 32, color: '#7C8B6F', trend: +41 },
  { channel: 'Workshop Fees',   value: 12600, pct: 10, color: '#C4956A', trend: +8  },
  { channel: 'Print Editions',  value:  8100, pct:  6, color: '#B8A088', trend: +22 },
];

const COLLECTOR_LTV = [
  { name: 'Sarah Mitchell',   ltv: 85000, purchases: 4, country: 'UK'  },
  { name: 'Tsepiso Mokhehle', ltv: 55000, purchases: 3, country: 'LS'  },
  { name: 'Nomvula Khumalo',  ltv: 30000, purchases: 2, country: 'ZA'  },
  { name: 'Ayanda Nkosi',     ltv: 25000, purchases: 1, country: 'ZA'  },
];

const SEASONAL = [
  { month: 'Jan',  sales: 11000, note: 'Low' },
  { month: 'Feb',  sales: 18000, note: '' },
  { month: 'Mar',  sales: 22000, note: 'Spring peak' },
  { month: 'Apr',  sales: 19000, note: '' },
  { month: 'May',  sales: 28000, note: 'Summer' },
  { month: 'Jun',  sales: 34000, note: '' },
  { month: 'Jul',  sales: 41000, note: '' },
  { month: 'Aug',  sales: 29000, note: '' },
  { month: 'Sep',  sales: 24000, note: '' },
  { month: 'Oct',  sales: 31000, note: 'Q4 season' },
  { month: 'Nov',  sales: 44000, note: 'Peak!' },
  { month: 'Dec',  sales: 38000, note: 'Holiday' },
];

export function RevenueAnalytics() {
  const [period, setPeriod] = useState<Period>('6m');
  const data   = MONTHLY_DATA[period];
  const total  = data.reduce((s, d) => s + d.value, 0);
  const latest = data[data.length - 1].value;
  const prev   = data[data.length - 2]?.value ?? latest;
  const trend  = Math.round(((latest - prev) / prev) * 100);
  const TOTAL_12M = 313100;
  const TOTAL_PREV = 265000;
  const yoy = Math.round(((TOTAL_12M - TOTAL_PREV) / TOTAL_PREV) * 100);

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
          { label: '12-month revenue', value: `R ${(TOTAL_12M/1000).toFixed(0)}k`, trend: `+${yoy}% YoY`, up: true },
          { label: 'Avg monthly',      value: `R ${(TOTAL_12M/12/1000).toFixed(0)}k`, trend: 'This year', up: true },
          { label: 'Commission LTV',   value: 'R 195k', trend: '4 active collectors', up: true },
          { label: 'Sell-through',     value: '11%',    trend: 'Total portfolio', up: false },
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
            {CHANNEL_DATA.map(ch => (
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
            <div className={`text-xs mt-1 flex items-center gap-1 ${CHANNEL_DATA[0].pct < 60 ? 'text-sage' : 'text-terracotta'}`}>
              {CHANNEL_DATA[0].pct < 60 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {CHANNEL_DATA[0].pct < 60 ? 'Healthy channel mix' : 'Direct sales too dominant — grow workshops'}
            </div>
          </div>
        </div>

        {/* Collector LTV */}
        <div className="bg-background border border-charcoal/8 p-5">
          <p className="font-serif italic text-lg text-charcoal mb-5">Top collectors by LTV</p>
          <div className="space-y-3">
            {COLLECTOR_LTV.map((c, i) => {
              const maxLTV = COLLECTOR_LTV[0].ltv;
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
            <p className="text-xs text-muted">Average collector LTV: R {Math.round(COLLECTOR_LTV.reduce((s,c) => s + c.ltv, 0) / COLLECTOR_LTV.length / 1000)}k</p>
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
          {SEASONAL.map(m => {
            const maxSales = Math.max(...SEASONAL.map(s => s.sales));
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
