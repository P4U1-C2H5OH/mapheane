import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Save, X, GripVertical,
  Calendar, MapPin, Star,
} from 'lucide-react';
import { EventType } from '../../data/events';
import { artworks } from '../../data/artworks';
import { ImageUpload } from './ImageUpload';
import { supabase } from '../../lib/supabase';

// Supabase-backed event — id is UUID string
interface DbEvent {
  id: string;
  title: string;
  subtitle?: string;
  type: EventType;
  status: 'upcoming' | 'ongoing' | 'past';
  description: string;
  theme?: string;
  location: { venue: string; address: string; city: string; country: string };
  schedule: { startDate: string; endDate: string; openingReception?: string; hours: Record<string, string> };
  featured: boolean;
  images: string[];
  highlights: string[];
  tags: string[];
  ticketInfo?: { price: string; required: boolean; url?: string };
  contact?: { email?: string; phone?: string; website?: string };
  artworks?: string[];
}

function mapRow(row: Record<string, unknown>): DbEvent {
  const loc  = (row.location_data  as DbEvent['location']  | null) ?? { venue: '', address: '', city: '', country: '' };
  const sched = (row.schedule_data as DbEvent['schedule']  | null) ?? { startDate: '', endDate: '', hours: {} };
  return {
    id:          row.id as string,
    title:       (row.title       as string) ?? '',
    subtitle:    (row.subtitle    as string | undefined) ?? undefined,
    type:        ((row.type ?? 'exhibition') as EventType),
    status:      ((row.status ?? 'upcoming') as DbEvent['status']),
    description: (row.description as string) ?? '',
    theme:       (row.theme       as string | undefined) ?? undefined,
    featured:    !!(row.featured  as boolean | undefined),
    images:      Array.isArray(row.images)     ? (row.images     as string[])   : ['/artportfolio.jpg'],
    highlights:  Array.isArray(row.highlights) ? (row.highlights as string[])   : [],
    tags:        Array.isArray(row.tags)        ? (row.tags       as string[])   : [],
    artworks:    Array.isArray(row.artworks)    ? (row.artworks   as string[])   : [],
    ticketInfo:  (row.ticket_info  as DbEvent['ticketInfo']  | null) ?? undefined,
    contact:     (row.contact_data as DbEvent['contact']     | null) ?? undefined,
    location:    loc,
    schedule:    sched,
  };
}

