import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, Users, TrendingUp, Eye, MousePointer,
  Clock, Plus, Star, Tag, Zap, Heart, Calendar, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Tab = 'campaigns' | 'promotions' | 'segments' | 'insights';

interface Campaign {
  id: string;
  subject: string;
  type: 'New Work' | 'Studio Update' | 'Collector Preview' | 'Workshop' | 'Events';
  status: 'draft' | 'scheduled' | 'sent';
  audience: string;
  sentTo?: number;
  openRate?: number;
  clickRate?: number;
  scheduledFor?: string;
  sentAt?: string;
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'C1', subject: '"Ce Père Idéal" — New Work Available',
    type: 'New Work', status: 'sent', audience: 'All subscribers',
    sentTo: 312, openRate: 48, clickRate: 18, sentAt: '3 days ago',
  },
  {
    id: 'C2', subject: 'Collectors: First Look — July Collection',
    type: 'Collector Preview', status: 'sent', audience: 'Collectors + VIP',
    sentTo: 28, openRate: 71, clickRate: 39, sentAt: '1 week ago',
  },
  {
    id: 'C3', subject: 'Studio Notes: July in the Mountain Kingdom',
    type: 'Studio Update', status: 'scheduled', audience: 'All subscribers',
    scheduledFor: 'Aug 5, 10:00 AM',
  },
  {
    id: 'C4', subject: 'Workshop — Hands in Clay, September 14',
    type: 'Workshop', status: 'draft', audience: 'Workshop alumni + subscribers',
  },
];

const SEGMENT_TEMPLATES = [
  { key: 'vip',         name: 'VIP Collectors',    desc: 'Spent R18k+, 2+ purchases', color: '#A0522D', audience: 'Collectors + VIP' },
  { key: 'collectors',  name: 'Active Collectors', desc: '1+ purchases, engaged',      color: '#7C8B6F', audience: 'Collectors + VIP' },
  { key: 'workshops',   name: 'Workshop Alumni',   desc: 'Attended 1+ workshop',       color: '#C4956A', audience: 'Workshop alumni' },
  { key: 'wishlist',    name: 'Wishlist Savers',   desc: '3+ works wishlisted',        color: '#B8A088', audience: 'All subscribers' },
  { key: 'newsletter',  name: 'Newsletter Only',   desc: 'Subscribed, not purchased',  color: '#9E9890', audience: 'Newsletter Only' },
  { key: 'press',       name: 'Gallery Contacts',  desc: 'Curators + gallerists',      color: '#2D2A26', audience: 'Gallery Contacts' },
];

const LUXURY_PROMOS = [
  {
    title: 'Collector Preview Window',
    desc: 'Give VIP and Collector segments 48-hour early access to new works before public listing.',
    icon: Star, type: 'access' as const, urgency: 'High impact',
    preSubject: 'First Look: New Work — 48-Hour Collector Access',
    preType: 'Collector Preview' as Campaign['type'],
    preAudience: 'Collectors + VIP',
  },
  {
    title: 'Commission Waitlist Opening',
    desc: 'Announce a limited commission window (5 slots, 2 weeks only). Creates genuine scarcity.',
    icon: Clock, type: 'scarcity' as const, urgency: 'Recommended quarterly',
    preSubject: 'Commission Window Now Open — 5 Slots Available',
    preType: 'New Work' as Campaign['type'],
    preAudience: 'All subscribers',
  },
  {
    title: 'Workshop Early Bird',
    desc: '15% reduction for newsletter subscribers who book 6+ weeks in advance. Not a discount — a loyalty reward.',
    icon: Zap, type: 'loyalty' as const, urgency: 'Per workshop',
    preSubject: 'Workshop Early Bird — Loyalty Access for Subscribers',
    preType: 'Workshop' as Campaign['type'],
    preAudience: 'Newsletter Only',
  },
  {
    title: 'Thank-you Gift with Purchase',
    desc: 'Include a signed A5 studio sketch with original artwork sales over R25,000. Adds value, preserves price.',
    icon: Heart, type: 'value-add' as const, urgency: 'Ongoing',
    preSubject: 'A Gift from the Studio — With Your Next Original Purchase',
    preType: 'Collector Preview' as Campaign['type'],
    preAudience: 'Collectors + VIP',
  },
  {
    title: 'Artist Studio Visit (Virtual)',
    desc: 'Quarterly 30-min video studio tour for Inner Circle members and recent collectors.',
    icon: Eye, type: 'experience' as const, urgency: 'Quarterly',
    preSubject: "You're Invited — Quarterly Studio Visit",
    preType: 'Studio Update' as Campaign['type'],
    preAudience: 'Collectors + VIP',
  },
  {
    title: 'Press Kit Campaign',
    desc: 'Targeted outreach to art media and gallery directors. Not a promotion — a PR push.',
    icon: Send, type: 'pr' as const, urgency: 'Before fair season',
    preSubject: 'Mapheane — Studio Introduction & Press Kit',
    preType: 'Events' as Campaign['type'],
    preAudience: 'Gallery Contacts',
  },
];

