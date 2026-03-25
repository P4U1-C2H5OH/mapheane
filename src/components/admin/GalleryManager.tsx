import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit3, Trash2, X, Check, Image as ImageIcon,
  Save, AlertCircle, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type FormMode = 'list' | 'add' | 'edit';

const MEDIUMS = ['Painting', 'Drawing', 'Clay Model'] as const;

// Supabase-backed artwork — id is UUID string
interface GalleryArtwork {
  id: string;
  title: string;
  dimensions: string;
  technique: string;
  medium: 'Painting' | 'Drawing' | 'Clay Model';
  status: 'Available' | 'Sold';
  cropPosition: string;
  offsetClass: string;
  price: number; // price_eur in DB
  description: string;
  images: string[];
  year?: number;
}

function mapRow(row: Record<string, unknown>): GalleryArtwork {
  return {
    id:           row.id as string,
    title:        (row.title        as string) ?? '',
    dimensions:   (row.dimensions   as string) ?? '',
    technique:    (row.technique    as string) ?? '',
    medium:       ((row.medium ?? 'Painting') as GalleryArtwork['medium']),
    status:       ((row.status ?? 'Available') as GalleryArtwork['status']),
    cropPosition: (row.crop_position as string) ?? '50% 50%',
    offsetClass:  (row.offset_class  as string) ?? 'mt-0',
    price:        (row.price_eur     as number) ?? 0,
    description:  (row.description  as string) ?? '',
    images:       Array.isArray(row.images) ? (row.images as string[]) : ['/artportfolio.jpg'],
    year:         (row.year as number | undefined) ?? undefined,
  };
}

function Field({ label, value, onChange, type = 'text', placeholder, required, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; hint?: string;
}) {
  return (
    <div className="group">
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors">
          {label}{required && <span className="text-terracotta ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-muted/50">{hint}</span>}
      </div>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
          className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors resize-none placeholder:text-charcoal/25" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} required={required}
          className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
      )}
    </div>
  );
}

