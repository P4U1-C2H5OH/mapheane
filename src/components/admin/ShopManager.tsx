import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit3, Trash2, X, Save, AlertCircle, Check,
  ToggleLeft, ToggleRight, Loader, Package,
} from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { supabase } from '../../lib/supabase';
import { useEditions, Edition, mapEditionRow } from '../../hooks/useEditions';
import { useArtworks } from '../../hooks/useArtworks';

const ZAR_RATE = 18;
const EDITION_TYPES = ['Limited', 'Open', 'Artist Proof'] as const;
const PAPER_PRESETS = [
  'Hahnemühle German Etching 310gsm',
  'Hahnemühle Photo Rag 308gsm',
  'Canson Platine Fibre Rag 310gsm',
  'Hahnemühle FineArt Baryta 325gsm',
  'Ilford Smooth Pearl 270gsm',
  'Custom',
];
const SIZE_PRESETS = [
  'A4 · 21 × 29.7 cm', 'A3 · 29.7 × 42 cm', 'A2 · 42 × 59.4 cm',
  '40 × 53 cm', '50 × 70 cm', '60 × 80 cm', '70 × 100 cm', 'Custom',
];

type FormMode = 'list' | 'add' | 'edit';

interface EditionForm {
  artworkId: string;
  title: string;
  medium: string;
  year: string;
  type: Edition['type'];
  sizePreset: string;
  customSize: string;
  paperPreset: string;
  customPaper: string;
  editionSize: string;
  editionSold: string;
  priceZar: string;
  imageUrl: string;
  available: boolean;
  description: string;
}

