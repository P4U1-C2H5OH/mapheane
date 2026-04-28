import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Save, X, Heart, Eye, Calendar, Tag as TagIcon, Type, AlignLeft,
} from 'lucide-react';
import { MomentType, MomentMedia } from '../../data/moments';
import { ImageUpload } from './ImageUpload';
import { supabase } from '../../lib/supabase';

interface DbMoment {
  id: string; // UUID
  title: string;
  date: string;
  type: MomentType;
  excerpt: string;
  content: string;
  media: MomentMedia[];
  tags: string[];
  featured: boolean;
  location?: string;
  mood?: string;
}

function mapRow(row: Record<string, unknown>): DbMoment {
  return {
    id:       row.id as string,
    title:    (row.title    as string)  ?? '',
    date:     (row.date     as string)  ?? '',
    type:     ((row.type ?? 'studio') as MomentType),
    excerpt:  (row.excerpt  as string)  ?? '',
    content:  (row.content  as string)  ?? '',
    media:    Array.isArray(row.media)  ? (row.media as MomentMedia[]) : [],
    tags:     Array.isArray(row.tags)   ? (row.tags as string[])       : [],
    featured: !!(row.featured as boolean | undefined),
    location: (row.location as string | undefined) ?? undefined,
    mood:     (row.mood     as string | undefined) ?? undefined,
  };
}

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date';
  value: string;
}

