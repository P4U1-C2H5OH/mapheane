import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { getUpcomingEvents } from '../data/events';

interface EventsSectionProps {
  onNavigate?: (page: 'events') => void;
  onSelectEvent?: (id: number) => void;
}

export function EventsSection({ onNavigate, onSelectEvent }: EventsSectionProps) {
  const { ref, isVisible } = useScrollReveal(0.1);
  const upcomingEvents = getUpcomingEvents().slice(0, 3); // Show first 3

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section id="events" className="py-24 md:py-32 w-full bg-white">
      <div ref={ref} className="container mx-auto px-6 md:px-12">
        <div
          className={`mb-16 md:mb-24 transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="font-serif text-5xl md:text-6xl text-charcoal mb-4 leading-none">
            Upcoming
            <br />
            Events
          </h2>
          <p className="text-xs tracking-[0.2em] uppercase text-muted mt-4">
            Join me at exhibitions, talks, and workshops
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 border-t border-charcoal/10 pt-12">
          {upcomingEvents.map((event, index) => (
            <div
              key={event.id}
              onClick={() => onSelectEvent?.(event.id)}
              className={`group cursor-pointer transition-all duration-1000 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{
                transitionDelay: `${index * 150}ms`,
              }}
            >
              {/* Event Type Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs tracking-wider uppercase bg-terracotta/10 text-terracotta">
                  {event.type}
                </span>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <ArrowRight className="w-6 h-6 font-light stroke-[1] text-charcoal group-hover:text-terracotta group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-2" />
                <div>
                  <h3 className="font-serif text-3xl md:text-4xl text-charcoal group-hover:text-terracotta transition-colors duration-300 mb-2">
                    {event.title}
                  </h3>
                  {event.subtitle && (
                    <p className="text-muted italic text-sm mb-4">{event.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="pl-10 space-y-3">
                <div className="flex items-center gap-2 text-charcoal">
                  <Calendar className="w-4 h-4 text-muted" />
                  <p className="text-sm font-medium">
                    {formatDate(event.schedule.startDate)}
                    {event.schedule.endDate !== event.schedule.startDate && 
                      ` - ${formatDate(event.schedule.endDate)}`
                    }
                  </p>
                </div>

                <div className="flex items-start gap-2 text-muted">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-charcoal">{event.location.venue}</p>
                    <p className="font-light leading-relaxed">
                      {event.location.city}, {event.location.country}
                    </p>
                  </div>
                </div>

                <button className="inline-flex items-center gap-2 text-terracotta text-sm tracking-wider uppercase mt-4 border-b border-transparent group-hover:border-terracotta transition-all">
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Events Link */}
        <div className="flex justify-center mt-16">
          <button
            onClick={() => onNavigate?.('events')}
            className="group inline-flex items-center gap-3 text-charcoal hover:text-terracotta transition-colors duration-300"
          >
            <span className="text-sm tracking-[0.2em] uppercase border-b border-charcoal pb-1 group-hover:border-terracotta transition-colors">
              View All Events
            </span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
}
