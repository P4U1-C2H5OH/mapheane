import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, CheckCircle, Circle, AlertCircle, ChevronDown, ChevronUp,
  ExternalLink, FileText, TrendingUp, Star, Download, Mail, ArrowRight
} from 'lucide-react';

interface CheckItem {
  id: string;
  label: string;
  done: boolean;
  note?: string;
  action?: string;
}

interface Category {
  id: string;
  label: string;
  weight: number;
  items: CheckItem[];
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'body',
    label: 'Body of Work',
    weight: 25,
    color: '#A0522D',
    items: [
      { id: 'b1', label: 'Minimum 12 cohesive works documented', done: true },
      { id: 'b2', label: 'Works span at least 2 years of practice', done: true },
      { id: 'b3', label: 'Clear artistic voice across all mediums', done: true },
      { id: 'b4', label: 'Large-format works available (min. 100cm+)', done: false, note: 'Only 2 large formats currently. Aim for 4+.', action: 'Add to production plan' },
      { id: 'b5', label: 'Sculpture series of 5+ documented pieces', done: false, note: 'Currently 3 clay pieces. Expand series.', action: 'Add works' },
    ],
  },
  {
    id: 'documentation',
    label: 'Documentation',
    weight: 20,
    color: '#7C8B6F',
    items: [
      { id: 'd1', label: 'Professional photography — all works', done: false, note: 'Currently using placeholder images. Priority.', action: 'Book photographer' },
      { id: 'd2', label: 'High-res images (min. 2400px, 300dpi)', done: false, action: 'Update after photography' },
      { id: 'd3', label: 'Accurate dimensions and materials catalogued', done: true },
      { id: 'd4', label: 'Certificates of Authenticity template ready', done: true },
      { id: 'd5', label: 'Provenance records for all sold works', done: false, note: 'Partially done. Complete for 3 missing works.' },
    ],
  },
  {
    id: 'market',
    label: 'Market Traction',
    weight: 25,
    color: '#C4956A',
    items: [
      { id: 'm1', label: 'Sell-through rate above 80%', done: false, note: 'Currently 11% — early stage, low inventory. Grow carefully.' },
      { id: 'm2', label: 'Price appreciation documented over 2+ years', done: false, note: 'First price increase recommended: +20% in Q4.' },
      { id: 'm3', label: 'Collector base of 10+ individuals', done: true },
      { id: 'm4', label: 'Collectors in 2+ countries', done: true },
      { id: 'm5', label: 'At least one auction house result or institutional note', done: false, action: 'Submit to Strauss & Co emerging artists' },
    ],
  },
  {
    id: 'exhibition',
    label: 'Exhibition Record',
    weight: 15,
    color: '#B8A088',
    items: [
      { id: 'e1', label: '2+ solo exhibitions', done: false, note: 'Currently 0. Plan first solo for Q1 next year.', action: 'Approach Maseru Arts Centre' },
      { id: 'e2', label: '5+ group exhibitions', done: true },
      { id: 'e3', label: 'Art fair participation', done: false, action: 'Apply to FNB Art Joburg Emerging Artists section' },
      { id: 'e4', label: 'Exhibition in target gallery\'s city (Cape Town/Johannesburg)', done: false },
    ],
  },
  {
    id: 'press',
    label: 'Press & Recognition',
    weight: 10,
    color: '#9E9890',
    items: [
      { id: 'p1', label: '3+ press mentions or features', done: false, note: 'Currently 1 — Contemporary And magazine mention.', action: 'Pitch to ArtThrob and Art Africa' },
      { id: 'p2', label: 'Artist statement (professional quality)', done: true },
      { id: 'p3', label: 'CV in CAA standard format', done: false, action: 'Generate from this platform' },
      { id: 'p4', label: 'Institutional collection acquisition', done: false, action: 'Approach Morija Museum, Norval Foundation' },
    ],
  },
  {
    id: 'digital',
    label: 'Digital Presence',
    weight: 5,
    color: '#2D2A26',
    items: [
      { id: 'dig1', label: 'Professional website live', done: true },
      { id: 'dig2', label: 'Instagram: 1,000+ followers, consistent posting', done: false, note: 'Grow to 2k+ — galleries check this.' },
      { id: 'dig3', label: 'Listing on Artsy, Singulart, or Latitudes', done: false, action: 'Apply to Singulart (fastest approval)' },
      { id: 'dig4', label: 'Press kit downloadable PDF ready', done: false, action: 'Generate press kit' },
    ],
  },
];