function Field({ label, value, onChange, type = 'text', placeholder, hint, error }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; error?: string;
}) {
  return (
    <div className="group">
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors text-xs">
          {label}
        </label>
        {hint && <span className="text-xs text-muted/50">{hint}</span>}
      </div>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
          className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors resize-none placeholder:text-charcoal/25" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-transparent border px-3 py-2 text-sm text-charcoal focus:outline-none transition-colors placeholder:text-charcoal/25 ${
            error ? 'border-red-300 focus:border-red-400' : 'border-charcoal/12 focus:border-terracotta/50'
          }`} />
      )}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function EditionForm({ initial, isNew, artworks, onSave, onCancel }: {
  initial: Partial<Edition>;
  isNew: boolean;
  artworks: ReturnType<typeof useArtworks>['artworks'];
  onSave: (data: EditionForm) => Promise<void>;
  onCancel: () => void;
}) {
  const isSizePreset  = (v: string) => SIZE_PRESETS.some(p => p === v && p !== 'Custom');
  const isPaperPreset = (v: string) => PAPER_PRESETS.some(p => p === v && p !== 'Custom');

  const [form, setForm] = useState<EditionForm>({
    artworkId:   initial.artworkId  ?? '',
    title:       initial.title      ?? '',
    medium:      initial.medium     ?? 'Archival Giclée',
    year:        String(initial.year ?? new Date().getFullYear()),
    type:        initial.type       ?? 'Limited',
    sizePreset:  isSizePreset(initial.size ?? '') ? (initial.size ?? '') : (initial.size ? 'Custom' : ''),
    customSize:  isSizePreset(initial.size ?? '') ? '' : (initial.size ?? ''),
    paperPreset: isPaperPreset(initial.paper ?? '') ? (initial.paper ?? '') : (initial.paper ? 'Custom' : ''),
    customPaper: isPaperPreset(initial.paper ?? '') ? '' : (initial.paper ?? ''),
    editionSize: initial.editionSize != null ? String(initial.editionSize) : '',
    editionSold: String(initial.editionSold ?? 0),
    priceZar:    initial.price ? String(initial.price.zar) : '',
    imageUrl:    initial.image ?? '',
    available:   initial.available ?? true,
    description: initial.description ?? '',
  });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveErr, setSaveErr]   = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const update = (k: keyof EditionForm, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setSaveErr('');
  };

  const size  = form.sizePreset  === 'Custom' ? form.customSize  : form.sizePreset;
  const paper = form.paperPreset === 'Custom' ? form.customPaper : form.paperPreset;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())  e.title   = 'Title is required';
    if (!size.trim())        e.size    = 'Size is required';
    if (!form.priceZar || isNaN(Number(form.priceZar)) || Number(form.priceZar) <= 0)
                             e.priceZar = 'Enter a valid ZAR price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveErr('');
    try {
      await onSave({ ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err: unknown) {
      setSaveErr(err instanceof Error ? err.message : 'Failed to save edition');
    } finally {
      setSaving(false);
    }
  };

  const selectedArtwork = artworks.find(a => a.id === form.artworkId);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-5 border-b border-charcoal/8">
        <div>
          <span className="text-label uppercase tracking-[0.28em] text-terracotta block mb-1">
            {isNew ? 'New Edition' : 'Edit Edition'}
          </span>
          <h3 className="font-serif italic text-2xl text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            {form.title || (isNew ? 'Add print edition' : 'Untitled')}
          </h3>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button onClick={onCancel}
            className="px-4 py-2 text-xs font-sans uppercase tracking-widest text-muted border border-charcoal/15 hover:border-charcoal/30 hover:text-charcoal transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-sans uppercase tracking-widest transition-all ${
              saved ? 'bg-sage text-background' : 'bg-terracotta text-background hover:bg-terracottaDark shadow-button'
            } disabled:opacity-60`}>
            {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> :
             saved   ? <><Check className="w-3.5 h-3.5" /> Saved</> :
                       <><Save className="w-3.5 h-3.5" /> Save Edition</>}
          </button>
        </div>
      </div>

      {saveErr && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-3 mb-6 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveErr}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — edition details */}
        <div className="space-y-5">

          {/* Link to artwork */}
          <div>
            <label className="text-label uppercase tracking-widest text-muted block mb-1.5 text-xs">
              Linked Artwork <span className="text-muted/50 normal-case tracking-normal">(optional)</span>
            </label>
            <select value={form.artworkId} onChange={e => {
                const art = artworks.find(a => a.id === e.target.value);
                update('artworkId', e.target.value);
                if (art && !form.title) update('title', art.title);
                if (art?.year && !form.year) update('year', String(art.year));
                if (art?.images[0] && !form.imageUrl) update('imageUrl', art.images[0]);
              }}
              className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors">
              <option value="">— No linked artwork —</option>
              {artworks.map(a => (
                <option key={a.id} value={a.id}>{a.title} ({a.year ?? '—'})</option>
              ))}
            </select>
            {selectedArtwork?.images[0] && (
              <img src={selectedArtwork.images[0]} alt={selectedArtwork.title}
                className="mt-2 h-16 w-24 object-cover rounded border border-charcoal/8"
                style={{ objectPosition: selectedArtwork.cropPosition }} draggable={false} />
            )}
          </div>

          <Field label="Edition Title" value={form.title} onChange={v => update('title', v)}
            placeholder="Ce Père Idéal" error={errors.title} />

          <Field label="Print Medium" value={form.medium} onChange={v => update('medium', v)}
            placeholder="Archival Giclée" hint="Print technique" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year" value={form.year} onChange={v => update('year', v)}
              type="number" placeholder={String(new Date().getFullYear())} />

            {/* Type */}
            <div>
              <label className="text-label uppercase tracking-widest text-muted block mb-1.5 text-xs">Type</label>
              <div className="flex gap-1">
                {EDITION_TYPES.map(t => (
                  <button key={t} onClick={() => update('type', t)}
                    className={`flex-1 py-2 text-xs font-sans border transition-all ${
                      form.type === t
                        ? 'border-terracotta bg-terracotta/8 text-terracotta'
                        : 'border-charcoal/12 text-muted hover:border-charcoal/25'
                    }`}>
                    {t === 'Artist Proof' ? 'AP' : t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-label uppercase tracking-widest text-muted block mb-1.5 text-xs">
              Size<span className="text-terracotta ml-0.5">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SIZE_PRESETS.map(p => (
                <button key={p} onClick={() => update('sizePreset', p)}
                  className={`px-2.5 py-1 text-xs font-sans border transition-all ${
                    form.sizePreset === p
                      ? 'border-terracotta bg-terracotta/8 text-terracotta'
                      : 'border-charcoal/12 text-muted hover:border-charcoal/25'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
            {form.sizePreset === 'Custom' && (
              <Field label="" value={form.customSize} onChange={v => update('customSize', v)}
                placeholder="e.g. 80 × 110 cm" error={errors.size} />
            )}
            {errors.size && form.sizePreset !== 'Custom' && (
              <p className="text-xs text-red-400">{errors.size}</p>
            )}
          </div>

          {/* Paper */}
          <div>
            <label className="text-label uppercase tracking-widest text-muted block mb-1.5 text-xs">Paper</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PAPER_PRESETS.map(p => (
                <button key={p} onClick={() => update('paperPreset', p)}
                  className={`px-2.5 py-1 text-xs font-sans border transition-all ${
                    form.paperPreset === p
                      ? 'border-terracotta bg-terracotta/8 text-terracotta'
                      : 'border-charcoal/12 text-muted hover:border-charcoal/25'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
            {form.paperPreset === 'Custom' && (
              <Field label="" value={form.customPaper} onChange={v => update('customPaper', v)}
                placeholder="e.g. Canson Edition Cream 250gsm" />
            )}
          </div>

          <Field label="Description" type="textarea" value={form.description}
            onChange={v => update('description', v)}
            placeholder="Describe this print — finish, texture, what it reproduces…" />
        </div>

        {/* Right — pricing, edition count, image */}
        <div className="space-y-5">

          {/* Pricing */}
          <div>
            <label className="text-label uppercase tracking-widest text-muted block mb-1.5 text-xs">
              Price (ZAR)<span className="text-terracotta ml-0.5">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-muted">R</span>
              <input type="number" value={form.priceZar} onChange={e => update('priceZar', e.target.value)}
                placeholder="4500"
                className={`w-full bg-transparent border pl-7 pr-3 py-2 text-sm text-charcoal focus:outline-none transition-colors ${
                  errors.priceZar ? 'border-red-300' : 'border-charcoal/12 focus:border-terracotta/50'
                }`} />
            </div>
            {errors.priceZar && <p className="text-xs text-red-400 mt-1">{errors.priceZar}</p>}
            {form.priceZar && !isNaN(Number(form.priceZar)) && Number(form.priceZar) > 0 && (
              <p className="text-xs text-muted/60 mt-1">
                ≈ €{(Number(form.priceZar) / ZAR_RATE).toFixed(0)} EUR
              </p>
            )}
          </div>

          {/* Edition count */}
          {form.type !== 'Open' && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Edition Size" value={form.editionSize} onChange={v => update('editionSize', v)}
                type="number" placeholder="25" hint="Leave blank = open" />
              <Field label="Sold Count" value={form.editionSold} onChange={v => update('editionSold', v)}
                type="number" placeholder="0" />
            </div>
          )}

          {/* Availability toggle */}
          <div className="flex items-center justify-between p-4 border border-charcoal/8 bg-parchment/30">
            <div>
              <p className="text-sm font-sans text-charcoal mb-0.5">Availability</p>
              <p className="text-xs text-muted">{form.available ? 'Listed in shop' : 'Hidden from shop'}</p>
            </div>
            <button onClick={() => update('available', !form.available)}>
              {form.available
                ? <ToggleRight className="w-8 h-8 text-sage" />
                : <ToggleLeft  className="w-8 h-8 text-muted/40" />}
            </button>
          </div>

          {/* Image */}
          <div>
            <label className="text-label uppercase tracking-widest text-muted block mb-1.5 text-xs">
              Edition Image
            </label>

            {selectedArtwork?.images.length ? (
              /* Artwork linked — pick one of its images or override */
              <div className="space-y-3">
                <p className="text-xs text-muted/70">
                  Select an image from the linked artwork, or paste a custom URL below.
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedArtwork.images.map((img, i) => (
                    <button key={i} type="button" onClick={() => update('imageUrl', img)}
                      className={`relative overflow-hidden flex-shrink-0 border-2 transition-all ${
                        form.imageUrl === img
                          ? 'border-terracotta'
                          : 'border-charcoal/10 hover:border-charcoal/30'
                      }`}>
                      <img src={img} alt={`Artwork image ${i + 1}`} draggable={false}
                        className="w-20 h-24 object-cover"
                        style={{ objectPosition: selectedArtwork.cropPosition }} />
                      {form.imageUrl === img && (
                        <div className="absolute inset-0 bg-terracotta/15 flex items-end justify-center pb-1">
                          <Check className="w-4 h-4 text-terracotta" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Field label="Custom URL override" value={form.imageUrl} onChange={v => update('imageUrl', v)}
                  placeholder="https://res.cloudinary.com/… (optional)" />
              </div>
            ) : (
              /* No linked artwork — upload or paste URL */
              <div className="space-y-3">
                <ImageUpload
                  images={form.imageUrl ? [form.imageUrl] : []}
                  onChange={urls => update('imageUrl', urls[0] ?? '')}
                  maxImages={1}
                  label=""
                />
                <Field label="Or paste URL" value={form.imageUrl} onChange={v => update('imageUrl', v)}
                  placeholder="https://res.cloudinary.com/…" />
              </div>
            )}

            {/* Preview */}
            {form.imageUrl && (
              <div className="mt-3 aspect-[3/4] overflow-hidden border border-charcoal/8 bg-parchment/50 max-w-[120px]">
                <img src={form.imageUrl} alt="Preview" draggable={false}
                  className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ShopManager() {
  const { editions, setEditions, loading } = useEditions();
  const { artworks } = useArtworks();
  const [mode, setMode]           = useState<FormMode>('list');
  const [editTarget, setEditTarget] = useState<Edition | null>(null);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [filter, setFilter]       = useState<string>('all');

  const filtered = editions.filter(e =>
    filter === 'all' || e.type === filter
  );

  const handleAdd = async (form: EditionForm) => {
    const priceEur = Number(form.priceZar) / ZAR_RATE;
    const { data: row, error } = await supabase
      .from('editions')
      .insert({
        artwork_id:   form.artworkId || null,
        title:        form.title,
        medium:       form.medium || null,
        year:         form.year ? Number(form.year) : null,
        type:         form.type,
        size:         form.sizePreset === 'Custom' ? form.customSize : form.sizePreset,
        paper:        form.paperPreset === 'Custom' ? form.customPaper : form.paperPreset,
        edition_size: form.editionSize ? Number(form.editionSize) : null,
        edition_sold: Number(form.editionSold) || 0,
        price_eur:    priceEur,
        price_zar:    Number(form.priceZar),
        image_url:    form.imageUrl || null,
        available:    form.available,
        description:  form.description,
      })
      .select().single();
    if (error) throw new Error('Failed to save edition.');
    setEditions(prev => [mapEditionRow(row), ...prev]);
    setMode('list');
  };

  const handleEdit = async (form: EditionForm) => {
    if (!editTarget) return;
    const priceEur = Number(form.priceZar) / ZAR_RATE;
    const { error } = await supabase
      .from('editions')
      .update({
        artwork_id:   form.artworkId || null,
        title:        form.title,
        medium:       form.medium || null,
        year:         form.year ? Number(form.year) : null,
        type:         form.type,
        size:         form.sizePreset === 'Custom' ? form.customSize : form.sizePreset,
        paper:        form.paperPreset === 'Custom' ? form.customPaper : form.paperPreset,
        edition_size: form.editionSize ? Number(form.editionSize) : null,
        edition_sold: Number(form.editionSold) || 0,
        price_eur:    priceEur,
        price_zar:    Number(form.priceZar),
        image_url:    form.imageUrl || null,
        available:    form.available,
        description:  form.description,
      })
      .eq('id', editTarget.id);
    if (error) throw new Error('Failed to update edition.');
    const updated: Edition = {
      ...editTarget,
      artworkId:   form.artworkId || null,
      title:       form.title,
      medium:      form.medium,
      year:        form.year ? Number(form.year) : null,
      type:        form.type,
      size:        form.sizePreset === 'Custom' ? form.customSize : form.sizePreset,
      paper:       form.paperPreset === 'Custom' ? form.customPaper : form.paperPreset,
      editionSize: form.editionSize ? Number(form.editionSize) : null,
      editionSold: Number(form.editionSold) || 0,
      price:       { eur: priceEur, zar: Number(form.priceZar) },
      image:       form.imageUrl,
      available:   form.available,
      description: form.description,
    };
    setEditions(prev => prev.map(e => e.id === editTarget.id ? updated : e));
    setMode('list');
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('editions').delete().eq('id', id);
    if (!error) { setEditions(prev => prev.filter(e => e.id !== id)); setDelConfirm(null); }
  };

  const toggleAvailable = async (id: string) => {
    const edition = editions.find(e => e.id === id);
    if (!edition) return;
    const next = !edition.available;
    const { error } = await supabase.from('editions').update({ available: next }).eq('id', id);
    if (!error) setEditions(prev => prev.map(e => e.id === id ? { ...e, available: next } : e));
  };

  if (mode === 'add') return (
    <div className="max-w-5xl">
      <EditionForm initial={{}} isNew artworks={artworks}
        onSave={handleAdd} onCancel={() => setMode('list')} />
    </div>
  );

  if (mode === 'edit' && editTarget) return (
    <div className="max-w-5xl">
      <EditionForm initial={editTarget} isNew={false} artworks={artworks}
        onSave={handleEdit} onCancel={() => { setMode('list'); setEditTarget(null); }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif italic text-2xl text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            Print Editions
          </h2>
          <p className="text-xs text-muted mt-1">{editions.length} edition{editions.length !== 1 ? 's' : ''} · {editions.filter(e => e.available).length} available</p>
        </div>
        <button onClick={() => setMode('add')}
          className="flex items-center gap-2 bg-terracotta text-background px-4 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button">
          <Plus className="w-4 h-4" /> Add Edition
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'Limited', 'Open', 'Artist Proof'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-sans border transition-all ${
              filter === f
                ? 'border-terracotta bg-terracotta/8 text-terracotta'
                : 'border-charcoal/12 text-muted hover:border-charcoal/25'
            }`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-6 h-6 text-terracotta animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && editions.length === 0 && (
        <div className="text-center py-20 border border-dashed border-charcoal/12 rounded">
          <Package className="w-10 h-10 text-muted/30 mx-auto mb-4" />
          <p className="font-serif italic text-lg text-charcoal/40 mb-1">No editions yet</p>
          <p className="text-xs text-muted/50 mb-6">Add your first print edition to the shop</p>
          <button onClick={() => setMode('add')}
            className="px-5 py-2.5 bg-terracotta text-background text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors">
            Add Edition
          </button>
        </div>
      )}

      {/* Editions table */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(edition => {
              const artwork = artworks.find(a => a.id === edition.artworkId);
              const soldPct = edition.editionSize
                ? Math.round((edition.editionSold / edition.editionSize) * 100)
                : null;

              return (
                <motion.div key={edition.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-4 p-4 border border-charcoal/8 hover:border-charcoal/16 transition-colors bg-background group">

                  {/* Image */}
                  <div className="w-14 h-14 flex-shrink-0 overflow-hidden bg-parchment border border-charcoal/8">
                    {edition.image
                      ? <img src={edition.image} alt={edition.title} draggable={false}
                          className="w-full h-full object-cover" />
                      : artwork?.images[0]
                        ? <img src={artwork.images[0]} alt={edition.title} draggable={false}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: artwork.cropPosition }} />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted/30" />
                          </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-serif italic text-sm text-charcoal truncate">{edition.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 font-sans border flex-shrink-0 ${
                        edition.type === 'Limited'      ? 'border-terracotta/30 text-terracotta bg-terracotta/5' :
                        edition.type === 'Artist Proof' ? 'border-gold/40 text-gold/80 bg-gold/5' :
                                                          'border-charcoal/20 text-muted'
                      }`}>
                        {edition.type === 'Artist Proof' ? 'AP' : edition.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{edition.size} · {edition.paper}</p>
                    {edition.type !== 'Open' && edition.editionSize && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-charcoal/8 max-w-[80px]">
                          <div className="h-full bg-terracotta/60"
                            style={{ width: `${soldPct}%` }} />
                        </div>
                        <span className="text-xs text-muted/60">
                          {edition.editionSold}/{edition.editionSize} sold
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-sans text-charcoal">R{edition.price.zar.toLocaleString()}</p>
                    <p className="text-xs text-muted">€{edition.price.eur.toFixed(0)}</p>
                  </div>

                  {/* Available toggle */}
                  <button onClick={() => toggleAvailable(edition.id)} className="flex-shrink-0"
                    title={edition.available ? 'Listed' : 'Hidden'}>
                    {edition.available
                      ? <ToggleRight className="w-7 h-7 text-sage" />
                      : <ToggleLeft  className="w-7 h-7 text-muted/30" />}
                  </button>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => { setEditTarget(edition); setMode('edit'); }}
                      className="p-1.5 text-muted hover:text-terracotta transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDelConfirm(edition.id)}
                      className="p-1.5 text-muted hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {delConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-background p-6 max-w-sm w-full">
              <h4 className="font-serif italic text-lg text-charcoal mb-2">Remove edition?</h4>
              <p className="text-sm text-muted mb-5">This edition will be removed from the shop.</p>
              <div className="flex gap-3">
                <button onClick={() => setDelConfirm(null)}
                  className="flex-1 py-2.5 text-xs font-sans uppercase tracking-widest border border-charcoal/15 text-muted hover:text-charcoal transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(delConfirm)}
                  className="flex-1 py-2.5 text-xs font-sans uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors">
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