function ArtworkForm({
  initial, onSave, onCancel, isNew,
}: {
  initial: Partial<GalleryArtwork>;
  onSave: (a: Partial<GalleryArtwork>) => Promise<void>;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState({
    title:        initial.title        ?? '',
    technique:    initial.technique    ?? '',
    dimensions:   initial.dimensions   ?? '',
    medium:       initial.medium       ?? 'Painting' as GalleryArtwork['medium'],
    year:         String(initial.year  ?? new Date().getFullYear()),
    description:  initial.description  ?? '',
    price:        String(initial.price ?? ''),
    status:       initial.status       ?? 'Available' as GalleryArtwork['status'],
    cropPosition: initial.cropPosition ?? '50% 50%',
    imageUrl:     initial.images?.[0]  ?? '',
  });
  const [errors, setErrors]     = useState<Partial<Record<keyof typeof form, string>>>({});
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');

  const update = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
    setSaveError('');
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim())      e.title      = 'Title is required';
    if (!form.technique.trim())  e.technique  = 'Technique is required';
    if (!form.dimensions.trim()) e.dimensions = 'Dimensions required';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price required (EUR)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave({
        ...initial,
        title:        form.title,
        technique:    form.technique,
        dimensions:   form.dimensions,
        medium:       form.medium as GalleryArtwork['medium'],
        year:         Number(form.year),
        description:  form.description,
        price:        Number(form.price),
        status:       form.status as GalleryArtwork['status'],
        cropPosition: form.cropPosition,
        images:       [form.imageUrl || '/artportfolio.jpg'],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save artwork');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-0.5">
            {isNew ? 'New Artwork' : 'Edit Artwork'}
          </span>
          <h3 className="font-serif italic text-xl text-charcoal">
            {isNew ? 'Add to collection' : form.title || 'Untitled'}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-sans uppercase tracking-widest transition-all ${
              saved
                ? 'bg-sage text-background'
                : 'bg-terracotta text-background hover:bg-terracottaDark shadow-button'
            } disabled:opacity-60`}>
            {saving ? <div className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full animate-spin" /> :
             saved  ? <><Check className="w-3.5 h-3.5" /> Saved</> :
                      <><Save className="w-3.5 h-3.5" /> Save</>}
          </button>
          <button onClick={onCancel} className="p-2 text-muted hover:text-charcoal hover:rotate-90 transition-all duration-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          <Field label="Title" value={form.title} onChange={v => update('title', v)} required
            placeholder="Artwork title" />
          {errors.title && <p className="text-xs text-red-400 -mt-3">{errors.title}</p>}

          <Field label="Technique" value={form.technique} onChange={v => update('technique', v)} required
            placeholder="e.g. Mixed media on resin canvas" />
          {errors.technique && <p className="text-xs text-red-400 -mt-3">{errors.technique}</p>}

          <Field label="Dimensions" value={form.dimensions} onChange={v => update('dimensions', v)} required
            placeholder="e.g. 97cm × 130cm" />
          {errors.dimensions && <p className="text-xs text-red-400 -mt-3">{errors.dimensions}</p>}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (EUR)" type="number" value={form.price} onChange={v => update('price', v)}
              required placeholder="e.g. 2800" hint="ZAR = price × 18" />
            <Field label="Year" type="number" value={form.year} onChange={v => update('year', v)}
              placeholder={String(new Date().getFullYear())} />
          </div>
          {errors.price && <p className="text-xs text-red-400 -mt-3">{errors.price}</p>}

          {/* Medium select */}
          <div>
            <p className="text-label uppercase tracking-widest text-muted mb-1.5">Medium</p>
            <div className="flex gap-2">
              {MEDIUMS.map(m => (
                <button key={m} type="button" onClick={() => update('medium', m)}
                  className={`text-xs font-sans px-3 py-1.5 border transition-all ${
                    form.medium === m ? 'bg-charcoal text-background border-charcoal' : 'border-charcoal/15 text-muted hover:border-charcoal/30'
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Availability toggle */}
          <div className="flex items-center justify-between p-3 border border-charcoal/10">
            <div>
              <p className="text-sm font-sans text-charcoal">Availability</p>
              <p className="text-xs text-muted">{form.status}</p>
            </div>
            <button type="button"
              onClick={() => update('status', form.status === 'Available' ? 'Sold' : 'Available')}
              className={`transition-colors ${form.status === 'Available' ? 'text-sage' : 'text-muted/40'}`}>
              {form.status === 'Available'
                ? <ToggleRight className="w-8 h-8" />
                : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Image preview + URL */}
          <div>
            <p className="text-label uppercase tracking-widest text-muted mb-2">Artwork Image</p>
            <div className="aspect-[3/4] bg-parchment mb-3 overflow-hidden relative">
              <img src={form.imageUrl || '/artportfolio.jpg'} alt="Preview"
                className="w-full h-full object-cover"
                style={{ objectPosition: form.cropPosition }}
                onError={e => { (e.target as HTMLImageElement).src = '/artportfolio.jpg'; }} />
            </div>
            <Field label="Image URL" value={form.imageUrl} onChange={v => update('imageUrl', v)}
              placeholder="/artportfolio.jpg or Cloudinary URL" hint="Replace with real URL" />
          </div>

          {/* Crop position */}
          <div>
            <p className="text-label uppercase tracking-widest text-muted mb-1.5">
              Crop position <span className="text-muted/50 normal-case not-italic tracking-normal">for gallery framing</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                ['50% 20%', 'Top'],
                ['50% 50%', 'Centre'],
                ['50% 80%', 'Bottom'],
                ['30% 50%', 'Left'],
              ].map(([val, label]) => (
                <button key={val} type="button" onClick={() => update('cropPosition', val)}
                  className={`text-xs py-1.5 border transition-all ${
                    form.cropPosition === val ? 'bg-charcoal text-background border-charcoal' : 'border-charcoal/15 text-muted hover:border-charcoal/25'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <input value={form.cropPosition} onChange={e => update('cropPosition', e.target.value)}
              placeholder="50% 50%"
              className="mt-2 w-full bg-transparent border border-charcoal/12 px-3 py-1.5 text-xs text-muted focus:outline-none focus:border-terracotta/50 transition-colors" />
          </div>

          {/* Description */}
          <Field label="Description" type="textarea" value={form.description} onChange={v => update('description', v)}
            placeholder="About this work..." hint="Shown on artwork page" />
        </div>
      </div>

      {/* Preview bar */}
      <div className="mt-6 pt-5 border-t border-charcoal/8">
        <p className="text-label uppercase tracking-widest text-muted mb-3">Preview (as shown in gallery)</p>
        <div className="flex items-center gap-4 p-4 bg-parchment/40 border border-charcoal/8">
          <div className="w-14 overflow-hidden bg-background flex-shrink-0" style={{ height: '4.5rem' }}>
            <img src={form.imageUrl || '/artportfolio.jpg'} alt="thumb"
              className="w-full h-full object-cover"
              style={{ objectPosition: form.cropPosition }} />
          </div>
          <div>
            <p className="font-serif italic text-charcoal">{form.title || 'Untitled'}</p>
            <p className="text-xs text-muted">{form.technique || 'Technique'}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-charcoal">
                {form.price ? `R ${(Number(form.price) * 18).toLocaleString()}` : '—'}
              </span>
              <span className={`text-label uppercase tracking-widest ${form.status === 'Available' ? 'text-sage' : 'text-muted'}`}>
                {form.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function GalleryManager() {
  const [mode,       setMode]      = useState<FormMode>('list');
  const [artworks,   setArtworks]  = useState<GalleryArtwork[]>([]);
  const [editTarget, setEditTarget] = useState<GalleryArtwork | null>(null);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);
  const [filter,     setFilter]    = useState<'all' | 'Available' | 'Sold'>('all');
  const [loading,    setLoading]   = useState(true);
  const [loadError,  setLoadError] = useState('');

  useEffect(() => {
    supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setLoadError('Failed to load artworks.');
        } else {
          setArtworks((data ?? []).map(mapRow));
        }
        setLoading(false);
      });
  }, []);

  const filtered = artworks.filter(a => filter === 'all' || a.status === filter);

  const handleAdd = async (data: Partial<GalleryArtwork>): Promise<void> => {
    const { data: row, error } = await supabase
      .from('artworks')
      .insert({
        title:         data.title,
        technique:     data.technique,
        dimensions:    data.dimensions,
        medium:        data.medium,
        year:          data.year ?? null,
        description:   data.description ?? '',
        price_eur:     data.price,
        status:        data.status ?? 'Available',
        crop_position: data.cropPosition ?? '50% 50%',
        offset_class:  data.offsetClass ?? 'mt-0',
        images:        data.images ?? ['/artportfolio.jpg'],
      })
      .select()
      .single();
    if (error) throw new Error('Failed to save artwork. Check your connection and try again.');
    setArtworks(prev => [mapRow(row), ...prev]);
    setMode('list');
  };

  const handleEdit = async (data: Partial<GalleryArtwork>): Promise<void> => {
    const { error } = await supabase
      .from('artworks')
      .update({
        title:         data.title,
        technique:     data.technique,
        dimensions:    data.dimensions,
        medium:        data.medium,
        year:          data.year ?? null,
        description:   data.description ?? '',
        price_eur:     data.price,
        status:        data.status ?? 'Available',
        crop_position: data.cropPosition ?? '50% 50%',
        offset_class:  data.offsetClass ?? 'mt-0',
        images:        data.images ?? ['/artportfolio.jpg'],
      })
      .eq('id', data.id!);
    if (error) throw new Error('Failed to update artwork. Check your connection and try again.');
    setArtworks(prev => prev.map(a => a.id === data.id ? { ...a, ...data } as GalleryArtwork : a));
    setMode('list');
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (!error) {
      setArtworks(prev => prev.filter(a => a.id !== id));
      setDelConfirm(null);
    }
  };

  const toggleStatus = async (id: string) => {
    const art = artworks.find(a => a.id === id);
    if (!art) return;
    const next = art.status === 'Available' ? 'Sold' : 'Available';
    const { error } = await supabase.from('artworks').update({ status: next }).eq('id', id);
    if (!error) {
      setArtworks(prev => prev.map(a => a.id === id ? { ...a, status: next } : a));
    }
  };

  if (mode === 'add') {
    return (
      <div className="max-w-5xl">
        <ArtworkForm initial={{}} onSave={handleAdd} onCancel={() => setMode('list')} isNew />
      </div>
    );
  }

  if (mode === 'edit' && editTarget) {
    return (
      <div className="max-w-5xl">
        <ArtworkForm initial={editTarget} onSave={handleEdit}
          onCancel={() => { setMode('list'); setEditTarget(null); }} isNew={false} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-label uppercase tracking-[0.25em] text-terracotta block mb-1">Gallery</span>
          <h2 className="font-serif text-3xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            Artwork Collection
          </h2>
        </div>
        <button onClick={() => setMode('add')}
          className="flex items-center gap-2 bg-terracotta text-background px-4 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button">
          <Plus className="w-3.5 h-3.5" /> Add Artwork
        </button>
      </div>

      {/* Stats + filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-charcoal">{artworks.length} total</span>
          <span className="text-sage">{artworks.filter(a => a.status === 'Available').length} available</span>
          <span className="text-muted">{artworks.filter(a => a.status === 'Sold').length} sold</span>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'Available', 'Sold'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-sans uppercase tracking-widest transition-all capitalize ${
                filter === f ? 'bg-charcoal text-background' : 'border border-charcoal/15 text-muted hover:border-charcoal/25'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / error */}
      {loading && (
        <div className="py-16 text-center text-muted font-serif italic">Loading artworks…</div>
      )}
      {loadError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {/* Artwork table */}
      {!loading && !loadError && (
        <div className="space-y-0 border border-charcoal/8">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2.5 bg-parchment/40 border-b border-charcoal/8">
            <div className="col-span-5">
              <p className="text-label uppercase tracking-widest text-muted">Work</p>
            </div>
            <div className="col-span-2">
              <p className="text-label uppercase tracking-widest text-muted">Medium</p>
            </div>
            <div className="col-span-2">
              <p className="text-label uppercase tracking-widest text-muted">Price</p>
            </div>
            <div className="col-span-2">
              <p className="text-label uppercase tracking-widest text-muted">Status</p>
            </div>
            <div className="col-span-1" />
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.map(art => (
              <motion.div key={art.id} layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-12 gap-3 sm:gap-4 px-4 py-4 border-b border-charcoal/6 last:border-0 hover:bg-parchment/20 transition-colors items-center"
              >
                {/* Thumbnail + title */}
                <div className="col-span-9 sm:col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-12 h-14 overflow-hidden bg-parchment flex-shrink-0">
                    <img src={art.images[0]} alt={art.title} draggable={false}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: art.cropPosition }}
                      onError={e => { (e.target as HTMLImageElement).src = '/artportfolio.jpg'; }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-sm italic text-charcoal truncate">{art.title}</p>
                    <p className="text-xs text-muted truncate">{art.technique}</p>
                    <p className="text-xs text-muted/60">{art.dimensions}</p>
                  </div>
                </div>

                {/* Medium */}
                <div className="hidden sm:block col-span-2">
                  <span className="text-xs font-sans text-muted">{art.medium}</span>
                </div>

                {/* Price */}
                <div className="hidden sm:block col-span-2">
                  <p className="text-sm text-charcoal">R {(art.price * 18).toLocaleString()}</p>
                  <p className="text-xs text-muted">€{art.price.toLocaleString()}</p>
                </div>

                {/* Status toggle */}
                <div className="hidden sm:flex col-span-2 items-center gap-2">
                  <button onClick={() => toggleStatus(art.id)}
                    className={`text-label uppercase tracking-widest transition-colors ${
                      art.status === 'Available' ? 'text-sage hover:text-sageDark' : 'text-muted hover:text-charcoal'
                    }`}>
                    {art.status}
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1">
                  <button onClick={() => { setEditTarget(art); setMode('edit'); }}
                    className="p-1.5 text-muted hover:text-terracotta transition-colors" title="Edit">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDelConfirm(art.id)}
                    className="p-1.5 text-muted hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Delete confirmation */}
                <AnimatePresence>
                  {delConfirm === art.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="col-span-12 overflow-hidden"
                    >
                      <div className="flex items-center gap-4 py-3 border-t border-red-200/50 mt-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-xs text-charcoal/70 flex-1">
                          Delete "{art.title}"? This cannot be undone.
                        </p>
                        <button onClick={() => handleDelete(art.id)}
                          className="text-xs font-sans uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors">
                          Delete
                        </button>
                        <button onClick={() => setDelConfirm(null)}
                          className="text-xs font-sans uppercase tracking-widest text-muted hover:text-charcoal transition-colors">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted font-serif italic">No artworks found.</div>
          )}
        </div>
      )}
    </div>
  );
}