const TARGET_GALLERIES = [
  {
    name: 'Stevenson Gallery',
    city: 'Cape Town / Amsterdam',
    fit: 98,
    note: 'Lerato Bereng (Director) born in Maseru. Direct cultural connection. Priority target.',
    color: '#A0522D',
    approach: 'Personal introduction via Morija Museum or Lerato Bereng outreach.',
    url: 'https://www.stevenson.info',
  },
  {
    name: 'SMAC Gallery',
    city: 'Stellenbosch / Cape Town',
    fit: 82,
    note: 'Represents African continental artists. Featured Ditema artist — Basotho cultural fit.',
    color: '#7C8B6F',
    approach: 'Submission package + relationship at FNB Art Joburg.',
    url: 'https://www.smacgallery.com',
  },
  {
    name: 'Goodman Gallery',
    city: 'JHB / Cape Town / London',
    fit: 65,
    note: 'Prestige target. Requires strong institutional footing first. 2–3 year runway.',
    color: '#B8A088',
    approach: 'Build collector introductions via existing Joburg network.',
    url: 'https://www.goodman-gallery.com',
  },
  {
    name: 'Nicodim Gallery',
    city: 'Los Angeles / Bucharest',
    fit: 71,
    note: 'Explicit focus on overlooked African artists. Good international market entry.',
    color: '#C4956A',
    approach: 'Online submission + 1-54 NY presence.',
    url: 'https://nicodimgallery.com',
  },
];

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#7C8B6F' : score >= 60 ? '#C4956A' : '#A0522D';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(45,42,38,0.08)" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x={size / 2} y={size / 2 + 2} textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: 'Playfair Display, serif', fontSize: size * 0.22, fill: color }}>
        {score}%
      </text>
    </svg>
  );
}

const galleryEmailTemplate = (g: typeof TARGET_GALLERIES[number]) =>
`Subject: Studio Introduction — Mapheane

Dear ${g.name} team,

I am Mapheane, a contemporary fine artist based in Maseru, Kingdom of Lesotho. My practice spans mixed media painting on resin canvas, charcoal and graphite drawing, and glazed stoneware sculpture — all rooted in Basotho visual language: litema wall painting and seanamarena blanket geometry rendered through contemporary materials.

I am writing to introduce my work and explore whether there is a basis for representation. ${g.approach}

My current portfolio, CV, and press kit are available at mapheane.art.

With regards,
Mapheane
hello@mapheane.art
+266 22 000 000`;

