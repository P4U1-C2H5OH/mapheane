export type EventType = 'exhibition' | 'workshop' | 'talk' | 'fair' | 'private';
export type EventStatus = 'upcoming' | 'ongoing' | 'past';

export interface EventLocation {
  venue: string;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EventSchedule {
  startDate: string; // ISO date
  endDate: string; // ISO date
  openingReception?: string; // ISO datetime
  hours: {
    [key: string]: string; // e.g., "Monday-Friday": "10:00 AM - 6:00 PM"
  };
}

export interface Event {
  id: number;
  title: string;
  type: EventType;
  status: EventStatus;
  subtitle?: string;
  description: string;
  theme: string;
  location: EventLocation;
  schedule: EventSchedule;
  featured: boolean;
  images: string[];
  artworks?: number[]; // IDs of artworks being shown
  highlights: string[];
  ticketInfo?: {
    price: string;
    required: boolean;
    url?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  tags: string[];
}

export const events: Event[] = [
  {
    id: 1,
    title: 'Terre et Lumière',
    subtitle: 'Clay and Light: A Dialogue',
    type: 'exhibition',
    status: 'upcoming',
    description: `An intimate exploration of form and shadow, "Terre et Lumière" brings together recent ceramic sculptures with mixed-media paintings that capture the interplay between earth and illumination.

This exhibition marks a pivotal moment in my artistic journey—a conversation between the tactile permanence of clay and the ephemeral quality of light on canvas. Each piece invites contemplation on how we hold onto moments while they simultaneously slip away.

The collection features fifteen new works, including the monumental "Vessel of Time" series and the acclaimed "Shadow Memory" paintings. Visitors will experience an immersive space where sculpture and painting dialogue across the gallery, creating unexpected moments of connection and resonance.`,
    theme: 'The exhibition explores the tension between permanence and impermanence, examining how light transforms our perception of solid forms and how memory shapes our understanding of physical space.',
    location: {
      venue: 'Galerie Mondapart',
      address: '80 Rue du Château',
      city: 'Boulogne-Billancourt',
      country: 'France',
      coordinates: {
        lat: 48.8426,
        lng: 2.2388
      }
    },
    schedule: {
      startDate: '2024-03-15',
      endDate: '2024-04-28',
      openingReception: '2024-03-15T18:00:00',
      hours: {
        'Tuesday-Saturday': '11:00 AM - 7:00 PM',
        'Sunday': '2:00 PM - 6:00 PM',
        'Monday': 'Closed'
      }
    },
    featured: true,
    images: ['/artportfolio.jpg', '/artportfolio.jpg', '/artportfolio.jpg'],
    artworks: [1, 2, 4, 6], // References to artwork IDs
    highlights: [
      'Opening reception with artist talk',
      'Guided tours every Saturday at 3 PM',
      'Exclusive preview of the "Vessel of Time" series',
      'Limited edition catalog available',
      'Meet the artist: March 22 & April 5'
    ],
    ticketInfo: {
      price: 'Free admission',
      required: false
    },
    contact: {
      email: 'contact@galeriemondapart.fr',
      phone: '+33 1 46 05 88 00',
      website: 'https://galeriemondapart.com'
    },
    tags: ['solo exhibition', 'ceramics', 'painting', 'paris', 'spring 2024']
  },
  {
    id: 2,
    title: 'Collective Voices',
    subtitle: 'Contemporary European Artists',
    type: 'exhibition',
    status: 'upcoming',
    description: `Join us for "Collective Voices," a curated group exhibition featuring twelve emerging and established artists from across Europe. This celebration of diverse perspectives examines themes of identity, place, and transformation in contemporary art.

I'm honored to be included alongside talented artists whose work challenges conventional narratives and pushes the boundaries of their chosen mediums. The exhibition showcases my "Fragments de Mémoire" series—intimate charcoal and ink drawings that explore the archaeology of personal memory.

The opening weekend features panel discussions on the role of traditional techniques in contemporary practice, studio visits, and networking opportunities with collectors and fellow art enthusiasts.`,
    theme: 'Exploring how contemporary European artists engage with tradition, innovation, and cultural identity in an increasingly connected world.',
    location: {
      venue: 'Rollebeek Gallery',
      address: '28 Rue de Rollebeek',
      city: 'Brussels',
      country: 'Belgium',
      coordinates: {
        lat: 50.8397,
        lng: 4.3575
      }
    },
    schedule: {
      startDate: '2024-04-10',
      endDate: '2024-05-20',
      openingReception: '2024-04-10T19:00:00',
      hours: {
        'Wednesday-Sunday': '12:00 PM - 6:00 PM',
        'Monday-Tuesday': 'Closed'
      }
    },
    featured: false,
    images: ['/artportfolio.jpg', '/artportfolio.jpg'],
    artworks: [5, 8],
    highlights: [
      'Group exhibition featuring 12 artists',
      'Panel discussion: April 12, 3 PM',
      'Curator-led tours Thursdays at 4 PM',
      'Artist meet-and-greet: April 13',
      'Exhibition catalog with essays'
    ],
    ticketInfo: {
      price: 'Free admission',
      required: false
    },
    contact: {
      email: 'info@rollebeekgallery.be',
      phone: '+32 2 512 92 95',
      website: 'https://rollebeekgallery.be'
    },
    tags: ['group exhibition', 'drawing', 'brussels', 'contemporary']
  },
  {
    id: 3,
    title: 'Creative Alchemy Workshop',
    subtitle: 'Mixed Media & Clay Techniques',
    type: 'workshop',
    status: 'upcoming',
    description: `Discover the transformative power of working with mixed media and clay in this intensive two-day workshop. Whether you're a beginner or an experienced artist, this hands-on experience will deepen your understanding of material exploration and intuitive creation.

We'll work together to develop techniques in:
- Clay hand-building and surface treatment
- Combining traditional and non-traditional materials
- Developing a personal visual language
- Moving past creative blocks

Limited to 12 participants to ensure personalized attention. All materials provided. No previous experience necessary—just curiosity and willingness to experiment.`,
    theme: 'Exploring the intersection of different materials and techniques to discover unexpected creative possibilities.',
    location: {
      venue: 'Moov Gallery Studio',
      address: '5 Rue des Vierges',
      city: 'Vannes',
      country: 'France',
      coordinates: {
        lat: 47.6586,
        lng: -2.7574
      }
    },
    schedule: {
      startDate: '2024-05-04',
      endDate: '2024-05-05',
      hours: {
        'Saturday-Sunday': '10:00 AM - 5:00 PM (with lunch break)'
      }
    },
    featured: false,
    images: ['/artportfolio.jpg'],
    highlights: [
      'Two full days of hands-on creation',
      'All materials and tools provided',
      'Take home your finished pieces',
      'Small group size (max 12 people)',
      'Light refreshments included',
      'Certificate of completion'
    ],
    ticketInfo: {
      price: '€280 per person',
      required: true,
      url: 'https://moovgallery.com/workshops'
    },
    contact: {
      email: 'workshops@moovgallery.com',
      phone: '+33 2 97 01 63 00'
    },
    tags: ['workshop', 'hands-on', 'clay', 'mixed media', 'vannes']
  },
  {
    id: 4,
    title: 'Artist Talk: The Poetry of Materials',
    subtitle: 'In Conversation with Aria',
    type: 'talk',
    status: 'upcoming',
    description: `Join me for an intimate evening conversation about the artistic process, the stories behind the work, and the journey from concept to creation. This talk offers a rare glimpse into my studio practice, creative philosophy, and the decisions that shape each piece.

We'll explore:
- How I choose materials for different emotional narratives
- The role of "mistakes" and accidents in the creative process
- Balancing commercial success with artistic integrity
- Advice for emerging artists finding their voice

Following the presentation, there will be time for audience questions and a small reception. A limited number of signed exhibition catalogs will be available for purchase.`,
    theme: 'An intimate conversation about creativity, materials, and the artistic journey.',
    location: {
      venue: 'Galerie Mondapart',
      address: '80 Rue du Château',
      city: 'Boulogne-Billancourt',
      country: 'France'
    },
    schedule: {
      startDate: '2024-03-22',
      endDate: '2024-03-22',
      hours: {
        'Friday': '7:00 PM - 9:00 PM'
      }
    },
    featured: true,
    images: ['/artportfolio.jpg'],
    highlights: [
      'Q&A session with the artist',
      'Reception with wine and light refreshments',
      'Signed catalogs available',
      'Limited seating - RSVP required',
      'Recorded for podcast release'
    ],
    ticketInfo: {
      price: 'Free (RSVP required)',
      required: true,
      url: 'mailto:rsvp@galeriemondapart.fr'
    },
    contact: {
      email: 'contact@galeriemondapart.fr',
      phone: '+33 1 46 05 88 00'
    },
    tags: ['artist talk', 'conversation', 'paris', 'free event']
  },
  {
    id: 5,
    title: 'Art Paris 2024',
    subtitle: 'International Contemporary Art Fair',
    type: 'fair',
    status: 'upcoming',
    description: `I'm thrilled to be represented by Galerie Mondapart at Art Paris 2024, one of Europe's premier contemporary art fairs. This year's edition brings together over 150 galleries from 25 countries under the iconic glass roof of the Grand Palais Éphémère.

Visit our booth (C12) to see a curated selection of recent works, including pieces from the "Terre et Lumière" series and exclusive fair previews. I'll be present at the booth on opening day (April 4) and Saturday afternoon (April 6) for informal conversations with collectors and art enthusiasts.

Art Paris offers a unique opportunity to see my work alongside international contemporary artists and discover the vibrant pulse of today's art scene.`,
    theme: 'Celebrating contemporary art from established and emerging galleries across Europe and beyond.',
    location: {
      venue: 'Grand Palais Éphémère',
      address: 'Place Joffre, Champ de Mars',
      city: 'Paris',
      country: 'France',
      coordinates: {
        lat: 48.8584,
        lng: 2.3047
      }
    },
    schedule: {
      startDate: '2024-04-04',
      endDate: '2024-04-07',
      openingReception: '2024-04-04T18:00:00',
      hours: {
        'Thursday': '12:00 PM - 8:00 PM (VIP Preview 11 AM)',
        'Friday-Saturday': '11:00 AM - 8:00 PM',
        'Sunday': '11:00 AM - 7:00 PM'
      }
    },
    featured: true,
    images: ['/artportfolio.jpg', '/artportfolio.jpg'],
    artworks: [1, 4, 6, 9],
    highlights: [
      'Booth C12 - Galerie Mondapart',
      'Artist present: April 4 & 6',
      'VIP preview tickets available',
      'Over 150 participating galleries',
      'Exclusive fair pricing',
      'Special commissions accepted'
    ],
    ticketInfo: {
      price: '€25 general admission, €45 VIP preview',
      required: true,
      url: 'https://artparis.com/tickets'
    },
    contact: {
      email: 'contact@galeriemondapart.fr',
      website: 'https://artparis.com'
    },
    tags: ['art fair', 'paris', 'contemporary art', 'grand palais', 'spring 2024']
  }
];

// Helper functions
export const getEventById = (id: number): Event | undefined => {
  return events.find(event => event.id === id);
};

export const getUpcomingEvents = (): Event[] => {
  return events
    .filter(event => event.status === 'upcoming')
    .sort((a, b) => new Date(a.schedule.startDate).getTime() - new Date(b.schedule.startDate).getTime());
};

export const getFeaturedEvents = (): Event[] => {
  return events.filter(event => event.featured && event.status === 'upcoming');
};

export const getEventsByType = (type: EventType): Event[] => {
  return events.filter(event => event.type === type);
};

// Calendar file generators
export const generateICS = (event: Event): string => {
  const formatDate = (dateStr: string) => {
    return dateStr.replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = event.schedule.openingReception || event.schedule.startDate + 'T18:00:00';
  const endDate = event.schedule.openingReception 
    ? new Date(new Date(event.schedule.openingReception).getTime() + 2 * 60 * 60 * 1000).toISOString()
    : event.schedule.startDate + 'T20:00:00';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aria Art Portfolio//Events//EN
BEGIN:VEVENT
UID:${event.id}@aria-art.com
DTSTAMP:${formatDate(new Date().toISOString())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}${event.subtitle ? ': ' + event.subtitle : ''}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location.venue}, ${event.location.address}, ${event.location.city}, ${event.location.country}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
};

export const generateGoogleCalendarUrl = (event: Event): string => {
  const startDate = event.schedule.openingReception || event.schedule.startDate + 'T18:00:00';
  const endDate = event.schedule.openingReception 
    ? new Date(new Date(event.schedule.openingReception).getTime() + 2 * 60 * 60 * 1000).toISOString()
    : event.schedule.startDate + 'T20:00:00';

  const formatDateForGoogle = (dateStr: string) => {
    return dateStr.replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title}${event.subtitle ? ': ' + event.subtitle : ''}`,
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
    details: event.description,
    location: `${event.location.venue}, ${event.location.address}, ${event.location.city}, ${event.location.country}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
