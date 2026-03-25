import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, MapPin, Clock, Share2, Download,
  ExternalLink, Mail, Phone, Globe, Ticket, Check, Users, Sparkles
} from 'lucide-react';
import { generateICS, generateGoogleCalendarUrl } from '../data/events';
import { useEvents } from '../hooks/useEvents';

interface EventDetailPageProps {
  eventId: string;
  onNavigate: (page: any) => void;
  onSelectEvent: (id: string) => void;
}

export function EventDetailPage({ eventId, onNavigate, onSelectEvent }: EventDetailPageProps) {
  const { events } = useEvents();
  const event = events.find(e => e.id === eventId);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [eventId]);

  if (!event) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-charcoal mb-4">Event Not Found</h1>
          <button
            onClick={() => onNavigate('events')}
            className="text-terracotta hover:underline"
          >
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${event.title} — ${event.location.city}`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleDownloadICS = () => {
    const icsContent = generateICS(event as any);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event as any);
    window.open(url, '_blank');
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      exhibition: 'bg-terracotta',
      workshop: 'bg-sage',
      talk: 'bg-clay',
      fair: 'bg-gold',
      private: 'bg-charcoal'
    };
    return colors[type] || 'bg-charcoal';
  };

  // Get related events (same type, excluding current)
  const relatedEvents = events
    .filter(e => e.type === event.type && e.id !== event.id && e.status === 'upcoming')
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-background min-h-screen w-full pt-32 pb-20 px-6 md:px-12"
    >
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('events')}
          className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-muted hover:text-charcoal transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          All Events
        </button>

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Left: Hero Image */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative aspect-[4/5] overflow-hidden"
            >
              {event.featured && (
                <div className="absolute top-6 right-6 z-20 bg-terracotta text-white px-4 py-2 text-sm tracking-wider uppercase">
                  Featured Event
                </div>
              )}
              <img
                src={event.images?.[0] || '/artportfolio.jpg'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Additional Images */}
            {(event.images?.length ?? 0) > 1 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {event.images.slice(1, 4).map((img, idx) => (
                  <div key={idx} className="aspect-square overflow-hidden">
                    <img
                      src={img}
                      alt={`${event.title} ${idx + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Event Info */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {/* Type Badge */}
              <span className={`${getTypeColor(event.type)} text-white px-4 py-2 text-xs tracking-wider uppercase inline-block mb-6`}>
                {event.type}
              </span>

              <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
                {event.title}
              </h1>

              {event.subtitle && (
                <p className="text-xl text-muted italic mb-8">{event.subtitle}</p>
              )}

              {/* Key Info Card */}
              <div className="bg-white border border-charcoal/10 p-6 space-y-4 mb-8">
                {/* Date */}
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted uppercase tracking-wider mb-1">When</p>
                    <p className="text-charcoal font-medium">
                      {formatDate(event.schedule.startDate)}
                      {event.schedule.endDate !== event.schedule.startDate && (
                        <> - {formatDate(event.schedule.endDate)}</>
                      )}
                    </p>
                    {event.schedule.openingReception && (
                      <p className="text-sm text-muted mt-1">
                        Opening: {formatDate(event.schedule.openingReception)} at {formatTime(event.schedule.openingReception)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 pt-4 border-t border-charcoal/10">
                  <MapPin className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted uppercase tracking-wider mb-1">Where</p>
                    <p className="text-charcoal font-medium">{event.location.venue}</p>
                    <p className="text-muted text-sm">
                      {event.location.address}<br />
                      {event.location.city}, {event.location.country}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4 pt-4 border-t border-charcoal/10">
                  <Clock className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted uppercase tracking-wider mb-2">Hours</p>
                    {Object.entries(event.schedule.hours).map(([days, hours]) => (
                      <p key={days} className="text-sm text-charcoal">
                        <span className="font-medium">{days}:</span> {hours}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Ticket Info */}
                {event.ticketInfo && (
                  <div className="flex items-start gap-4 pt-4 border-t border-charcoal/10">
                    <Ticket className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted uppercase tracking-wider mb-1">Admission</p>
                      <p className="text-charcoal font-medium">{event.ticketInfo.price}</p>
                      {event.ticketInfo.required && (
                        <p className="text-sm text-muted mt-1">RSVP or ticket required</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Add to Calendar */}
                <div className="relative">
                  <button
                    onClick={() => setShowCalendarOptions(!showCalendarOptions)}
                    className="w-full py-4 bg-terracotta text-white hover:bg-terracotta/90 transition-colors flex items-center justify-center gap-3 font-medium tracking-wider uppercase text-sm"
                  >
                    <Calendar className="w-5 h-5" />
                    Add to Calendar
                  </button>

                  {showCalendarOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-charcoal/10 shadow-lg z-10"
                    >
                      <button
                        onClick={handleGoogleCalendar}
                        className="w-full px-4 py-3 text-left hover:bg-charcoal/5 transition-colors flex items-center gap-3"
                      >
                        <Globe className="w-4 h-4 text-terracotta" />
                        <span className="text-sm">Google Calendar</span>
                      </button>
                      <button
                        onClick={handleDownloadICS}
                        className="w-full px-4 py-3 text-left hover:bg-charcoal/5 transition-colors flex items-center gap-3 border-t border-charcoal/10"
                      >
                        <Download className="w-4 h-4 text-terracotta" />
                        <span className="text-sm">Download .ics File</span>
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* RSVP / Get Tickets */}
                {event.ticketInfo?.required && (
                  rsvpSubmitted ? (
                    <div className="py-4 bg-sage/10 border border-sage text-sage flex items-center justify-center gap-2 font-medium text-sm">
                      <Check className="w-5 h-5" />
                      RSVP Confirmed
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (event.ticketInfo?.url) {
                          window.open(event.ticketInfo.url, '_blank');
                        } else {
                          setRsvpSubmitted(true);
                        }
                      }}
                      className="w-full py-4 border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors flex items-center justify-center gap-3 font-medium tracking-wider uppercase text-sm"
                    >
                      <Users className="w-5 h-5" />
                      {event.ticketInfo.url ? 'Get Tickets' : 'RSVP Now'}
                    </button>
                  )
                )}

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-full py-3 border border-charcoal/20 text-charcoal hover:border-terracotta hover:text-terracotta transition-colors flex items-center justify-center gap-2 text-xs font-sans uppercase tracking-widest"
                >
                  <Share2 className="w-4 h-4" />
                  Share Event
                </button>
              </div>

              {/* Contact */}
              {event.contact && (
                <div className="mt-8 pt-8 border-t border-charcoal/10 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted mb-3">Contact</p>
                  {event.contact.email && (
                    <a href={`mailto:${event.contact.email}`} className="flex items-center gap-3 text-sm text-charcoal hover:text-terracotta transition-colors">
                      <Mail className="w-4 h-4" />
                      {event.contact.email}
                    </a>
                  )}
                  {event.contact.phone && (
                    <a href={`tel:${event.contact.phone}`} className="flex items-center gap-3 text-sm text-charcoal hover:text-terracotta transition-colors">
                      <Phone className="w-4 h-4" />
                      {event.contact.phone}
                    </a>
                  )}
                  {event.contact.website && (
                    <a href={event.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-charcoal hover:text-terracotta transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Description & Theme */}
        <div className="max-w-4xl mb-16">
          <h2 className="font-serif text-3xl text-charcoal mb-6">About This Event</h2>
          <div className="prose prose-lg max-w-none">
            {event.description.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-charcoal/80 font-light leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Theme */}
          <div className="mt-8 p-6 bg-parchment/40 border-l-4 border-terracotta">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-terracotta" />
              <h3 className="font-serif text-xl text-charcoal">Exhibition Theme</h3>
            </div>
            <p className="text-charcoal/80 font-light leading-relaxed italic">
              {event.theme}
            </p>
          </div>
        </div>

        {/* Highlights */}
        {event.highlights.length > 0 && (
          <div className="mb-16">
            <h2 className="font-serif text-3xl text-charcoal mb-6">Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-4 border border-charcoal/10">
                  <Check className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
                  <p className="text-charcoal">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="mb-16 pb-16 border-b border-charcoal/10">
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-charcoal/5 text-charcoal text-sm hover:bg-terracotta/10 hover:text-terracotta transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div>
            <h2 className="font-serif text-3xl text-charcoal mb-8">More {event.type}s</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((related) => (
                <div
                  key={related.id}
                  onClick={() => onSelectEvent(related.id)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/5] overflow-hidden mb-3">
                    <img
                      src={related.images?.[0] || '/artportfolio.jpg'}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-serif text-xl text-charcoal group-hover:text-terracotta transition-colors line-clamp-2 mb-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {related.location.city} • {formatDate(related.schedule.startDate).split(',')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
