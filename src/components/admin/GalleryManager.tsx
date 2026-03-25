import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit3, Trash2, X, Check, Upload, Link as LinkIcon,
  Save, AlertCircle, ToggleLeft, ToggleRight, Loader,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type FormMode = 'list' | 'add' | 'edit';
type ImageTab = 'upload' | 'url';

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MEDIUMS = ['Painting', 'Drawing', 'Clay Model'] as const;

const ZAR_RATE = 18;

const DIMENSION_PRESETS = [
  { label: 'A5',     value: '14.8 × 21 cm' },
  { label: 'A4',     value: '21 × 29.7 cm' },
  { label: 'A3',     value: '29.7 × 42 cm' },
  { label: 'A2',     value: '42 × 59.4 cm' },
  { label: 'A1',     value: '59.4 × 84.1 cm' },
  { label: 'A0',     value: '84.1 × 118.9 cm' },
  { label: '50×70',  value: '50 × 70 cm' },
  { label: '60×80',  value: '60 × 80 cm' },
  { label: '60×90',  value: '60 × 90 cm' },
  { label: '100×100',value: '100 × 100 cm' },
  { label: 'Custom', value: 'custom' },
];

interface GalleryArtwork {
  id: string;
  title: string;
  dimensions: string;
  technique: string;
  medium: 'Painting' | 'Drawing' | 'Clay Model';
  status: 'Available' | 'Sold';
  cropPosition: string;
  offsetClass: string;
  price: number; // EUR
  description: string;
  images: string[];
  year?: number;
  statement?: string;
  video?: string;
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
    images:       Array.isArray(row.images) ? (row.images as string[]) : [],
    year:         (row.year as number | undefined) ?? undefined,
    statement:    (row.statement as string | undefined) ?? undefined,
    video:        (row.video     as string | undefined) ?? undefined,
  };
}