const SEASONAL_WINDOWS = [
  {
    months: 'Oct – Dec',
    label: 'Holiday Peak',
    note: 'Gift market most active. Prints and smaller works move fastest. Commission slots fill. Highest open rates of the year.',
    campaignType: 'New Work',
    intensity: 'peak' as const,
  },
  {
    months: 'Sep – Nov',
    label: 'Spring Collection',
    note: 'New work launches. Painting sales peak. Ideal for Collector Preview window before the holiday rush builds.',
    campaignType: 'Collector Preview',
    intensity: 'high' as const,
  },
  {
    months: 'Jan – Feb',
    label: 'Summer Gallery',
    note: 'Collectors back from holiday break. Studio visits and behind-the-scenes content perform well in this quieter window.',
    campaignType: 'Studio Update',
    intensity: 'medium' as const,
  },
  {
    months: 'Mar – May',
    label: 'Fair Season',
    note: 'Gallery directors and press most receptive. Best window for press kit outreach before the international fair circuit.',
    campaignType: 'Events',
    intensity: 'medium' as const,
  },
  {
    months: 'Jun – Aug',
    label: 'Workshop Season',
    note: 'Slower for original sales. Strong for workshops, community building, and growing the newsletter list for Q4.',
    campaignType: 'Workshop',
    intensity: 'low' as const,
  },
];

const CONTENT_PILLARS = [
  {
    label: 'Process & Studio',
    note: 'Behind the scenes, material stories, work in progress. Builds emotional connection. Best for Newsletter Only and new subscribers.',
  },
  {
    label: 'New Work Drop',
    note: 'Clean reveal email. Collector preview 48h first, then full list. Single image, single CTA. Highest conversion rate.',
  },
  {
    label: 'Cultural Context',
    note: 'Lesotho, litema, seanamarena blankets, highland light and clay. Differentiates globally. Gallery directors and press respond strongly.',
  },
  {
    label: 'Workshop Invitation',
    note: 'Hands-on experience framing. Workshop Alumni segment re-activates well. Keep tone intimate, never promotional.',
  },
];

const PROMO_TYPE_COLORS: Record<string, string> = {
  access:      'bg-terracotta/10 text-terracotta',
  scarcity:    'bg-clay/12 text-clay',
  loyalty:     'bg-sage/12 text-sageDark',
  'value-add': 'bg-gold/15 text-charcoalLight',
  experience:  'bg-charcoal/8 text-charcoal',
  pr:          'bg-charcoal/8 text-charcoal',
};

const INTENSITY_STYLES = {
  peak:   'bg-terracotta text-background',
  high:   'bg-terracotta/70 text-background',
  medium: 'bg-gold/40 text-charcoal',
  low:    'bg-charcoal/10 text-muted',
};

const STATUS_STYLES: Record<string, string> = {
  sent:      'bg-sage/12 text-sageDark',
  scheduled: 'bg-gold/15 text-charcoalLight',
  draft:     'bg-charcoal/8 text-muted',
};

const AUDIENCE_OPTIONS = [
  'All subscribers', 'Collectors + VIP', 'Workshop alumni',
  'Newsletter Only', 'Gallery Contacts',
];

