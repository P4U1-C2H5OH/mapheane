export interface ArtworkMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string; // for video poster frame
  caption?: string;
  alt: string;
}

export interface Artwork {
  id: number;
  title: string;
  dimensions: string;
  technique: string;
  medium: 'Painting' | 'Drawing' | 'Clay Model';
  status: 'Available' | 'Sold';
  cropPosition: string; // CSS object-position
  offsetClass: string; // Tailwind margin class for staggered look
  price: number;
  description: string;
  statement?: string; // longer artist's note on the work — optional
  video?: string;     // artist talking about this work (YouTube embed URL or direct mp4)
  images: string[];
  year?: number;
}

export const artworks: Artwork[] = [
{
  id: 1,
  title: 'Ce Père Idéal',
  dimensions: '97cm x 130cm',
  technique: 'Mixed media on resin canvas',
  medium: 'Painting',
  status: 'Available',
  cropPosition: '10% 20%',
  offsetClass: 'mt-0',
  price: 4200,
  year: 2024,
  description:
  'A profound exploration of paternal figures and the weight of expectations. This piece layers resin over mixed media to create a depth that mirrors the complexity of memory. The interplay of light and shadow suggests the duality of presence and absence.',
  images: ["/artportfolio.jpg", "/artportfolio.jpg",

  // Mocking multiple views with same image but different crops via CSS in real app, here just array
  "/artportfolio.jpg"]

},
{
  id: 2,
  title: 'La Lumière de ses Yeux',
  dimensions: '100cm x 80cm',
  technique: 'Mixed technique on resin canvas',
  medium: 'Painting',
  status: 'Available',
  cropPosition: '80% 40%',
  offsetClass: 'mt-12 md:mt-32',
  price: 3800,
  year: 2024,
  description:
  "Capturing the fleeting moment of connection. 'The Light in Her Eyes' speaks to the silent language of intimacy. The resin finish provides a glass-like quality, preserving the emotion suspended in time.",
  images: ["/artportfolio.jpg", "/artportfolio.jpg"]



},
{
  id: 3,
  title: 'Loulou',
  dimensions: '80cm x 100cm',
  technique: 'Mixed technique on canvas',
  medium: 'Drawing',
  status: 'Sold',
  cropPosition: '50% 50%',
  offsetClass: 'mt-6 md:mt-16',
  price: 3500,
  year: 2023,
  description:
  "A portrait of innocence and resilience. 'Loulou' uses bold strokes and a softer palette to convey the fragility of childhood. The texture of the raw canvas remains visible, grounding the ethereal subject matter.",
  images: ["/artportfolio.jpg", "/artportfolio.jpg"]
},
{
  id: 4,
  title: 'Terre Mère',
  dimensions: '45cm x 30cm x 25cm',
  technique: 'Glazed terracotta',
  medium: 'Clay Model',
  status: 'Available',
  cropPosition: '50% 30%',
  offsetClass: 'mt-0',
  price: 2800,
  year: 2024,
  description:
  "An exploration of maternal forms through clay. 'Terre Mère' celebrates the organic curves and strength found in earth and feminine power. The glaze work creates a skin-like texture that invites touch.",
  images: ["/artportfolio.jpg", "/artportfolio.jpg"]
},
{
  id: 5,
  title: 'Fragments de Mémoire',
  dimensions: '60cm x 80cm',
  technique: 'Charcoal and ink on paper',
  medium: 'Drawing',
  status: 'Available',
  cropPosition: '40% 50%',
  offsetClass: 'mt-12 md:mt-32',
  price: 1800,
  year: 2024,
  description:
  "A delicate study in memory and absence. Bold charcoal strokes contrast with the gossamer quality of ink washes, creating a dreamlike narrative of what remains and what fades.",
  images: ["/artportfolio.jpg", "/artportfolio.jpg"]
},
{
  id: 6,
  title: 'Silhouettes Urbaines',
  dimensions: '120cm x 150cm',
  technique: 'Acrylic on canvas',
  medium: 'Painting',
  status: 'Available',
  cropPosition: '60% 40%',
  offsetClass: 'mt-6 md:mt-16',
  price: 5200,
  year: 2024,
  description:
  "The city breathes through layered acrylic, capturing the rhythm of urban life. Architectural forms dissolve into abstract patterns, questioning the boundary between the built environment and human experience.",
  images: ["/artportfolio.jpg", "/artportfolio.jpg"]
},
{
  id: 7,
  title: 'Vessel of Dreams',
  dimensions: '35cm x 35cm x 40cm',
  technique: 'Stoneware with oxide wash',
  medium: 'Clay Model',
  status: 'Available',
  cropPosition: '50% 50%',
  offsetClass: 'mt-0',
  price: 2200,
  year: 2023,
  description:
  "A functional sculpture that blurs the line between utility and art. The organic asymmetry speaks to the imperfection inherent in handmade objects, while the oxide finish reveals the clay's natural variations.",
  images: ["/artportfolio.jpg", "/artportfolio.jpg"]
},
{
  id: 8,
  title: 'Études de Corps',
  dimensions: '50cm x 70cm',
  technique: 'Graphite on paper',
  medium: 'Drawing',
  status: 'Available',
  cropPosition: '50% 40%',
  offsetClass: 'mt-12 md:mt-32',
  price: 1500,
  year: 2024,
  description:
  "An intimate series of figure studies exploring form, light, and vulnerability. Each line is placed with intention, building volume and emotion through restraint rather than excess.",
  images: ["/artportfolio.jpg", "/artportfolio.jpg"]
},
{
  id: 9,
  title: 'Horizon Éternel',
  dimensions: '90cm x 120cm',
  technique: 'Oil on linen',
  medium: 'Painting',
  status: 'Available',
  cropPosition: '50% 60%',
  offsetClass: 'mt-6 md:mt-16',
  price: 4500,
  year: 2023,
  description:
  "Where sea meets sky in an infinite dialogue. This piece invites meditation on vastness and solitude, using subtle color shifts to create depth that extends beyond the canvas edges.",
  images: ["/artportfolio.jpg", "/artportfolio.jpg"]
}];