function Field({ label, value, onChange, type = 'text', placeholder, required, hint, error }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; hint?: string; error?: string;
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
          placeholder={placeholder} rows={4}
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

function ArtworkForm({ initial, onSave, onCancel, isNew }: {
  initial: Partial<GalleryArtwork>;
  onSave: (a: Partial<GalleryArtwork>) => Promise<void>;
  onCancel: () => void;
  isNew: boolean;
}) {
  const zarFromEur = (eur: number) => eur > 0 ? String(Math.round(eur * ZAR_RATE)) : '';
  const isDimensionPreset = (v: string) => DIMENSION_PRESETS.some(p => p.value === v && p.value !== 'custom');

  const [form, setForm] = useState({
    title:          initial.title       ?? '',
    technique:      initial.technique   ?? '',
    priceZar:       zarFromEur(initial.price ?? 0),
    year:           String(initial.year ?? new Date().getFullYear()),
    description:    initial.description ?? '',
    medium:         initial.medium      ?? 'Painting' as GalleryArtwork['medium'],
    status:         initial.status      ?? 'Available' as GalleryArtwork['status'],
    cropPosition:   initial.cropPosition ?? '50% 50%',
    dimensionPreset: isDimensionPreset(initial.dimensions ?? '') ? (initial.dimensions ?? '') : (initial.dimensions ? 'custom' : ''),
    customDimension: isDimensionPreset(initial.dimensions ?? '') ? '' : (initial.dimensions ?? ''),
    images:         initial.images ?? [] as string[],
    statement:      initial.statement ?? '',
    video:          initial.video     ?? '',
    urlInput:       '',
  });

  const [imageTab, setImageTab]   = useState<ImageTab>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');

  const update = (field: string, val: unknown) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
    setSaveError('');
  };

  const dimensions = form.dimensionPreset === 'custom' ? form.customDimension : form.dimensionPreset;
  const priceEur   = form.priceZar ? Number(form.priceZar) / ZAR_RATE : 0;
  const heroImage  = form.images[0] ?? '';

  const uploadFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remaining = 5 - form.images.length;
    const toUpload  = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, remaining);
    if (!toUpload.length) return;
    setUploading(true);
    setUploadErr('');
    try {
      const urls = await Promise.all(toUpload.map(async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', UPLOAD_PRESET);
        fd.append('folder', 'mapheane');
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        return (await res.json()).secure_url as string;
      }));
      update('images', [...form.images, ...urls]);
    } catch {
      setUploadErr('Upload failed — check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    const url = form.urlInput.trim();
    if (!url || form.images.length >= 5) return;
    if (!url.startsWith('http')) { setUploadErr('Enter a valid URL starting with http'); return; }
    update('images', [...form.images, url]);
    update('urlInput', '');
    setUploadErr('');
  };

  const removeImage = (i: number) => update('images', form.images.filter((_, idx) => idx !== i));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())     e.title     = 'Title is required';
    if (!form.technique.trim()) e.technique = 'Technique is required';
    if (!dimensions.trim())     e.dimensions = 'Dimensions required';
    if (!form.priceZar || isNaN(Number(form.priceZar)) || Number(form.priceZar) <= 0)
                                e.priceZar  = 'Enter a valid ZAR price';
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
        dimensions,
        medium:       form.medium as GalleryArtwork['medium'],
        year:         Number(form.year),
        description:  form.description,
        price:        priceEur,
        status:       form.status as GalleryArtwork['status'],
        cropPosition: form.cropPosition,
        images:       form.images,
        statement:    form.statement || undefined,
        video:        form.video     || undefined,
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
      <div className="flex items-start justify-between mb-8 pb-5 border-b border-charcoal/8">
        <div>
          <span className="text-label uppercase tracking-[0.28em] text-terracotta block mb-1">
            {isNew ? 'New Artwork' : 'Edit Artwork'}
          </span>
          <h3 className="font-serif italic text-2xl text-charcoal" style={{ letterSpacing: '-0.01em' }}>
            {form.title || (isNew ? 'Add to collection' : 'Untitled')}
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
            {saving ? <div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" /> :
             saved   ? <><Check className="w-3.5 h-3.5" /> Saved</> :
                       <><Save className="w-3.5 h-3.5" /> Save artwork</>}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

        {/* ── LEFT: Details ── */}
        <div className="space-y-6">

          {/* Title + Technique */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Title" value={form.title} onChange={v => update('title', v)}
              required placeholder="Artwork title" error={errors.title} />
            <Field label="Technique" value={form.technique} onChange={v => update('technique', v)}
              required placeholder="e.g. Mixed media on resin canvas" error={errors.technique} />
          </div>

          {/* Dimensions */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-label uppercase tracking-widest text-muted">
                Dimensions<span className="text-terracotta ml-0.5">*</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {DIMENSION_PRESETS.map(p => (
                <button key={p.label} type="button"
                  onClick={() => update('dimensionPreset', p.value)}
                  className={`px-3 py-1.5 text-xs font-sans border transition-all ${
                    form.dimensionPreset === p.value
                      ? 'bg-charcoal text-background border-charcoal'
                      : 'border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
            {form.dimensionPreset === 'custom' && (
              <input value={form.customDimension} onChange={e => update('customDimension', e.target.value)}
                placeholder="e.g. 97 × 130 cm"
                className="w-full bg-transparent border border-charcoal/12 px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
            )}
            {!form.dimensionPreset && (
              <p className="text-xs text-muted/50 mt-1">Select a preset or choose Custom above</p>
            )}
            {errors.dimensions && <p className="text-xs text-red-400 mt-1">{errors.dimensions}</p>}
          </div>

          {/* Price + Year */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-label uppercase tracking-widest text-muted">
                  Price (ZAR)<span className="text-terracotta ml-0.5">*</span>
                </label>
                {priceEur > 0 && (
                  <span className="text-xs text-muted/50">≈ €{priceEur.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">R</span>
                <input type="number" value={form.priceZar} onChange={e => update('priceZar', e.target.value)}
                  placeholder="18 000"
                  className={`w-full bg-transparent border pl-7 pr-3 py-2 text-sm text-charcoal focus:outline-none transition-colors placeholder:text-charcoal/25 ${
                    errors.priceZar ? 'border-red-300' : 'border-charcoal/12 focus:border-terracotta/50'
                  }`} />
              </div>
              {errors.priceZar && <p className="text-xs text-red-400 mt-1">{errors.priceZar}</p>}
            </div>
            <Field label="Year" type="number" value={form.year} onChange={v => update('year', v)}
              placeholder={String(new Date().getFullYear())} />
          </div>

          {/* Medium */}
          <div>
            <p className="text-label uppercase tracking-widest text-muted mb-2">Medium</p>
            <div className="flex gap-2 flex-wrap">
              {MEDIUMS.map(m => (
                <button key={m} type="button" onClick={() => update('medium', m)}
                  className={`px-4 py-2 text-xs font-sans border transition-all ${
                    form.medium === m
                      ? 'bg-charcoal text-background border-charcoal'
                      : 'border-charcoal/15 text-muted hover:border-charcoal/30 hover:text-charcoal'
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <Field label="Description" type="textarea" value={form.description}
            onChange={v => update('description', v)}
            placeholder="Describe this work — materials, process, meaning…"
            hint="Shown on artwork page" />

          {/* Artist's Statement */}
          <Field label="Artist's Statement" type="textarea" value={form.statement}
            onChange={v => update('statement', v)}
            placeholder="Your personal note on this work — what it took, what it means…"
            hint="Optional · shown below description" />

          {/* Video URL */}
          <Field label="Video URL" value={form.video}
            onChange={v => update('video', v)}
            placeholder="https://youtube.com/watch?v=… or direct MP4 URL"
            hint="Optional · artist talk or process video" />

          {/* Availability */}
          <div className="flex items-center justify-between p-4 border border-charcoal/8 bg-parchment/30">
            <div>
              <p className="text-sm font-sans text-charcoal mb-0.5">Availability</p>
              <p className="text-xs text-muted">{form.status === 'Available' ? 'Listed for sale' : 'Marked as sold'}</p>
            </div>
            <button type="button"
              onClick={() => update('status', form.status === 'Available' ? 'Sold' : 'Available')}
              className={`transition-colors ${form.status === 'Available' ? 'text-sage' : 'text-muted/40'}`}>
              {form.status === 'Available' ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9" />}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Images ── */}
        <div className="space-y-5">

          {/* Hero preview */}
          <div>
            <p className="text-label uppercase tracking-widest text-muted mb-2">Image Preview</p>
            <div className="aspect-[3/4] bg-parchment overflow-hidden relative border border-charcoal/8">
              {heroImage ? (
                <img src={heroImage} alt="Preview"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: form.cropPosition }}
                  onError={e => { (e.target as HTMLImageElement).src = ''; }} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted/40">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">No image yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload tabs */}
          <div className="border border-charcoal/8">
            <div className="flex border-b border-charcoal/8">
              {([['upload', Upload, 'Upload'], ['url', LinkIcon, 'Paste URL']] as const).map(([tab, Icon, lbl]) => (
                <button key={tab} type="button" onClick={() => setImageTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-sans uppercase tracking-widest transition-colors ${
                    imageTab === tab
                      ? 'bg-charcoal text-background'
                      : 'text-muted hover:text-charcoal hover:bg-parchment/40'
                  }`}>
                  <Icon className="w-3.5 h-3.5" /> {lbl}
                </button>
              ))}
            </div>

            <div className="p-4">
              {imageTab === 'upload' && (
                <div>
                  <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded p-6 cursor-pointer transition-all ${
                    uploading ? 'opacity-60 cursor-wait border-charcoal/15' : 'border-charcoal/15 hover:border-terracotta/40 hover:bg-terracotta/2'
                  }`}>
                    <input type="file" accept="image/*" multiple className="hidden"
                      disabled={uploading || form.images.length >= 5}
                      onChange={e => uploadFiles(e.target.files)} />
                    {uploading ? (
                      <><Loader className="w-6 h-6 text-terracotta animate-spin mb-2" /><p className="text-xs text-muted">Uploading…</p></>
                    ) : (
                      <><Upload className="w-6 h-6 text-muted mb-2" />
                      <p className="text-xs text-charcoal text-center"><span className="text-terracotta font-medium">Click to select</span> or drag & drop</p>
                      <p className="text-xs text-muted mt-1">PNG, JPG, WebP · up to {5 - form.images.length} more</p></>
                    )}
                  </label>
                </div>
              )}

              {imageTab === 'url' && (
                <div className="flex gap-2">
                  <input value={form.urlInput} onChange={e => update('urlInput', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addUrl()}
                    placeholder="https://res.cloudinary.com/…"
                    className="flex-1 bg-transparent border border-charcoal/12 px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-terracotta/50 transition-colors placeholder:text-charcoal/25" />
                  <button type="button" onClick={addUrl}
                    className="px-3 py-2 bg-terracotta text-background text-xs hover:bg-terracottaDark transition-colors">
                    Add
                  </button>
                </div>
              )}

              {uploadErr && <p className="text-xs text-red-400 mt-2">{uploadErr}</p>}
            </div>
          </div>

          {/* Image thumbnails */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {form.images.map((img, i) => (
                <div key={img} className="relative group aspect-square">
                  <img src={img} alt={`Image ${i + 1}`}
                    className="w-full h-full object-cover border border-charcoal/8" />
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-terracotta/80 text-background text-[9px] text-center py-0.5 font-sans uppercase tracking-wider">
                      Primary
                    </div>
                  )}
                  <button onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-charcoal/70 text-background rounded-full items-center justify-center hidden group-hover:flex transition-all hover:bg-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Crop position */}
          <div>
            <p className="text-label uppercase tracking-widest text-muted mb-2">Focal point</p>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[['50% 15%', 'Top'], ['50% 50%', 'Centre'], ['50% 85%', 'Bottom'], ['30% 50%', 'Left']].map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => update('cropPosition', val)}
                  className={`text-xs py-1.5 border transition-all ${
                    form.cropPosition === val
                      ? 'bg-charcoal text-background border-charcoal'
                      : 'border-charcoal/15 text-muted hover:border-charcoal/25'
                  }`}>
                  {lbl}
                </button>
              ))}
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
        if (error) setLoadError('Failed to load artworks.');
        else setArtworks((data ?? []).map(mapRow));
        setLoading(false);
      });
  }, []);

  const filtered = artworks.filter(a => filter === 'all' || a.status === filter);

  const handleAdd = async (data: Partial<GalleryArtwork>) => {
    const { data: row, error } = await supabase
      .from('artworks')
      .insert({
        title: data.title, technique: data.technique, dimensions: data.dimensions,
        medium: data.medium, year: data.year ?? null, description: data.description ?? '',
        price_eur: data.price, status: data.status ?? 'Available',
        crop_position: data.cropPosition ?? '50% 50%',
        offset_class: data.offsetClass ?? 'mt-0',
        images: data.images ?? [],
        statement: data.statement ?? null,
        video: data.video ?? null,
      })
      .select().single();
    if (error) throw new Error('Failed to save artwork.');
    setArtworks(prev => [mapRow(row), ...prev]);
    setMode('list');
  };

  const handleEdit = async (data: Partial<GalleryArtwork>) => {
    const { error } = await supabase
      .from('artworks')
      .update({
        title: data.title, technique: data.technique, dimensions: data.dimensions,
        medium: data.medium, year: data.year ?? null, description: data.description ?? '',
        price_eur: data.price, status: data.status ?? 'Available',
        crop_position: data.cropPosition ?? '50% 50%',
        offset_class: data.offsetClass ?? 'mt-0',
        images: data.images ?? [],
        statement: data.statement ?? null,
        video: data.video ?? null,
      })
      .eq('id', data.id!);
    if (error) throw new Error('Failed to update artwork.');
    setArtworks(prev => prev.map(a => a.id === data.id ? { ...a, ...data } as GalleryArtwork : a));
    setMode('list');
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (!error) { setArtworks(prev => prev.filter(a => a.id !== id)); setDelConfirm(null); }
  };

  const toggleStatus = async (id: string) => {
    const art = artworks.find(a => a.id === id);
    if (!art) return;
    const next = art.status === 'Available' ? 'Sold' : 'Available';
    const { error } = await supabase.from('artworks').update({ status: next }).eq('id', id);
    if (!error) setArtworks(prev => prev.map(a => a.id === id ? { ...a, status: next } : a));
  };

  if (mode === 'add') return (
    <div className="max-w-5xl">
      <ArtworkForm initial={{}} onSave={handleAdd} onCancel={() => setMode('list')} isNew />
    </div>
  );

  if (mode === 'edit' && editTarget) return (
    <div className="max-w-5xl">
      <ArtworkForm initial={editTarget} onSave={handleEdit}
        onCancel={() => { setMode('list'); setEditTarget(null); }} isNew={false} />
    </div>
  );

  return (
    <div className="space-y-5 max-w-5xl">

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

      {loading && <div className="py-16 text-center text-muted font-serif italic">Loading artworks…</div>}
      {loadError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {loadError}
        </div>
      )}

      {!loading && !loadError && (
        <div className="space-y-0 border border-charcoal/8">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2.5 bg-parchment/40 border-b border-charcoal/8">
            <div className="col-span-5"><p className="text-label uppercase tracking-widest text-muted">Work</p></div>
            <div className="col-span-2"><p className="text-label uppercase tracking-widest text-muted">Medium</p></div>
            <div className="col-span-2"><p className="text-label uppercase tracking-widest text-muted">Price</p></div>
            <div className="col-span-2"><p className="text-label uppercase tracking-widest text-muted">Status</p></div>
            <div className="col-span-1" />
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.map(art => (
              <motion.div key={art.id} layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-12 gap-3 sm:gap-4 px-4 py-4 border-b border-charcoal/6 last:border-0 hover:bg-parchment/20 transition-colors items-center"
              >
                <div className="col-span-9 sm:col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-12 h-14 overflow-hidden bg-parchment flex-shrink-0">
                    {art.images[0] ? (
                      <img src={art.images[0]} alt={art.title} draggable={false}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: art.cropPosition }} />
                    ) : (
                      <div className="w-full h-full bg-parchment" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-sm italic text-charcoal truncate">{art.title}</p>
                    <p className="text-xs text-muted truncate">{art.technique}</p>
                    <p className="text-xs text-muted/60">{art.dimensions}</p>
                  </div>
                </div>

                <div className="hidden sm:block col-span-2">
                  <span className="text-xs font-sans text-muted">{art.medium}</span>
                </div>

                <div className="hidden sm:block col-span-2">
                  <p className="text-sm text-charcoal">R {(art.price * ZAR_RATE).toLocaleString()}</p>
                  <p className="text-xs text-muted">€{art.price.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
                </div>

                <div className="hidden sm:flex col-span-2 items-center">
                  <button onClick={() => toggleStatus(art.id)}
                    className={`text-label uppercase tracking-widest transition-colors ${
                      art.status === 'Available' ? 'text-sage hover:text-sage/70' : 'text-muted hover:text-charcoal'
                    }`}>
                    {art.status}
                  </button>
                </div>

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

                <AnimatePresence>
                  {delConfirm === art.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="col-span-12 overflow-hidden">
                      <div className="flex items-center gap-4 py-3 border-t border-red-200/50 mt-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-xs text-charcoal/70 flex-1">Delete "{art.title}"? This cannot be undone.</p>
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