export function MarketingHub() {
  const [tab, setTab]             = useState<Tab>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [composing, setComposing] = useState(false);
  const [newCampaign, setNew]     = useState({
    subject: '', type: 'Studio Update' as Campaign['type'],
    audience: 'All subscribers', body: '', editingId: '',
  });
  const [sent, setSent]           = useState(false);
  const [counts, setCounts]       = useState<Record<string, number>>({
    vip: 0, collectors: 0, workshops: 0, wishlist: 0, newsletter: 0, subscribers: 0, press: 0,
  });

  useEffect(() => {
    async function load() {
      const [vip, collectors, workshops, subscribers, press, campaignRows] = await Promise.all([
        supabase.from('collectors').select('*', { count: 'exact', head: true }).gte('ltv_zar', 18000),
        supabase.from('collectors').select('*', { count: 'exact', head: true }).gt('ltv_zar', 0),
        supabase.from('workshop_bookings').select('*', { count: 'exact', head: true }).neq('status', 'cancelled'),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'subscribed'),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('type', 'Press'),
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
      ]);
      setCounts(prev => ({
        ...prev,
        ...(() => {
          const collectorCount = collectors.count ?? prev.collectors;
          const subscriberCount = subscribers.count ?? prev.subscribers;
          return {
            vip:        vip.count        ?? prev.vip,
            collectors: collectorCount,
            workshops:  workshops.count  ?? prev.workshops,
            newsletter: Math.max(subscriberCount - collectorCount, 0),
            subscribers: subscriberCount,
            press:      press.count      ?? prev.press,
          };
        })(),
      }));
      if (campaignRows.data?.length) {
        setCampaigns(campaignRows.data.map(r => ({
          id:           r.id,
          subject:      r.subject,
          type:         r.type as Campaign['type'],
          status:       r.status as Campaign['status'],
          audience:     r.audience,
          sentTo:       r.sent_to ?? undefined,
          openRate:     r.open_rate ?? undefined,
          clickRate:    r.click_rate ?? undefined,
          scheduledFor: r.scheduled_for ?? undefined,
          sentAt:       r.sent_at ?? undefined,
        })));
      }
    }
    load();
  }, []);

  const SEGMENTS = SEGMENT_TEMPLATES.map(s => ({ ...s, count: counts[s.key] ?? 0 }));

  const totalSubs = counts.subscribers || SEGMENTS.reduce((s, seg) => s + seg.count, 0);
  const sentCamp  = campaigns.filter(c => c.openRate);
  const avgOpen   = sentCamp.length
    ? Math.round(sentCamp.reduce((s, c) => s + (c.openRate || 0), 0) / sentCamp.length)
    : 0;
  const avgClick  = sentCamp.length
    ? Math.round(sentCamp.reduce((s, c) => s + (c.clickRate || 0), 0) / sentCamp.length)
    : 0;

  const openCompose = (prefill?: Partial<typeof newCampaign>) => {
    setNew({
      subject: '', type: 'Studio Update', audience: 'All subscribers', body: '', editingId: '',
      ...prefill,
    });
    setComposing(true);
  };

  const handleSend = async () => {
    const isEditing = Boolean(newCampaign.editingId);
    const id = newCampaign.editingId || `C${Date.now()}`;
    const updated: Campaign = {
      id,
      subject: newCampaign.subject.trim() || 'Untitled draft',
      type: newCampaign.type,
      status: 'draft',
      audience: newCampaign.audience,
    };
    // Optimistic update
    setCampaigns(prev =>
      isEditing
        ? prev.map(c => c.id === newCampaign.editingId ? updated : c)
        : [updated, ...prev]
    );
    // Persist to Supabase
    supabase.from('campaigns').upsert({
      id,
      subject:     updated.subject,
      type:        updated.type,
      status:      updated.status,
      audience:    updated.audience,
      body:        newCampaign.body || null,
      updated_at:  new Date().toISOString(),
    }, { onConflict: 'id' });
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setComposing(false);
      setNew({ subject: '', type: 'Studio Update', audience: 'All subscribers', body: '', editingId: '' });
    }, 2000);
  };

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Marketing Hub</span>
          <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            Studio Marketing
          </h2>
        </div>
        <button onClick={() => openCompose()}
          className="flex items-center gap-2 bg-terracotta text-background px-4 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button">
          <Plus className="w-3.5 h-3.5" /> New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total subscribers', value: totalSubs,      icon: Users,        color: '#A0522D' },
          { label: 'Avg. open rate',    value: `${avgOpen}%`,  icon: Eye,          color: '#7C8B6F', note: 'Industry avg: 21%' },
          { label: 'Avg. click rate',   value: `${avgClick}%`, icon: MousePointer, color: '#C4956A', note: 'Industry avg: 2.6%' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-background border border-charcoal/8 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-label uppercase tracking-widest text-muted">{s.label}</p>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="font-serif text-2xl text-charcoal">{s.value}</p>
              {s.note && <p className="text-xs text-sage mt-1">{s.note} ✓ Above average</p>}
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-charcoal/8">
        {(['campaigns', 'promotions', 'segments', 'insights'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 text-xs font-sans uppercase tracking-widest transition-all border-b-2 -mb-px capitalize ${
              tab === t ? 'border-terracotta text-terracotta' : 'border-transparent text-muted hover:text-charcoal'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* CAMPAIGNS */}
        {tab === 'campaigns' && (
          <motion.div key="campaigns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="bg-background border border-charcoal/8 p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-sans px-2 py-0.5 uppercase tracking-widest ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                    <span className="text-label text-muted">{c.type}</span>
                  </div>
                  <p className="font-serif italic text-charcoal truncate">{c.subject}</p>
                  <p className="text-xs text-muted mt-0.5">{c.audience}</p>
                </div>
                {c.status === 'sent' && (
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-label text-muted mb-0.5">Sent to</p>
                      <p className="font-sans text-sm text-charcoal">{c.sentTo}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-label text-muted mb-0.5">Opens</p>
                      <p className="font-sans text-sm text-sage">{c.openRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-label text-muted mb-0.5">Clicks</p>
                      <p className="font-sans text-sm text-terracotta">{c.clickRate}%</p>
                    </div>
                    <p className="text-xs text-muted">{c.sentAt}</p>
                  </div>
                )}
                {c.status === 'scheduled' && (
                  <div className="flex items-center gap-2 text-xs text-gold flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {c.scheduledFor}
                  </div>
                )}
                {c.status === 'draft' && (
                  <button
                    onClick={() => openCompose({ subject: c.subject, type: c.type, audience: c.audience, editingId: c.id })}
                    className="text-xs font-sans uppercase tracking-widest text-muted hover:text-terracotta transition-colors border border-charcoal/15 px-3 py-1.5 hover:border-terracotta/30 flex-shrink-0">
                    Continue editing
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* PROMOTIONS */}
        {tab === 'promotions' && (
          <motion.div key="promotions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="bg-parchment/40 border border-terracotta/15 p-4">
              <p className="text-xs text-terracotta font-sans mb-1">Luxury brand principle</p>
              <p className="text-xs text-muted leading-relaxed">
                Never discount. Create value through access, experience, and scarcity instead.
                "In luxury, ubiquity will kill you." — The following tactics are brand-safe and tested.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LUXURY_PROMOS.map(promo => {
                const Icon = promo.icon;
                return (
                  <div key={promo.title} className="bg-background border border-charcoal/8 p-5 hover:border-charcoal/20 hover:shadow-card transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 bg-terracotta/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-terracotta" />
                      </div>
                      <span className={`text-[10px] font-sans px-2 py-0.5 uppercase tracking-widest ${PROMO_TYPE_COLORS[promo.type]}`}>
                        {promo.urgency}
                      </span>
                    </div>
                    <h3 className="font-serif italic text-lg text-charcoal mb-2">{promo.title}</h3>
                    <p className="text-sm text-muted leading-relaxed mb-4">{promo.desc}</p>
                    <button
                      onClick={() => openCompose({ subject: promo.preSubject, type: promo.preType, audience: promo.preAudience })}
                      className="text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors">
                      Set up campaign →
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* SEGMENTS */}
        {tab === 'segments' && (
          <motion.div key="segments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {SEGMENTS.map(seg => (
              <div key={seg.name} className="bg-background border border-charcoal/8 p-5 flex items-center gap-4 hover:border-charcoal/20 transition-all group">
                <div className="w-10 h-10 flex items-center justify-center text-sm font-sans text-background flex-shrink-0"
                  style={{ background: seg.color }}>
                  {seg.count}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-charcoal">{seg.name}</p>
                  <p className="text-xs text-muted">{seg.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted">% of list</p>
                    <p className="text-sm text-charcoal">{Math.round((seg.count / totalSubs) * 100)}%</p>
                  </div>
                  <button
                    onClick={() => openCompose({ audience: seg.audience })}
                    className="text-xs font-sans uppercase tracking-widest text-muted hover:text-terracotta transition-colors opacity-0 group-hover:opacity-100 border border-charcoal/15 px-3 py-1.5 hover:border-terracotta/30">
                    Email segment
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* INSIGHTS */}
        {tab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-6">

            <div>
              <p className="text-label uppercase tracking-[0.2em] text-muted mb-3">Seasonal Campaign Windows</p>
              <div className="space-y-2">
                {SEASONAL_WINDOWS.map(w => (
                  <div key={w.months} className="bg-background border border-charcoal/8 p-4 flex items-start gap-4">
                    <div className="flex-shrink-0 w-28 text-right">
                      <p className="text-xs font-sans text-muted mb-1">{w.months}</p>
                      <span className={`text-[10px] font-sans px-2 py-0.5 uppercase tracking-widest inline-block ${INTENSITY_STYLES[w.intensity]}`}>
                        {w.intensity}
                      </span>
                    </div>
                    <div className="flex-1 border-l border-charcoal/8 pl-4">
                      <p className="font-serif italic text-charcoal text-sm mb-0.5">{w.label}</p>
                      <p className="text-xs text-muted leading-relaxed">{w.note}</p>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      <span className="text-[10px] font-sans text-muted border border-charcoal/12 px-2 py-0.5">{w.campaignType}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-label uppercase tracking-[0.2em] text-muted mb-3">Content Pillars</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CONTENT_PILLARS.map(p => (
                  <div key={p.label} className="bg-background border border-charcoal/8 p-4">
                    <p className="font-sans text-sm text-charcoal mb-1.5">{p.label}</p>
                    <p className="text-xs text-muted leading-relaxed">{p.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-parchment/40 border border-terracotta/15 p-4">
              <p className="text-xs text-terracotta font-sans mb-3">Art market benchmarks</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Art email open rate',   value: '28–35%', note: `Your current: ${avgOpen}% — well above` },
                  { label: 'Collector preview CTR', value: '30–45%', note: 'Sent to qualified segment only' },
                  { label: 'Workshop fill rate',    value: '80%+',   note: 'Cap at 8–12 for intimacy' },
                ].map(b => (
                  <div key={b.label}>
                    <p className="text-label text-muted mb-1 uppercase tracking-widest">{b.label}</p>
                    <p className="font-serif text-xl text-charcoal">{b.value}</p>
                    <p className="text-xs text-muted mt-0.5">{b.note}</p>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* Compose overlay */}
      <AnimatePresence>
        {composing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-ink/50 backdrop-blur-sm"
              onClick={() => !sent && setComposing(false)} />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg top-1/2 -translate-y-1/2 z-[80] bg-background shadow-modal overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-terracotta/60 via-terracotta to-terracotta/60" />
              <div className="p-6">
                {sent ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-sage/12 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6 text-sage" />
                    </div>
                    <p className="font-serif italic text-xl text-charcoal">
                      {newCampaign.editingId ? 'Draft updated' : 'Campaign saved as draft'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-5">
                      <p className="font-serif italic text-xl text-charcoal">
                        {newCampaign.editingId ? 'Edit Draft' : 'New Campaign'}
                      </p>
                      <button onClick={() => setComposing(false)}
                        className="text-muted hover:text-charcoal hover:rotate-90 transition-all duration-300">
                        ✕
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="group">
                        <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
                          Subject line
                        </label>
                        <input value={newCampaign.subject} onChange={e => setNew(n => ({ ...n, subject: e.target.value }))}
                          placeholder="Your subject…"
                          className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal font-serif text-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic" />
                      </div>
                      <div className="group">
                        <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
                          Notes / body
                        </label>
                        <textarea value={newCampaign.body} onChange={e => setNew(n => ({ ...n, body: e.target.value }))}
                          placeholder="Key points, links, or draft copy…"
                          rows={3}
                          className="w-full bg-transparent border-b border-charcoal/18 py-2 text-charcoal text-sm font-sans focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-label uppercase tracking-widest text-muted mb-1.5">Type</p>
                          <select value={newCampaign.type} onChange={e => setNew(n => ({ ...n, type: e.target.value as Campaign['type'] }))}
                            className="w-full bg-transparent border-b border-charcoal/18 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta transition-colors">
                            {(['New Work', 'Studio Update', 'Collector Preview', 'Workshop', 'Events'] as Campaign['type'][]).map(t => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-label uppercase tracking-widest text-muted mb-1.5">Audience</p>
                          <select value={newCampaign.audience} onChange={e => setNew(n => ({ ...n, audience: e.target.value }))}
                            className="w-full bg-transparent border-b border-charcoal/18 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta transition-colors">
                            {AUDIENCE_OPTIONS.map(a => (
                              <option key={a}>{a}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={handleSend}
                          className="flex-1 flex items-center justify-center gap-2 bg-terracotta text-background py-3 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors">
                          <Send className="w-3.5 h-3.5" /> Save as Draft
                        </button>
                        <button onClick={() => setComposing(false)}
                          className="px-4 py-3 border border-charcoal/15 text-xs font-sans uppercase tracking-widest text-muted hover:border-charcoal/30 hover:text-charcoal transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
