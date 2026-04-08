import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Clock, Mail, CheckCircle, AlertCircle, X, Image,
  ArrowRight, Check, User,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Stage = 'inquiry' | 'quote' | 'contract' | 'deposit' | 'creation' | 'approval' | 'payment' | 'delivery' | 'followup';

interface Commission {
  id: string; // UUID
  client: string;
  email: string;
  medium: 'Painting' | 'Drawing' | 'Sculpture';
  description: string;
  value: number;
  depositPaid: boolean;
  stage: Stage;
  dueDate?: string;
  progress?: number;
  priority: 'high' | 'normal' | 'low';
  notes?: string;
}

function mapRow(row: Record<string, unknown>): Commission {
  return {
    id:           row.id as string,
    client:       (row.client      as string)  ?? '—',
    email:        (row.email       as string)  ?? '',
    medium:       ((row.medium ?? 'Painting')  as Commission['medium']),
    description:  (row.description as string)  ?? '',
    value:        (row.value_zar   as number)  ?? 0,
    depositPaid:  !!(row.deposit_paid as boolean | undefined),
    stage:        ((row.stage ?? 'inquiry')    as Stage),
    dueDate:      (row.due_date    as string | undefined) ?? undefined,
    progress:     (row.progress    as number | undefined) ?? undefined,
    priority:     ((row.priority ?? 'normal')  as Commission['priority']),
    notes:        (row.notes       as string | undefined) ?? undefined,
  };
}

const STAGES: { id: Stage; label: string; color: string; bg: string }[] = [
  { id: 'inquiry',  label: 'Inquiry',       color: '#9E9890', bg: 'rgba(158,152,144,0.1)'  },
  { id: 'quote',    label: 'Quoted',        color: '#B8A088', bg: 'rgba(184,160,136,0.1)'  },
  { id: 'contract', label: 'Contracted',    color: '#C4956A', bg: 'rgba(196,149,106,0.1)'  },
  { id: 'deposit',  label: 'Deposit Paid',  color: '#7C8B6F', bg: 'rgba(124,139,111,0.1)'  },
  { id: 'creation', label: 'In Creation',   color: '#A0522D', bg: 'rgba(160,82,45,0.1)'    },
  { id: 'approval', label: 'Awaiting OK',   color: '#B8A088', bg: 'rgba(184,160,136,0.1)'  },
  { id: 'payment',  label: 'Final Payment', color: '#7C8B6F', bg: 'rgba(124,139,111,0.12)' },
  { id: 'delivery', label: 'Delivery',      color: '#A0522D', bg: 'rgba(160,82,45,0.08)'   },
  { id: 'followup', label: 'Follow-up',     color: '#2D2A26', bg: 'rgba(45,42,38,0.06)'    },
];

const MEDIUM_COLORS: Record<string, string> = {
  Painting:  '#A0522D',
  Drawing:   '#7C8B6F',
  Sculpture: '#B8A088',
};