export function MomentsManager() {
  const [moments, setMoments]         = useState<DbMoment[]>([]);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [isCreating, setIsCreating]   = useState(false);
  const [formData, setFormData]       = useState<Partial<DbMoment>>({});
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadMoments() {
      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .order('date', { ascending: false });

      if (!active) return;

      try {
        if (error) {
          console.error('Failed to load moments:', error);
          setError('Unable to load moments. Please refresh.');
        } else {
          setMoments((data ?? []).map(mapRow));
        }
      } finally {
        setLoading(false);
      }
    }

    loadMoments();
    return () => { active = false; };
  }, []);

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: '', date: new Date().toISOString().split('T')[0],
      type: 'studio', excerpt: '', content: '', media: [], tags: [], featured: false,
    });
    setCustomFields([]);
  };

  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      alert('Please provide both a title and content before publishing.');
      return;
    }

    setSaving(true);
    setError(null);
    const payload = {
      title:    formData.title,
      date:     formData.date,
      type:     formData.type,
      excerpt:  formData.excerpt  ?? '',
      content:  formData.content,
      media:    formData.media    ?? [],
      tags:     formData.tags     ?? [],
      featured: formData.featured ?? false,
      location: formData.location ?? null,
      mood:     formData.mood     ?? null,
    };

    try {
      if (isCreating) {
        const { data, error } = await supabase.from('moments').insert(payload).select().single();
        if (error) throw error;
        if (data) setMoments(prev => [mapRow(data), ...prev]);
        setIsCreating(false);
      } else if (editingId) {
        const { error } = await supabase.from('moments').update(payload).eq('id', editingId);
        if (error) throw error;
        setMoments(prev => prev.map(m => m.id === editingId ? { ...m, ...formData } as DbMoment : m));
        setEditingId(null);
      }
      setFormData({});
      setCustomFields([]);
    } catch (error) {
      console.error('Failed to save moment:', error);
      alert('Unable to publish the moment right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (moment: DbMoment) => {
    setEditingId(moment.id);
    setFormData(moment);
    setCustomFields([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this moment? This cannot be undone.')) return;
    const { error } = await supabase.from('moments').delete().eq('id', id);
    if (!error) setMoments(prev => prev.filter(m => m.id !== id));
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({});
    setCustomFields([]);
  };

  const addCustomField = (type: CustomField['type']) => {
    setCustomFields(prev => [...prev, {
      id: Date.now().toString(), label: '', type,
      value: type === 'date' ? new Date().toISOString().split('T')[0] : '',
    }]);
    setShowAddField(false);
  };

  const isEditing = isCreating || editingId !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{moments.length} total moments</p>
        </div>
        {!isEditing && (
          <button onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-sage text-white hover:bg-sage/90 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Create New Moment</span>
          </button>
        )}
      </div>

      {/* Editor Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-charcoal/10 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-2xl text-charcoal">
                  {isCreating ? 'Create New Moment' : 'Edit Moment'}
                </h3>
                <button onClick={handleCancel} className="text-muted hover:text-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Title *</label>
                    <input type="text" value={formData.title || ''}
                      onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none"
                      placeholder="Moment title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Type *</label>
                    <select value={formData.type || 'studio'}
                      onChange={e => setFormData(f => ({ ...f, type: e.target.value as MomentType }))}
                      className="w-full px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none">
                      {(['studio','exhibition','process','travel','inspiration','personal'] as const).map(t => (
                        <option key={t} value={t} className="capitalize">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Date</label>
                    <input type="date" value={formData.date || ''}
                      onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Location</label>
                    <input type="text" value={formData.location || ''}
                      onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                      className="w-full px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none"
                      placeholder="City, Country" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Mood</label>
                    <input type="text" value={formData.mood || ''}
                      onChange={e => setFormData(f => ({ ...f, mood: e.target.value }))}
                      className="w-full px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none"
                      placeholder="e.g., Hopeful, Reflective" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.featured || false}
                        onChange={e => setFormData(f => ({ ...f, featured: e.target.checked }))}
                        className="w-5 h-5 text-sage" />
                      <span className="text-sm font-medium text-charcoal">Featured Moment</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Excerpt</label>
                  <input type="text" value={formData.excerpt || ''}
                    onChange={e => setFormData(f => ({ ...f, excerpt: e.target.value }))}
                    className="w-full px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none"
                    placeholder="Short teaser (20-40 words)" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Content *</label>
                  <textarea value={formData.content || ''}
                    onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none resize-none"
                    placeholder="Tell your story… (300-800 words)" />
                  <p className="text-xs text-muted mt-1">
                    {(formData.content || '').split(' ').filter(Boolean).length} words
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Tags</label>
                  <input type="text"
                    value={(formData.tags || []).join(', ')}
                    onChange={e => setFormData(f => ({
                      ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                    }))}
                    className="w-full px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none"
                    placeholder="studio, process, clay (comma-separated)" />
                </div>

                <div>
                  <ImageUpload
                    images={(formData.media || []).map((m: MomentMedia) => m.url)}
                    onChange={urls => {
                      const existing = (formData.media || []) as MomentMedia[];
                      const media: MomentMedia[] = urls.map(url => {
                        const prev = existing.find(m => m.url === url);
                        return prev ?? { type: 'image', url, alt: formData.title || 'Studio moment', caption: '' };
                      });
                      setFormData(f => ({ ...f, media }));
                    }}
                    maxImages={5}
                    label="Moment Images"
                  />
                </div>

                {/* Custom fields */}
                {customFields.length > 0 && (
                  <div className="border-t border-charcoal/10 pt-6">
                    <h4 className="text-sm uppercase tracking-wider text-muted font-medium mb-4">Custom Fields</h4>
                    <div className="space-y-4">
                      {customFields.map(field => (
                        <div key={field.id} className="flex gap-4 items-start">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <input type="text" value={field.label}
                              onChange={e => setCustomFields(prev => prev.map(f => f.id === field.id ? { ...f, label: e.target.value } : f))}
                              className="px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none"
                              placeholder="Field label" />
                            {field.type === 'textarea' ? (
                              <textarea value={field.value}
                                onChange={e => setCustomFields(prev => prev.map(f => f.id === field.id ? { ...f, value: e.target.value } : f))}
                                className="px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none resize-none"
                                rows={2} placeholder="Field value" />
                            ) : (
                              <input type={field.type} value={field.value}
                                onChange={e => setCustomFields(prev => prev.map(f => f.id === field.id ? { ...f, value: e.target.value } : f))}
                                className="px-4 py-2 border border-charcoal/20 focus:border-sage focus:outline-none"
                                placeholder="Field value" />
                            )}
                          </div>
                          <button onClick={() => setCustomFields(prev => prev.filter(f => f.id !== field.id))}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-charcoal/10 pt-6">
                  {!showAddField ? (
                    <button onClick={() => setShowAddField(true)}
                      className="text-sm text-sage hover:text-sage/80 transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Custom Field
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {([['text','Text',Type],['textarea','Long Text',AlignLeft],['date','Date',Calendar]] as const).map(([type, label, Icon]) => (
                        <button key={type} onClick={() => addCustomField(type)}
                          className="px-4 py-2 bg-charcoal/5 hover:bg-charcoal/10 transition-colors text-sm flex items-center gap-2">
                          <Icon className="w-4 h-4" /> {label}
                        </button>
                      ))}
                      <button onClick={() => setShowAddField(false)} className="px-4 py-2 text-muted hover:text-charcoal transition-colors text-sm">Cancel</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-charcoal/10">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-sage text-white hover:bg-sage/90 transition-colors disabled:opacity-60">
                  {saving
                    ? <div className="w-5 h-5 border border-white/50 border-t-white rounded-full animate-spin" />
                    : <Save className="w-5 h-5" />}
                  {isCreating ? 'Publish Moment' : 'Save Changes'}
                </button>
                <button onClick={handleCancel}
                  className="px-6 py-3 border border-charcoal/20 text-charcoal hover:border-charcoal/40 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moments List */}
      <div className="bg-white border border-charcoal/10">
        <div className="px-6 py-4 border-b border-charcoal/10">
          <h3 className="font-serif text-xl text-charcoal">Published Moments</h3>
        </div>

        {loading && (
          <div className="px-6 py-12 text-center text-muted font-serif italic">Loading moments…</div>
        )}

        <div className="divide-y divide-charcoal/10">
          {moments.map(moment => (
            <div key={moment.id} className="px-6 py-4 hover:bg-charcoal/5 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-serif text-lg text-charcoal">{moment.title}</h4>
                    {moment.featured && (
                      <span className="px-2 py-0.5 bg-terracotta/10 text-terracotta text-xs uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="capitalize">{moment.type}</span>
                    <span>•</span>
                    <span>{moment.date ? new Date(moment.date).toLocaleDateString() : '—'}</span>
                    {moment.location && <><span>•</span><span>{moment.location}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(moment)} className="p-2 hover:bg-charcoal/10 rounded transition-colors">
                    <Edit2 className="w-5 h-5 text-charcoal" />
                  </button>
                  <button onClick={() => handleDelete(moment.id)} className="p-2 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && moments.length === 0 && (
            <div className="px-6 py-12 text-center text-muted font-serif italic">No moments yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
