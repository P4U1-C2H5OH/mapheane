export type MomentType = 'studio' | 'exhibition' | 'process' | 'travel' | 'inspiration' | 'personal';
export type MediaType = 'image' | 'video' | 'gallery';

export const momentTypeLabels: Record<MomentType, string> = {
  studio: 'Studio',
  exhibition: 'Exhibition',
  process: 'Process',
  travel: 'Travel',
  inspiration: 'Inspiration',
  personal: 'Personal'
};

export interface MomentMedia {
  type: MediaType;
  url: string;
  thumbnail?: string;
  caption?: string;
  alt: string;
}

export interface ArtistMoment {
  id: number;
  title: string;
  date: string; // ISO date string
  type: MomentType;
  location?: string;
  excerpt: string;
  content: string; // Full text content
  media: MomentMedia[];
  tags: string[];
  featured?: boolean;
  mood?: string; // e.g., "Reflective", "Energetic", "Peaceful"
}

export const artistMoments: ArtistMoment[] = [
  {
    id: 1,
    title: 'First Light in the New Studio',
    date: '2024-02-10',
    type: 'studio',
    location: 'Paris, France',
    excerpt: 'The morning sun streams through tall windows, painting golden rectangles on bare walls. This is where magic will happen.',
    content: `Moving into this new space feels like opening a fresh sketchbook. The light here is different—softer, more forgiving. I spent the morning just watching how it travels across the room, imagining where each easel will stand, where the clay table will live.

There's something sacred about an empty studio. It holds infinite possibility. Every corner whispers with potential futures: paintings yet to be conceived, sculptures waiting to emerge from formless clay.

I brought only my favorite brush and a single tube of burnt sienna. Painted a small stroke on the wall—my way of claiming the space, of saying "we begin here."`,
    media: [
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Empty studio with morning light',
        caption: 'Morning light, 8:45 AM'
      },
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'First brush stroke on studio wall',
        caption: 'The first mark—burnt sienna on white'
      },
      {
        type: 'gallery',
        url: '/artportfolio.jpg',
        alt: 'Studio details',
        caption: 'Finding beauty in empty corners'
      }
    ],
    tags: ['studio', 'new beginnings', 'light', 'space'],
    featured: true,
    mood: 'Hopeful'
  },
  {
    id: 2,
    title: 'Hands Deep in Earth',
    date: '2024-02-08',
    type: 'process',
    location: 'Studio',
    excerpt: 'Clay has memory. It remembers every touch, every hesitation. Today we had a conversation.',
    content: `There's an honesty to clay that painting doesn't have. You can't hide behind it. Your uncertainty shows in every fingerprint, your confidence in every decisive pull.

Today I worked on a new vessel—no, that's not right. Today I *collaborated* with the clay. It wanted to lean left; I suggested we try right. We compromised. That's the dance.

My hands are stained red-brown, dried clay under my fingernails. I could scrub for an hour and still carry traces of this session. I like that. We should carry our work with us.`,
    media: [
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Hands working clay',
        caption: 'Dialogue in terracotta'
      },
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Clay vessel in progress',
        caption: 'Taking shape'
      }
    ],
    tags: ['clay', 'process', 'ceramics', 'hands-on'],
    mood: 'Meditative'
  },
  {
    id: 3,
    title: 'Vernissage: A Night of Connections',
    date: '2024-01-28',
    type: 'exhibition',
    location: 'Galerie Moderne, Paris',
    excerpt: 'Opening night. The work no longer belongs to me—it belongs to everyone who sees it.',
    content: `The gallery filled slowly, like a breath being drawn. Strangers became intimate with my work, seeing things I never intended, finding meanings I never planned. This is the gift of letting go.

A woman stood before "Ce Père Idéal" for twelve minutes. I timed it. Didn't approach her, didn't break the spell. When she finally moved, her eyes were bright. She didn't need to say anything.

Someone asked about my process. I tried to explain but realized—the process isn't in my studio habits or my choice of materials. The process is in the courage to be seen.`,
    media: [
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Gallery opening night',
        caption: 'First guests arriving'
      },
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Artwork on gallery wall',
        caption: 'Ce Père Idéal in its new home'
      },
      {
        type: 'gallery',
        url: '/artportfolio.jpg',
        alt: 'Guests viewing art',
        caption: 'The moment of connection'
      }
    ],
    tags: ['exhibition', 'opening', 'gallery', 'public'],
    featured: true,
    mood: 'Exhilarated'
  },
  {
    id: 4,
    title: 'Color Studies at Dawn',
    date: '2024-01-15',
    type: 'process',
    location: 'Studio',
    excerpt: 'Before the world wakes, I mix colors. This is my meditation, my prayer.',
    content: `5:30 AM. The city is still sleeping, but my palette knife is already dancing. I'm searching for a specific warmth—the color of late afternoon sun on old brick, the glow of terracotta after rain.

Mixed twelve variations. Eleven felt wrong. The twelfth sang.

This is what people don't see: the hours of "almost." The near-misses and the quiet persistence. Every finished painting rests on a foundation of attempts, experiments, and "not quite yet."

I'll use this color for the background of the new piece. Or maybe I won't. Sometimes the search is the point, not the finding.`,
    media: [
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Color mixing palette',
        caption: 'Searching for the perfect warmth'
      },
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Color swatches',
        caption: 'Twelve attempts, one success'
      }
    ],
    tags: ['color', 'process', 'morning', 'experimentation'],
    mood: 'Contemplative'
  },
  {
    id: 5,
    title: 'Sketching Strangers at Café de Flore',
    date: '2024-01-10',
    type: 'inspiration',
    location: 'Saint-Germain-des-Prés, Paris',
    excerpt: 'People-watching with a purpose. Every gesture tells a story.',
    content: `Tucked in my corner table with an espresso and my smallest sketchbook. The goal isn't accuracy—it's essence. Can I capture in ten lines what makes that woman distinctly her? The way she holds her phone, the angle of her crossed legs, the unconscious elegance of her hand gesture.

A man reads Le Monde, folding and refolding the pages with precise movements. Military? Architect? The precision speaks of discipline, of order. I sketch the negative space around his elbows.

This is research. Not for a specific painting, but for understanding. How do bodies occupy space? Where do we hold tension? What do our habits reveal?

Three hours. Seventeen sketches. Two coffees. Countless stories imagined.`,
    media: [
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Sketchbook on café table',
        caption: 'Field notes'
      },
      {
        type: 'gallery',
        url: '/artportfolio.jpg',
        alt: 'Quick gesture sketches',
        caption: 'Capturing the essence'
      }
    ],
    tags: ['sketching', 'observation', 'café', 'people'],
    mood: 'Curious'
  },
  {
    id: 6,
    title: 'When Nothing Feels Right',
    date: '2024-01-05',
    type: 'personal',
    location: 'Studio',
    excerpt: 'Some days, the work fights back. Today was one of those days.',
    content: `Started three canvases. Scraped down three canvases. The studio floor is a Jackson Pollock of my frustration—paint drips in colors that were supposed to be something else.

This is the part of being an artist that nobody talks about at gallery openings: the days when everything you touch turns to mud. When your hand can't translate what your mind sees. When the gap between vision and execution feels like a canyon.

I'm keeping the scraped canvas. Tomorrow or next week or next month, I'll see something in those ghost marks, those layers of "no." Sometimes our failures teach us more than our successes.

For now, I'm closing the studio early. Going to walk by the Seine, let the frustration dissolve into the water.`,
    media: [
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Paint-stained studio floor',
        caption: 'Beautiful failure'
      },
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Scraped canvas',
        caption: 'Layers of "not yet"'
      }
    ],
    tags: ['struggle', 'process', 'honesty', 'failure'],
    mood: 'Frustrated'
  },
  {
    id: 7,
    title: 'Master Class with Marie Laurent',
    date: '2023-12-20',
    type: 'inspiration',
    location: 'École des Beaux-Arts',
    excerpt: 'Learning from a legend. Some lessons can only be taught hand-to-hand.',
    content: `Marie Laurent. Eighty-three years old, seventy years of painting. Her hands shake now, but when she picks up a brush, there's nothing uncertain about her.

"Stop thinking," she told me. "Your mind is a liar. Your hand knows the truth."

We painted side by side for three hours. She didn't correct my technique—she showed me her own, let me discover the difference. This is mastery: knowing when to speak and when to simply demonstrate.

She signed my canvas before I left. Not her name—just a small stroke of vermillion in the corner. "To remember," she said. As if I could forget.`,
    media: [
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Marie Laurent teaching',
        caption: 'Wisdom in motion'
      },
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Two canvases side by side',
        caption: 'Student and master'
      }
    ],
    tags: ['learning', 'mentorship', 'masters', 'technique'],
    featured: true,
    mood: 'Grateful'
  },
  {
    id: 8,
    title: 'Sunset from Mont Saint-Michel',
    date: '2023-12-15',
    type: 'travel',
    location: 'Normandy, France',
    excerpt: 'Sometimes you travel for inspiration. Sometimes inspiration ambushes you.',
    content: `Didn't plan this trip for work. Needed to clear my head, escape the studio for a weekend. But standing here, watching the light transform the ancient stones from gold to rose to violet in the span of thirty minutes—this is why I paint.

No camera can capture this. No words can hold it. Only the attempt to translate it through paint, to filter it through my particular way of seeing, can do it justice. And even then, I'll fail. But it's a worthy failure.

Filled eight pages of my pocket notebook with color notes. Quick sketches of the way the shadows pool in the cobblestones. The exact angle of light that makes the abbey glow.

Tomorrow, back to Paris. But I'm bringing this sunset with me.`,
    media: [
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Mont Saint-Michel at sunset',
        caption: 'Gold to rose to violet'
      },
      {
        type: 'image',
        url: '/artportfolio.jpg',
        alt: 'Sketchbook color notes',
        caption: 'Chasing the light'
      }
    ],
    tags: ['travel', 'light', 'inspiration', 'landscape'],
    mood: 'Awestruck'
  }
];

// Helper functions
export const getMomentsByType = (type: MomentType): ArtistMoment[] => {
  return artistMoments.filter(moment => moment.type === type);
};

export const getFeaturedMoments = (): ArtistMoment[] => {
  return artistMoments.filter(moment => moment.featured);
};

export const getRecentMoments = (limit: number = 5): ArtistMoment[] => {
  return [...artistMoments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getMomentById = (id: number): ArtistMoment | undefined => {
  return artistMoments.find(moment => moment.id === id);
};