export function GalleryReadiness() {
  const [expanded, setExpanded]       = useState<string | null>('body');
  const [checkState, setCheckState]   = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.flatMap(c => c.items.map(i => [i.id, i.done])))
  );
  const [activeGallery, setActiveGallery] = useState<string | null>(null);
  const [exporting, setExporting]         = useState<'cv' | 'presskit' | null>(null);
  const [emailGallery, setEmailGallery]   = useState<string | null>(null);
  const [copied, setCopied]               = useState(false);

  // Load persisted checklist from Supabase on mount
  useEffect(() => {
    supabase.from('studio_settings')
      .select('value')
      .eq('key', 'gallery_readiness_checks')
      .single()
      .then(({ data }) => {
        if (data?.value && typeof data.value === 'object') {
          setCheckState(prev => ({ ...prev, ...(data.value as Record<string, boolean>) }));
        }
      });
  }, []);

  const toggle = (id: string) => {
    setCheckState(s => {
      const next = { ...s, [id]: !s[id] };
      supabase.from('studio_settings').upsert(
        { key: 'gallery_readiness_checks', value: next, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
      return next;
    });
  };

  const handleExport = (type: 'cv' | 'presskit') => {
    setExporting(type);
    setTimeout(() => setExporting(null), 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Compute score
  const score = Math.round(
    CATEGORIES.reduce((total, cat) => {
      const done = cat.items.filter(i => checkState[i.id]).length;
      const catScore = (done / cat.items.length) * cat.weight;
      return total + catScore;
    }, 0)
  );

  const totalDone  = Object.values(checkState).filter(Boolean).length;
  const totalItems = CATEGORIES.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Header */}
      <div>
        <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Gallery Readiness</span>
        <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
          Representation Readiness Score
        </h2>
      </div>

      {/* Score + overview */}
      <div className="bg-background border border-charcoal/8 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0">
            <ScoreRing score={score} size={100} />
          </div>
          <div className="flex-1">
            <p className="font-serif text-2xl italic text-charcoal mb-2">
              {score >= 80 ? 'Ready for gallery approach' : score >= 60 ? 'Good progress — keep building' : 'Foundation stage — focus on essentials'}
            </p>
            <p className="text-sm text-muted mb-3 leading-relaxed">
              {score >= 80
                ? 'Your documentation, market traction, and exhibition record meet the threshold for approaching Tier 1 galleries. Prioritise Stevenson Gallery.'
                : score >= 60
                ? 'Strong foundation in place. Focus on professional photography, first solo exhibition, and press coverage to unlock the top tier.'
                : 'Build the body of work, complete documentation, and pursue group exhibitions. A score of 70+ is the recommended threshold before outreach.'}
            </p>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted">{totalDone}/{totalItems} criteria met</div>
              <div className="flex-1 h-1.5 bg-charcoal/6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalDone / totalItems) * 100}%` }}
                  transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="h-1.5"
                  style={{ background: score >= 70 ? '#7C8B6F' : '#A0522D' }}
                />
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-2">
            <button onClick={() => handleExport('cv')}
              className="flex items-center gap-2 bg-terracotta text-background px-4 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button min-w-[140px] justify-center">
              {exporting === 'cv'
                ? <><CheckCircle className="w-3.5 h-3.5" /> Exported</>
                : <><Download className="w-3.5 h-3.5" /> Export CV</>}
            </button>
            <button onClick={() => handleExport('presskit')}
              className="flex items-center gap-2 border border-charcoal/15 text-muted px-4 py-2.5 text-xs font-sans uppercase tracking-widest hover:border-charcoal/30 hover:text-charcoal transition-all min-w-[140px] justify-center">
              {exporting === 'presskit'
                ? <><CheckCircle className="w-3.5 h-3.5 text-sage" /> Exported</>
                : <><FileText className="w-3.5 h-3.5" /> Press Kit PDF</>}
            </button>
          </div>
        </div>
      </div>

      {/* Category scores */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CATEGORIES.map(cat => {
          const done  = cat.items.filter(i => checkState[i.id]).length;
          const pct   = Math.round((done / cat.items.length) * 100);
          return (
            <button key={cat.id} onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              className="bg-background border border-charcoal/8 p-4 text-left hover:border-charcoal/20 hover:shadow-card transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-sans uppercase tracking-widest text-muted group-hover:text-charcoal transition-colors">{cat.label}</p>
                <span className="text-xs text-muted">{cat.weight}%</span>
              </div>
              <p className="font-serif text-2xl mb-2" style={{ color: cat.color }}>{pct}%</p>
              <div className="h-1 bg-charcoal/8">
                <div className="h-1 transition-all duration-700" style={{ width: `${pct}%`, background: cat.color }} />
              </div>
              <p className="text-xs text-muted mt-1.5">{done}/{cat.items.length} complete</p>
            </button>
          );
        })}
      </div>

      {/* Checklist detail */}
      <div className="space-y-2">
        {CATEGORIES.map(cat => {
          const isOpen = expanded === cat.id;
          const done   = cat.items.filter(i => checkState[i.id]).length;
          return (
            <div key={cat.id} className="bg-background border border-charcoal/8 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : cat.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-charcoal/2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2" style={{ background: cat.color }} />
                  <span className="font-serif italic text-charcoal">{cat.label}</span>
                  <span className="text-xs text-muted">{done}/{cat.items.length}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-3 border-t border-charcoal/6 pt-4">
                      {cat.items.map(item => {
                        const checked = checkState[item.id];
                        return (
                          <div key={item.id} className="flex items-start gap-3">
                            <button
                              onClick={() => toggle(item.id)}
                              className="flex-shrink-0 mt-0.5"
                              aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {checked
                                ? <CheckCircle className="w-4 h-4 text-sage" />
                                : <Circle className="w-4 h-4 text-charcoal/20 hover:text-charcoal/40 transition-colors" />
                              }
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-relaxed ${checked ? 'line-through text-muted' : 'text-charcoal'}`}>
                                {item.label}
                              </p>
                              {!checked && item.note && (
                                <p className="text-xs text-terracotta/80 italic mt-0.5 flex items-start gap-1">
                                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  {item.note}
                                </p>
                              )}
                              {!checked && item.action && (
                                <button className="text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors mt-1">
                                  {item.action} →
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Target galleries */}
      <div>
        <p className="font-serif italic text-xl text-charcoal mb-3">Target Galleries</p>
        <div className="space-y-3">
          {TARGET_GALLERIES.map(g => (
            <motion.div key={g.name}
              className="bg-background border border-charcoal/8 p-5 hover:border-charcoal/20 hover:shadow-card transition-all duration-300 cursor-pointer"
              onClick={() => setActiveGallery(activeGallery === g.name ? null : g.name)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Fit ring */}
                  <div className="flex-shrink-0">
                    <ScoreRing score={g.fit} size={52} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif italic text-lg text-charcoal truncate">{g.name}</p>
                    <p className="text-xs text-muted">{g.city}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-label text-muted mb-0.5">Fit score</p>
                  <p className="font-sans font-500 text-sm" style={{ color: g.color }}>{g.fit}%</p>
                </div>
              </div>

              <AnimatePresence>
                {activeGallery === g.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-charcoal/6 space-y-3">
                      <p className="text-sm text-charcoal/75 leading-relaxed">{g.note}</p>
                      <div className="bg-parchment/50 p-3 border border-charcoal/6">
                        <p className="text-label text-muted mb-1">Recommended approach</p>
                        <p className="text-sm text-charcoal/70">{g.approach}</p>
                      </div>
                      <div className="flex gap-3">
                        <a href={g.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-muted hover:text-terracotta transition-colors">
                          <ExternalLink className="w-3 h-3" /> Visit Gallery
                        </a>
                        <button
                          onClick={e => { e.stopPropagation(); setEmailGallery(emailGallery === g.name ? null : g.name); setCopied(false); }}
                          className={`flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest transition-colors ${emailGallery === g.name ? 'text-terracotta' : 'text-muted hover:text-terracotta'}`}>
                          <Mail className="w-3 h-3" /> {emailGallery === g.name ? 'Close Draft' : 'Draft Intro Email'}
                        </button>
                      </div>
                      <AnimatePresence>
                        {emailGallery === g.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="mt-3 bg-parchment/60 border border-terracotta/15 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-label uppercase tracking-widest text-muted">Email draft</p>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleCopy(galleryEmailTemplate(g))}
                                    className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-muted hover:text-charcoal transition-colors">
                                    {copied ? <><CheckCircle className="w-3 h-3 text-sage" /> Copied</> : <><FileText className="w-3 h-3" /> Copy</>}
                                  </button>
                                  <a
                                    href={`https://mail.google.com/mail/?view=cm&su=${encodeURIComponent('Studio Introduction — Mapheane')}&body=${encodeURIComponent(galleryEmailTemplate(g))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors">
                                    <Mail className="w-3 h-3" /> Open in Gmail
                                  </a>
                                </div>
                              </div>
                              <pre className="text-xs text-charcoal/80 leading-relaxed whitespace-pre-wrap font-sans">
                                {galleryEmailTemplate(g)}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next actions */}
      <div className="bg-parchment/50 border border-terracotta/15 p-5">
        <p className="font-serif italic text-lg text-charcoal mb-3">Top 3 actions to raise your score</p>
        <div className="space-y-3">
          {[
            { label: 'Book professional photography session for all 9 works', impact: '+8 points', urgent: true },
            { label: 'Apply to FNB Art Joburg Emerging Artists section (deadline Oct 1)', impact: '+6 points', urgent: true },
            { label: 'Publish 3 more studio moments to build press-ready narrative', impact: '+4 points', urgent: false },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-sans font-500"
                style={{ background: a.urgent ? '#A0522D' : '#B8A088', color: '#FAF7F2' }}>
                {i + 1}
              </div>
              <p className="text-sm text-charcoal flex-1">{a.label}</p>
              <span className="text-xs text-sage font-sans">{a.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