function CommissionCard({ c, onSelect, isSelected }: {
  c: Commission; onSelect: () => void; isSelected: boolean;
}) {
  const stageInfo = STAGES.find(s => s.id === c.stage)!;
  return (
    <motion.div layout onClick={onSelect}
      className={`p-4 border cursor-pointer transition-all duration-300 ${isSelected ? 'border-terracotta shadow-card' : 'border-charcoal/10 hover:border-charcoal/20 hover:shadow-card-hover bg-background'}`}
      style={{ background: isSelected ? 'rgba(160,82,45,0.04)' : undefined }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-sans font-500 text-charcoal truncate">{c.client}</p>
          <p className="text-xs text-muted mt-0.5">{c.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          {c.priority === 'high' && <div className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse-soft" />}
          <span className="text-[10px] font-sans px-1.5 py-0.5 uppercase tracking-widest"
            style={{ background: stageInfo.bg, color: stageInfo.color }}>
            {stageInfo.label}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted mb-2 line-clamp-2 leading-relaxed">{c.description}</p>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2" style={{ background: MEDIUM_COLORS[c.medium] }} />
        <span className="text-xs font-sans text-muted">{c.medium}</span>
      </div>

      {c.progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-label text-muted">Progress</span>
            <span className="text-label text-terracotta">{c.progress}%</span>
          </div>
          <div className="h-px bg-charcoal/8">
            <div className="h-px bg-terracotta transition-all duration-500" style={{ width: `${c.progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-charcoal/5">
        <p className="font-sans text-sm text-charcoal">R {c.value.toLocaleString()}</p>
        <div className="flex items-center gap-2">
          {c.depositPaid
            ? <CheckCircle className="w-3.5 h-3.5 text-sage" />
            : <AlertCircle className="w-3.5 h-3.5 text-muted/50" />}
          {c.dueDate && <span className="text-xs text-muted">{c.dueDate}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function CommissionDetail({ c, onClose, onAdvance }: {
  c: Commission; onClose: () => void; onAdvance: (stage: Stage) => Promise<void>;
}) {
  const currentIdx = STAGES.findIndex(s => s.id === c.stage);
  const nextStage  = STAGES[currentIdx + 1];
  const stageInfo  = STAGES[currentIdx];
  const [advancing, setAdvancing] = useState(false);

  const handleAdvance = async () => {
    if (!nextStage) return;
    setAdvancing(true);
    await onAdvance(nextStage.id);
    setAdvancing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
      className="bg-background border border-charcoal/8 overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 14rem)' }}
    >
      <div className="sticky top-0 bg-background border-b border-charcoal/8 px-5 py-3.5 flex justify-between items-center">
        <p className="font-serif italic text-lg text-charcoal">{c.client}</p>
        <button onClick={onClose} className="text-muted hover:text-charcoal transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Stage */}
        <div className="flex items-center justify-between p-3 border border-charcoal/8"
          style={{ background: stageInfo.bg }}>
          <div>
            <p className="text-label text-muted mb-0.5">Current stage</p>
            <p className="font-sans text-sm" style={{ color: stageInfo.color }}>{stageInfo.label}</p>
          </div>
          {nextStage && (
            <button onClick={handleAdvance} disabled={advancing}
              className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors disabled:opacity-50">
              {advancing
                ? <div className="w-3 h-3 border border-terracotta/50 border-t-terracotta rounded-full animate-spin" />
                : <>Move to {nextStage.label} <ArrowRight className="w-3 h-3" /></>}
            </button>
          )}
        </div>

        {/* Pipeline dots */}
        <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
          {STAGES.map((s, i) => {
            const done = i < currentIdx, current = i === currentIdx;
            return (
              <React.Fragment key={s.id}>
                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${done ? 'bg-sage' : current ? 'bg-terracotta' : 'bg-charcoal/12'}`} />
                {i < STAGES.length - 1 && (
                  <div className={`flex-1 h-px ${done ? 'bg-sage/40' : 'bg-charcoal/8'}`} style={{ minWidth: 8 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-charcoal/70">
            <User className="w-4 h-4 text-muted flex-shrink-0" /> {c.client}
          </div>
          <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-charcoal/70 hover:text-terracotta transition-colors">
            <Mail className="w-4 h-4 text-muted flex-shrink-0" /> {c.email}
          </a>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Image className="w-4 h-4 flex-shrink-0" /> {c.medium}
          </div>
        </div>

        <div className="bg-parchment/50 p-4 border border-charcoal/6">
          <p className="text-label text-muted mb-2">Brief</p>
          <p className="text-sm text-charcoal/75 leading-relaxed">{c.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-parchment/40 p-3 border border-charcoal/6">
            <p className="text-label text-muted mb-1">Commission value</p>
            <p className="font-serif text-xl text-charcoal">R {c.value.toLocaleString()}</p>
          </div>
          <div className="bg-parchment/40 p-3 border border-charcoal/6">
            <p className="text-label text-muted mb-1">Deposit (50%)</p>
            <div className="flex items-center gap-2">
              <p className="font-serif text-xl text-charcoal">R {(c.value * 0.5).toLocaleString()}</p>
              {c.depositPaid
                ? <CheckCircle className="w-4 h-4 text-sage" />
                : <AlertCircle className="w-4 h-4 text-terracotta/60" />}
            </div>
          </div>
        </div>

        {c.notes && (
          <div>
            <p className="text-label text-muted mb-2">Notes</p>
            <p className="text-sm text-charcoal/70 leading-relaxed italic">{c.notes}</p>
          </div>
        )}
        {c.dueDate && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="w-4 h-4" /> Due: {c.dueDate}
          </div>
        )}

        <div className="space-y-2 pt-2">
          {nextStage && (
            <button onClick={handleAdvance} disabled={advancing}
              className="w-full flex items-center justify-center gap-2 bg-terracotta text-background py-3 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors disabled:opacity-50">
              Advance to {nextStage.label} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <a href={`mailto:${c.email}?subject=Commission Update`}
            className="flex items-center justify-center gap-2 w-full py-3 border border-charcoal/15 text-xs font-sans uppercase tracking-widest text-muted hover:border-charcoal/30 hover:text-charcoal transition-all">
            <Mail className="w-3.5 h-3.5" /> Email Client
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function CommissionPipeline() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [selected, setSelected]       = useState<Commission | null>(null);
  const [adding, setAdding]           = useState(false);
  const [saving, setSaving]           = useState(false);
  const [loading, setLoading]         = useState(true);
  const [newForm, setNewForm]         = useState({
    client: '', email: '', medium: 'Painting' as Commission['medium'],
    description: '', value: '', priority: 'normal' as Commission['priority'],
    dueDate: '', notes: '',
  });

  useEffect(() => {
    supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCommissions((data ?? []).map(mapRow));
        setLoading(false);
      });
  }, []);

  const handleAdvance = async (stage: Stage) => {
    if (!selected) return;
    try {
      const { error } = await supabase.from('commissions').update({ stage }).eq('id', selected.id);
      if (error) throw new Error('Failed to advance commission stage.');
      setCommissions(prev => prev.map(c => c.id === selected.id ? { ...c, stage } : c));
      setSelected(prev => prev ? { ...prev, stage } : null);
    } catch (err: unknown) {
      console.error('Error advancing commission:', err);
      alert(err instanceof Error ? err.message : 'Failed to advance commission');
    }
  };

  const handleAdd = async () => {
    if (!newForm.client || !newForm.email || !newForm.description) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('commissions')
        .insert({
          client:       newForm.client,
          email:        newForm.email,
          medium:       newForm.medium,
          description:  newForm.description,
          value_zar:    Number(newForm.value) || 0,
          deposit_paid: false,
          stage:        'inquiry',
          priority:     newForm.priority,
          due_date:     newForm.dueDate || null,
          notes:        newForm.notes   || null,
          progress:     null,
        })
        .select()
        .single();
      if (error) throw new Error('Failed to add commission.');
      setCommissions(prev => [mapRow(data), ...prev]);
      setAdding(false);
      setNewForm({ client: '', email: '', medium: 'Painting', description: '', value: '', priority: 'normal', dueDate: '', notes: '' });
    } catch (err: unknown) {
      console.error('Error adding commission:', err);
      alert(err instanceof Error ? err.message : 'Failed to add commission');
    } finally {
      setSaving(false);
    }
  };

  const pipelineValue = commissions.reduce((s, c) => s + c.value, 0);
  const activeCount   = commissions.filter(c => ['creation','approval'].includes(c.stage)).length;
  const depositDue    = commissions.filter(c => !c.depositPaid && ['contract','quote'].includes(c.stage)).length;

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Commission Pipeline</span>
          <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            Active Commissions
          </h2>
        </div>
        <button onClick={() => setAdding(c => !c)}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans uppercase tracking-widest transition-all shadow-button ${adding ? 'bg-charcoal text-background hover:bg-charcoal/80' : 'bg-terracotta text-background hover:bg-terracottaDark'}`}>
          {adding ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> New Commission</>}
        </button>
      </div>

      {/* New commission form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="bg-background border border-terracotta/20 p-5 sm:p-6 overflow-hidden"
          >
            <p className="font-serif italic text-lg text-charcoal mb-5">New commission</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { label: 'Client name *', field: 'client',  ph: 'Sarah Mitchell'     },
                { label: 'Email *',       field: 'email',   ph: 'client@example.com' },
                { label: 'Value (ZAR) *', field: 'value',   ph: '25000'              },
                { label: 'Due date',      field: 'dueDate', ph: 'Aug 15'             },
              ] as const).map(({ label, field, ph }) => (
                <div key={field} className="group">
                  <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">{label}</label>
                  <input value={newForm[field]} onChange={e => setNewForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={ph}
                    className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
                </div>
              ))}
              <div className="group">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">Medium *</label>
                <select value={newForm.medium} onChange={e => setNewForm(f => ({ ...f, medium: e.target.value as Commission['medium'] }))}
                  className="w-full bg-background border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors">
                  {(['Painting', 'Drawing', 'Sculpture'] as const).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="group">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">Priority</label>
                <select value={newForm.priority} onChange={e => setNewForm(f => ({ ...f, priority: e.target.value as Commission['priority'] }))}
                  className="w-full bg-background border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors">
                  {([['high','High'],['normal','Normal'],['low','Low']] as const).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 group">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">Brief / description *</label>
                <input value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Size, medium, subject matter, special requirements…"
                  className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
              </div>
              <div className="sm:col-span-2 group">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">Internal notes</label>
                <input value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Context, constraints, client preferences…"
                  className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-charcoal/8">
              <button onClick={() => setAdding(false)}
                className="px-4 py-2.5 text-xs font-sans uppercase tracking-widest text-muted border border-charcoal/15 hover:border-charcoal/25 transition-all">
                Cancel
              </button>
              <button disabled={!newForm.client || !newForm.email || !newForm.description || saving}
                onClick={handleAdd}
                className="flex items-center gap-2 bg-terracotta text-background px-5 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button disabled:opacity-50">
                {saving
                  ? <div className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full animate-spin" />
                  : <><Check className="w-3.5 h-3.5" /> Add to Pipeline</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pipeline value',    value: `R ${(pipelineValue / 1000).toFixed(0)}k`, color: '#A0522D' },
          { label: 'In creation',       value: String(activeCount),                        color: '#7C8B6F' },
          { label: 'Deposit pending',   value: String(depositDue),                         color: '#C4956A' },
          { label: 'Total commissions', value: String(commissions.length),                 color: '#B8A088' },
        ].map(s => (
          <div key={s.label} className="bg-background border border-charcoal/8 p-4">
            <p className="text-label uppercase tracking-widest text-muted mb-1">{s.label}</p>
            <p className="font-serif text-2xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Stage legend */}
      <div className="flex flex-wrap gap-2">
        {STAGES.map(s => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {loading && (
        <div className="py-16 text-center text-muted font-serif italic">Loading commissions…</div>
      )}

      {/* List + detail */}
      {!loading && (
        <div className={`grid gap-4 ${selected ? 'lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          <div className={selected ? 'lg:col-span-3 space-y-3' : 'col-span-full grid sm:grid-cols-2 lg:grid-cols-3 gap-3'}>
            {commissions
              .sort((a, b) => ({ high: 0, normal: 1, low: 2 }[a.priority] - { high: 0, normal: 1, low: 2 }[b.priority]))
              .map(c => (
                <CommissionCard key={c.id} c={c}
                  isSelected={selected?.id === c.id}
                  onSelect={() => setSelected(selected?.id === c.id ? null : c)} />
              ))}
            {commissions.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted font-serif italic">No commissions yet.</div>
            )}
          </div>
          <AnimatePresence>
            {selected && (
              <div className="lg:col-span-2">
                <CommissionDetail c={selected} onClose={() => setSelected(null)} onAdvance={handleAdvance} />
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
