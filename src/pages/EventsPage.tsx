import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, Tag as TagIcon, Ticket } from 'lucide-react';
import { events, Event, EventType } from '../data/events';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface EventsPageProps {
  onNavigate: (page: any) => void;
  onSelectEvent: (id: number) => void;
}

const eventTypeLabels: Record<EventType, string> = {
  exhibition: 'Exhibitions',
  workshop: 'Workshops',
  talk: 'Artist Talks',
  fair: 'Art Fairs',
  private: 'Private Events'
};

export function EventsPage({ onNavigate, onSelectEvent }: EventsPageProps) {
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredEvents = selectedType === 'all' 
    ? events 
    : events.filter(e => e.type === selectedType);

  const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming');
  const pastEvents = filteredEvents.filter(e => e.status === 'past');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-background min-h-screen w-full pt-32 pb-20 px-6 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <button
            onClick={() => onNavigate('home')}
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-muted hover:text-charcoal transition-colors mb-12 self-start"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-xs md:text-sm tracking-[0.3em] uppercase text-terracotta mb-4 block">
              Join the Journey
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-charcoal mb-8">
              Events & Exhibitions
            </h1>
            <p className="text-charcoal/80 font-light text-lg leading-relaxed">
              Discover upcoming exhibitions, workshops, and artist talks. Join me as I share 
              my work and creative process with audiences around the world.
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 pb-8 border-b border-charcoal/10">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-6 py-2 text-sm tracking-wider uppercase transition-all ${
              selectedType === 'all'
                ? 'bg-terracotta text-white'
                : 'bg-white text-charcoal hover:bg-charcoal/5 border border-charcoal/10'
            }`}
          >
            All Events
          </button>
          {(Object.keys(eventTypeLabels) as EventType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 text-sm tracking-wider uppercase transition-all ${
                selectedType === type
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-charcoal hover:bg-charcoal/5 border border-charcoal/10'
              }`}
            >
              {eventTypeLabels[type]}
            </button>
          ))}
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-20">
            <h2 className="font-serif text-4xl text-charcoal mb-8">Upcoming</h2>
            <div className="space-y-8">
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onClick={() => onSelectEvent(event.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="font-serif text-4xl text-charcoal mb-8">Past Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event, index) => (
                <PastEventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onClick={() => onSelectEvent(event.id)}
                />
              ))}
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted text-lg">No events found in this category.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface EventCardProps {
  event: Event;
  index: number;
  onClick: () => void;
}

function EventCard({ event, index, onClick }: EventCardProps) {
  const { ref, isVisible } = useScrollReveal(0.1);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTypeColor = (type: EventType) => {
    const colors: Record<EventType, string> = {
      exhibition: 'bg-terracotta',
      workshop: 'bg-sage',
      talk: 'bg-clay',
      fair: 'bg-gold',
      private: 'bg-charcoal'
    };
    return colors[type];
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`group cursor-pointer transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="bg-white border border-charcoal/10 p-8 hover:border-terracotta transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image */}
          <div className="lg:col-span-4">
            <div className="relative aspect-[4/5] overflow-hidden">
              {event.featured && (
                <div className="absolute top-4 right-4 z-10 bg-terracotta text-white px-3 py-1 text-xs tracking-wider uppercase">
                  Featured
                </div>
              )}
              <img
                src={event.images[0]}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className={`${getTypeColor(event.type)} text-white px-4 py-1 text-xs tracking-wider uppercase`}>
                {event.type}
              </span>
            </div>

            <h3 className="font-serif text-3xl md:text-4xl text-charcoal group-hover:text-terracotta transition-colors mb-2">
              {event.title}
            </h3>
            
            {event.subtitle && (
              <p className="text-muted italic mb-4">{event.subtitle}</p>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-terracotta" />
                <span className="text-charcoal">
                  {formatDate(event.schedule.startDate)}
                  {event.schedule.endDate !== event.schedule.startDate && 
                    ` - ${formatDate(event.schedule.endDate)}`
                  }
                </span>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-charcoal font-medium">{event.location.venue}</p>
                  <p className="text-muted">
                    {event.location.city}, {event.location.country}
                  </p>
                </div>
              </div>

              {event.ticketInfo && (
                <div className="flex items-center gap-3 text-sm">
                  <Ticket className="w-4 h-4 text-terracotta" />
                  <span className="text-charcoal">{event.ticketInfo.price}</span>
                </div>
              )}
            </div>

            <p className="text-charcoal/70 font-light leading-relaxed line-clamp-3 mb-6 flex-1">
              {event.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {event.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs text-muted">
                    #{tag}
                  </span>
                ))}
              </div>

              <span className="text-sm text-terracotta tracking-wider uppercase border-b border-transparent group-hover:border-terracotta transition-all">
                View Details →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PastEventCard({ event, index, onClick }: EventCardProps) {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`group cursor-pointer transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden mb-4">
        <div className="absolute inset-0 bg-charcoal/40 z-10"></div>
        <img
          src={event.images[0]}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 z-20 bg-white/90 text-charcoal px-3 py-1 text-xs tracking-wider uppercase">
          Past Event
        </div>
      </div>

      <h3 className="font-serif text-2xl text-charcoal group-hover:text-terracotta transition-colors mb-2">
        {event.title}
      </h3>
      <p className="text-sm text-muted">{event.location.city} • {event.type}</p>
    </div>
  );
}