const getTypeColor = (type: EventType): string => ({
  exhibition: 'bg-terracotta/10 text-terracotta',
  workshop:   'bg-sage/10 text-sage',
  talk:       'bg-clay/10 text-clay',
  fair:       'bg-gold/10 text-gold',
  private:    'bg-charcoal/10 text-charcoal',
}[type]);

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function EventsManager() {
  const [events, setEvents]       = useState<DbEvent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData]   = useState<Partial<DbEvent>>({});
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;

      try {
        if (error) {
          console.error('Failed to load events:', error);
          setError('Unable to load events. Please refresh.');
        } else {
          setEvents((data ?? []).map(mapRow));
        }
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
    return () => { active = false; };
  }, []);

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: '', subtitle: '', type: 'exhibition', status: 'upcoming',
      description: '', theme: '', featured: false,
      location: { venue: '', address: '', city: '', country: '' },
      schedule: { startDate: '', endDate: '', hours: {} },
      images: ['/artportfolio.jpg'], highlights: [], tags: [],
    });
  };

  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.description?.trim() || !formData.location?.venue?.trim() || !formData.location?.city?.trim() || !formData.location?.country?.trim() || !formData.schedule?.startDate || !formData.schedule?.endDate) {
      alert('Please provide all required fields: title, description, venue, city, country, and dates.');
      return;
    }

    setSaving(true);
    setError(null);
    const payload = {
      title:         formData.title,
      subtitle:      formData.subtitle     ?? null,
      type:          formData.type         ?? 'exhibition',
      status:        formData.status       ?? 'upcoming',
      description:   formData.description  ?? '',
      theme:         formData.theme        ?? null,
      featured:      formData.featured     ?? false,
      images:        formData.images       ?? ['/artportfolio.jpg'],
      highlights:    formData.highlights   ?? [],
      tags:          formData.tags         ?? [],
      artworks:      formData.artworks     ?? [],
      location_data: formData.location     ?? { venue: '', address: '', city: '', country: '' },
      schedule_data: formData.schedule     ?? { startDate: '', endDate: '', hours: {} },
      ticket_info:   formData.ticketInfo   ?? null,
      contact_data:  formData.contact      ?? null,
    };

    try {
      if (isCreating) {
        const { data, error } = await supabase.from('events').insert(payload).select().single();
        if (error) throw error;
        if (data) setEvents(prev => [mapRow(data), ...prev]);
        setIsCreating(false);
      } else if (editingId) {
        const { error } = await supabase.from('events').update(payload).eq('id', editingId);
        if (error) throw error;
        setEvents(prev => prev.map(e => e.id === editingId ? { ...e, ...formData } as DbEvent : e));
        setEditingId(null);
      }
      setFormData({});
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Unable to save the event right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: DbEvent) => {
    setEditingId(event.id);
    setFormData(event);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Unable to delete the event. Please try again.');
    }
  };

  const handleCancel = () => { setIsCreating(false); setEditingId(null); setFormData({}); };

  const toggleFeatured = async (id: string) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const featured = !ev.featured;
    try {
      const { error } = await supabase.from('events').update({ featured }).eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.map(e => e.id === id ? { ...e, featured } : e));
    } catch (error) {
      console.error('Failed to update featured status:', error);
      alert('Unable to update event status. Please try again.');
    }
  };

  const isEditing = isCreating || editingId !== null;

  return (
    <div className="space-y-4 lg:space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs lg:text-sm text-muted">{events.length} total events</p>
        </div>
        {!isEditing && (
          <button onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-gold to-terracotta text-white hover:shadow-lg transition-all text-sm lg:text-base w-full sm:w-auto">
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* Editor Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-charcoal/10 shadow-lg overflow-hidden"
          >
            <div className="p-4 lg:p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h3 className="font-serif text-2xl lg:text-3xl text-charcoal">
                  {isCreating ? 'Create New Event' : 'Edit Event'}
                </h3>
                <button onClick={handleCancel} className="text-muted hover:text-charcoal transition-colors p-2 flex-shrink-0">
                  <X className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
              </div>

              <div className="space-y-6 lg:space-y-8">
                {/* Basic Info */}
                <div>
                  <h4 className="text-xs lg:text-sm uppercase tracking-wider text-muted font-medium mb-4 flex items-center gap-2">
                    <Calendar className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" /> Event Details
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-charcoal mb-2">Event Title *</label>
                      <input type="text" value={formData.title || ''}
                        onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-base lg:text-lg"
                        placeholder="e.g., Terre et Lumière" />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-charcoal mb-2">Subtitle</label>
                      <input type="text" value={formData.subtitle || ''}
                        onChange={e => setFormData(f => ({ ...f, subtitle: e.target.value }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base"
                        placeholder="e.g., Clay and Light: A Dialogue" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Event Type *</label>
                      <select value={formData.type || 'exhibition'}
                        onChange={e => setFormData(f => ({ ...f, type: e.target.value as EventType }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base">
                        <option value="exhibition">Exhibition</option>
                        <option value="workshop">Workshop</option>
                        <option value="talk">Artist Talk</option>
                        <option value="fair">Art Fair</option>
                        <option value="private">Private Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Status</label>
                      <select value={formData.status || 'upcoming'}
                        onChange={e => setFormData(f => ({ ...f, status: e.target.value as DbEvent['status'] }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base">
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="past">Past</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Start Date *</label>
                      <input type="date" value={formData.schedule?.startDate || ''}
                        onChange={e => setFormData(f => ({ ...f, schedule: { ...f.schedule!, startDate: e.target.value } }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">End Date *</label>
                      <input type="date" value={formData.schedule?.endDate || ''}
                        onChange={e => setFormData(f => ({ ...f, schedule: { ...f.schedule!, endDate: e.target.value } }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base" />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="text-xs lg:text-sm uppercase tracking-wider text-muted font-medium mb-4 flex items-center gap-2">
                    <MapPin className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" /> Location
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-charcoal mb-2">Venue Name *</label>
                      <input type="text" value={formData.location?.venue || ''}
                        onChange={e => setFormData(f => ({ ...f, location: { ...f.location!, venue: e.target.value } }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base"
                        placeholder="e.g., Galerie Mondapart" />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-charcoal mb-2">Address</label>
                      <input type="text" value={formData.location?.address || ''}
                        onChange={e => setFormData(f => ({ ...f, location: { ...f.location!, address: e.target.value } }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base"
                        placeholder="Street address" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">City *</label>
                      <input type="text" value={formData.location?.city || ''}
                        onChange={e => setFormData(f => ({ ...f, location: { ...f.location!, city: e.target.value } }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base"
                        placeholder="City" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Country *</label>
                      <input type="text" value={formData.location?.country || ''}
                        onChange={e => setFormData(f => ({ ...f, location: { ...f.location!, country: e.target.value } }))}
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base"
                        placeholder="Country" />
                    </div>
                  </div>
                </div>

                {/* Description & Theme */}
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Description *</label>
                    <textarea value={formData.description || ''}
                      onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                      rows={6}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none resize-none text-sm lg:text-base"
                      placeholder="Describe the event in detail..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Theme / Concept</label>
                    <textarea value={formData.theme || ''}
                      onChange={e => setFormData(f => ({ ...f, theme: e.target.value }))}
                      rows={3}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none resize-none text-sm lg:text-base"
                      placeholder="What does this event explore?" />
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-charcoal">
                      Highlights <span className="text-muted font-normal">(shown as bullet points on event page)</span>
                    </label>
                    <button type="button"
                      onClick={() => setFormData(f => ({ ...f, highlights: [...(f.highlights || []), ''] }))}
                      className="text-xs font-sans uppercase tracking-widest text-terracotta hover:text-terracottaDark transition-colors">
                      + Add highlight
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.highlights || []).map((h, i) => (
                      <div key={i} className="flex gap-2">
                        <input type="text" value={h}
                          onChange={e => {
                            const updated = [...(formData.highlights || [])];
                            updated[i] = e.target.value;
                            setFormData(f => ({ ...f, highlights: updated }));
                          }}
                          className="flex-1 px-3 py-2 border border-charcoal/20 focus:border-terracotta focus:outline-none text-sm"
                          placeholder={`Highlight ${i + 1}`} />
                        <button type="button"
                          onClick={() => setFormData(f => ({ ...f, highlights: (f.highlights || []).filter((_, j) => j !== i) }))}
                          className="p-2 text-muted hover:text-red-400 transition-colors">✕</button>
                      </div>
                    ))}
                    {!(formData.highlights?.length) && (
                      <p className="text-xs text-muted italic">No highlights yet — click "+ Add highlight"</p>
                    )}
                  </div>
                </div>

                {/* Opening Reception + Hours */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Opening Reception (optional)</label>
                    <input type="datetime-local"
                      value={formData.schedule?.openingReception?.slice(0, 16) || ''}
                      onChange={e => setFormData(f => ({ ...f, schedule: { ...f.schedule!, openingReception: e.target.value } }))}
                      className="w-full px-3 py-2 border border-charcoal/20 focus:border-terracotta focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Gallery Hours <span className="text-muted font-normal">(one line per day range)</span>
                    </label>
                    <textarea
                      value={Object.entries(formData.schedule?.hours || {}).map(([d, h]) => `${d}: ${h}`).join('\n')}
                      onChange={e => {
                        const hours: Record<string, string> = {};
                        e.target.value.split('\n').forEach(line => {
                          const [day, ...rest] = line.split(':');
                          if (day && rest.length) hours[day.trim()] = rest.join(':').trim();
                        });
                        setFormData(f => ({ ...f, schedule: { ...f.schedule!, hours } }));
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-charcoal/20 focus:border-terracotta focus:outline-none resize-none text-sm font-mono"
                      placeholder={"Tue–Sat: 11am–7pm\nSun: 2pm–6pm"} />
                  </div>
                </div>

                {/* Ticket Info */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-3">Ticket / RSVP</label>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted mb-1">Price (e.g. "Free" or "R150")</label>
                      <input type="text" value={formData.ticketInfo?.price || ''}
                        onChange={e => setFormData(f => ({ ...f, ticketInfo: { ...f.ticketInfo!, price: e.target.value, required: f.ticketInfo?.required ?? false } }))}
                        className="w-full px-3 py-2 border border-charcoal/20 focus:border-terracotta focus:outline-none text-sm"
                        placeholder="Free" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">Ticket / RSVP URL</label>
                      <input type="url" value={formData.ticketInfo?.url || ''}
                        onChange={e => setFormData(f => ({ ...f, ticketInfo: { ...f.ticketInfo!, url: e.target.value, price: f.ticketInfo?.price || 'Free', required: f.ticketInfo?.required ?? false } }))}
                        className="w-full px-3 py-2 border border-charcoal/20 focus:border-terracotta focus:outline-none text-sm"
                        placeholder="https://eventbrite.com/..." />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.ticketInfo?.required ?? false}
                          onChange={e => setFormData(f => ({ ...f, ticketInfo: { ...f.ticketInfo!, required: e.target.checked, price: f.ticketInfo?.price || 'Free' } }))}
                          className="w-4 h-4" />
                        <span className="text-sm text-charcoal">Ticket required</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-3">Event Contact (optional)</label>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted mb-1">Email</label>
                      <input type="email" value={formData.contact?.email || ''}
                        onChange={e => setFormData(f => ({ ...f, contact: { ...f.contact, email: e.target.value } }))}
                        className="w-full px-3 py-2 border border-charcoal/20 focus:border-terracotta focus:outline-none text-sm"
                        placeholder="gallery@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">Phone</label>
                      <input type="tel" value={formData.contact?.phone || ''}
                        onChange={e => setFormData(f => ({ ...f, contact: { ...f.contact, phone: e.target.value } }))}
                        className="w-full px-3 py-2 border border-charcoal/20 focus:border-terracotta focus:outline-none text-sm"
                        placeholder="+33 1 23 45 67 89" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">Website</label>
                      <input type="url" value={formData.contact?.website || ''}
                        onChange={e => setFormData(f => ({ ...f, contact: { ...f.contact, website: e.target.value } }))}
                        className="w-full px-3 py-2 border border-charcoal/20 focus:border-terracotta focus:outline-none text-sm"
                        placeholder="https://gallery.com" />
                    </div>
                  </div>
                </div>

                {/* Tags & Featured */}
                <div className="grid grid-cols-1 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Tags</label>
                    <input type="text"
                      value={(formData.tags || []).join(', ')}
                      onChange={e => setFormData(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                      className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-charcoal/20 focus:border-gold focus:outline-none text-sm lg:text-base"
                      placeholder="exhibition, paris, contemporary (comma-separated)" />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.featured || false}
                        onChange={e => setFormData(f => ({ ...f, featured: e.target.checked }))}
                        className="w-5 h-5 text-gold" />
                      <span className="text-sm font-medium text-charcoal flex items-center gap-2">
                        <Star className="w-4 h-4 text-gold flex-shrink-0" /> Featured Event
                      </span>
                    </label>
                  </div>

                  {formData.featured && (
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Featured Artworks (Select artworks to showcase)</label>
                      <div className="border border-charcoal/20 p-4 max-h-64 overflow-y-auto">
                        <div className="space-y-2">
                          {artworks.map(artwork => (
                            <label key={artwork.id} className="flex items-center gap-3 p-2 hover:bg-charcoal/5 cursor-pointer">
                              <input type="checkbox"
                                checked={(formData.artworks || []).includes(artwork.id)}
                                onChange={e => {
                                  const curr = formData.artworks || [];
                                  setFormData(f => ({ ...f, artworks: e.target.checked ? [...curr, artwork.id] : curr.filter(id => id !== artwork.id) }));
                                }}
                                className="w-4 h-4 text-gold" />
                              <img src={artwork.images[0]} alt={artwork.title}
                                className="w-10 h-10 object-cover flex-shrink-0"
                                style={{ objectPosition: artwork.cropPosition }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-charcoal truncate">{artwork.title}</p>
                                <p className="text-xs text-muted">{artwork.medium}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted mt-2">{(formData.artworks || []).length} artwork(s) selected</p>
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <ImageUpload images={formData.images || []}
                    onChange={images => setFormData(f => ({ ...f, images }))}
                    maxImages={5} label="Event Images" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-charcoal/10">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 lg:px-8 py-3 bg-gradient-to-r from-gold to-terracotta text-white hover:shadow-lg transition-all text-sm lg:text-base disabled:opacity-60">
                  {saving
                    ? <div className="w-4 h-4 border border-white/50 border-t-white rounded-full animate-spin" />
                    : <Save className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />}
                  {isCreating ? 'Create Event' : 'Save Changes'}
                </button>
                <button onClick={handleCancel}
                  className="px-6 lg:px-8 py-3 border-2 border-charcoal/20 text-charcoal hover:border-charcoal/40 transition-colors text-sm lg:text-base">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events List */}
      <div className="bg-white border border-charcoal/10 shadow-sm">
        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-charcoal/10 flex items-center justify-between">
          <h3 className="font-serif text-lg lg:text-2xl text-charcoal">Events</h3>
          <p className="text-xs lg:text-sm text-muted hidden sm:block">Drag to reorder</p>
        </div>

        {loading && (
          <div className="px-6 py-12 text-center text-muted font-serif italic">Loading events…</div>
        )}

        {!loading && (
          <Reorder.Group axis="y" values={events} onReorder={setEvents} className="divide-y divide-charcoal/10">
            {events.map(event => (
              <Reorder.Item key={event.id} value={event} className="overflow-hidden">
                <div className="px-3 sm:px-4 lg:px-6 py-4 lg:py-5 hover:bg-charcoal/5 transition-colors group">
                  <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 overflow-hidden">
                    <button className="hidden sm:flex cursor-grab active:cursor-grabbing text-muted hover:text-charcoal transition-colors mt-1 flex-shrink-0">
                      <GripVertical className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-start gap-2 mb-2 overflow-hidden">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="font-serif text-base sm:text-lg lg:text-xl text-charcoal truncate flex-shrink">{event.title}</h4>
                            {event.featured && <Star className="w-4 h-4 text-gold fill-gold flex-shrink-0" />}
                          </div>
                          {event.subtitle && <p className="text-xs sm:text-sm text-muted italic truncate">{event.subtitle}</p>}
                        </div>
                        <span className={`px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium uppercase tracking-wider whitespace-nowrap ${getTypeColor(event.type)} flex-shrink-0`}>
                          {event.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-muted mb-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {formatDate(event.schedule.startDate)} – {formatDate(event.schedule.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{event.location.city}, {event.location.country}</span>
                        </div>
                      </div>
                      <div className={`inline-block px-2 py-0.5 text-[10px] sm:text-xs font-medium ${
                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'ongoing'  ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>{event.status}</div>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => toggleFeatured(event.id)}
                        className="p-1.5 hover:bg-gold/10 transition-colors"
                        title={event.featured ? 'Remove featured' : 'Mark featured'}>
                        <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${event.featured ? 'text-gold fill-gold' : 'text-muted'}`} />
                      </button>
                      <button onClick={() => handleEdit(event)} className="p-1.5 hover:bg-charcoal/10 transition-colors">
                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-charcoal" />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="p-1.5 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </Reorder.Item>
            ))}
            {events.length === 0 && (
              <div className="px-6 py-12 text-center text-muted font-serif italic">No events yet.</div>
            )}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
