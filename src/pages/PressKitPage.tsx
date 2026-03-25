import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Download, ExternalLink, ChevronDown, ChevronUp, FileText, Image, Mail } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useArtworks } from '../hooks/useArtworks';

interface Props { onNavigate: (page: any) => void; }

const EXHIBITIONS = [
  { year: '2025', title: 'Ditema: Threads of Heritage',         venue: 'Morija Arts Centre, Morija',              type: 'Group' },
  { year: '2025', title: 'New Voices: Southern Africa Now',      venue: 'Alliance Française, Maseru',              type: 'Group' },
  { year: '2024', title: 'Earth, Clay, Resin',                  venue: 'Maseru Arts Quarter, Maseru',             type: 'Solo'  },
  { year: '2024', title: 'Latitudes: Africa in Focus',          venue: 'Online — Latitudes.online',               type: 'Group' },
  { year: '2023', title: 'Intersections: Mixed Media Show',     venue: 'University of Lesotho Gallery, Maseru',   type: 'Group' },
  { year: '2023', title: 'Emerging Voices, Southern Africa',    venue: 'Johannesburg Art Gallery (online)',       type: 'Group' },
];

const COLLECTIONS = [
  { collector: 'Private collection', location: 'London, United Kingdom' },
  { collector: 'Private collection', location: 'Brussels, Belgium'       },
  { collector: 'Private collection', location: 'Johannesburg, South Africa' },
  { collector: 'Private collection', location: 'Maseru, Lesotho'          },
  { collector: 'Private collection', location: 'São Paulo, Brazil'        },
];

const PRESS = [
  { title: 'The State of Visual Arts in Lesotho', outlet: 'Contemporary And (C&)', year: '2024', type: 'Feature',   url: 'https://contemporaryand.com/magazines/the-state-of-visual-arts-in-lesotho/' },
  { title: 'Africa Art 2025: The Big Five',        outlet: 'Artinfoland Magazine',  year: '2025', type: 'Profile',   url: '#' },
  { title: 'New Horizons: Artists to Watch',       outlet: 'Art Africa',            year: '2024', type: 'Listing',   url: '#' },
  { title: 'Studio Interview: Earth and Resin',    outlet: 'Pavillon54',            year: '2025', type: 'Interview', url: '#' },
];

const STATEMENT = `Mapheane's practice explores the space between inheritance and invention — what we are given by land, culture, and lineage, and what we make of it ourselves.

Working across mixed media painting on resin canvas, charcoal and graphite drawing, and glazed stoneware sculpture, she draws on the visual grammar of Basotho litema wall painting and seanamarena blanket patterns as a structural vocabulary. These are not quotations — they are the deep grammar from which new forms emerge.

The highlands of Lesotho, the Kingdom in the Sky, provide more than a setting. The clay underfoot, the light at altitude, the layers of volcanic basalt — these are materials as much as metaphors. Paint and resin stratify like geological time. Charcoal lines open like worn paths through mountain grass. Stoneware bodies hold the memory of hands.

The work asks what it means to make something new from something ancient, in a place the world has largely not yet learned to see.`;

export function PressKitPage({ onNavigate }: Props) {
  const { artworks } = useArtworks();
  useSEO({
    title: 'Press & CV',
    description: 'Professional press kit, CV, artist statement, and exhibition history for Mapheane — contemporary artist based in Maseru, Lesotho.',
  });

  const [showFullStatement, setShowFullStatement] = useState(false);
  const statementLines = STATEMENT.split('\n\n');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-background min-h-screen pt-28 pb-24"
    >
      <div className="container mx-auto px-5 sm:px-8 md:px-12 max-w-5xl">

        {/* Back */}
        <button onClick={() => onNavigate('about')}
          className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-10">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> About
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-3">Press & CV</span>
            <h1 className="font-serif text-5xl sm:text-6xl italic text-charcoal" style={{ letterSpacing: '-0.02em', lineHeight: 1.0 }}>
              Mapheane
            </h1>
            <p className="text-muted mt-2 text-sm">Contemporary Artist · Maseru, Kingdom of Lesotho</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="flex items-center gap-2 bg-terracotta text-background px-5 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button">
              <Download className="w-3.5 h-3.5" /> Press Kit PDF
            </button>
            <a href="mailto:hello@mapheane.art"
              className="flex items-center gap-2 border border-charcoal/15 text-muted px-5 py-2.5 text-xs font-sans uppercase tracking-widest hover:border-charcoal/30 hover:text-charcoal transition-all">
              <Mail className="w-3.5 h-3.5" /> Contact
            </a>
          </div>
        </div>

        <div className="w-12 h-px bg-terracotta/30 mb-14" />

        {/* Artist Statement */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl italic text-charcoal mb-6" style={{ letterSpacing: '-0.01em' }}>Artist Statement</h2>
          <div className="max-w-2xl space-y-4">
            {statementLines.slice(0, showFullStatement ? statementLines.length : 2).map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-sm sm:text-base text-charcoal/75 leading-relaxed"
              >
                {para}
              </motion.p>
            ))}
          </div>
          {statementLines.length > 2 && (
            <button
              onClick={() => setShowFullStatement(s => !s)}
              className="mt-4 flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-muted hover:text-terracotta transition-colors"
            >
              {showFullStatement ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Read full statement</>
              )}
            </button>
          )}
        </section>

        {/* CV grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Exhibitions */}
          <section>
            <h2 className="font-serif text-2xl italic text-charcoal mb-6" style={{ letterSpacing: '-0.01em' }}>Exhibitions</h2>
            <div className="space-y-4">
              {EXHIBITIONS.map((ex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 pb-4 border-b border-charcoal/6 last:border-0"
                >
                  <div className="w-12 flex-shrink-0">
                    <p className="font-sans text-sm text-charcoal font-500">{ex.year}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-sans text-charcoal">{ex.title}</p>
                      <span className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 flex-shrink-0 ${
                        ex.type === 'Solo' ? 'bg-terracotta/12 text-terracotta' : 'bg-charcoal/8 text-muted'
                      }`}>{ex.type}</span>
                    </div>
                    <p className="text-xs text-muted">{ex.venue}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="space-y-12">
            {/* Collections */}
            <section>
              <h2 className="font-serif text-2xl italic text-charcoal mb-6" style={{ letterSpacing: '-0.01em' }}>Collections</h2>
              <div className="space-y-3">
                {COLLECTIONS.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b border-charcoal/6 last:border-0">
                    <div className="w-1 h-1 rounded-full bg-terracotta flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-sans text-muted">{c.collector}</p>
                      <p className="text-xs text-muted/60">{c.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Press */}
            <section>
              <h2 className="font-serif text-2xl italic text-charcoal mb-6" style={{ letterSpacing: '-0.01em' }}>Press</h2>
              <div className="space-y-4">
                {PRESS.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-charcoal/6 last:border-0">
                    <div className="w-12 flex-shrink-0">
                      <p className="font-sans text-sm text-charcoal font-500">{p.year}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-sans text-charcoal flex-1">{p.title}</p>
                        {p.url !== '#' && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer"
                            className="text-muted hover:text-terracotta transition-colors flex-shrink-0 mt-0.5">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted">{p.outlet}</p>
                        <span className="text-xs text-muted/50">·</span>
                        <span className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 ${
                          p.type === 'Feature' ? 'bg-terracotta/12 text-terracotta' : 'bg-charcoal/6 text-muted'
                        }`}>{p.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Media assets section */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl italic text-charcoal mb-6" style={{ letterSpacing: '-0.01em' }}>Media Assets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {artworks.slice(0, 3).map(art => (
              <div key={art.id} className="group">
                <div className="aspect-[3/4] overflow-hidden bg-parchment mb-3 relative">
                  <img src={art.images[0]} alt={art.title} draggable={false}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ objectPosition: art.cropPosition }} />
                  <button className="absolute bottom-3 right-3 bg-background/85 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-terracotta hover:text-background text-charcoal">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-serif text-sm italic text-charcoal">{art.title}</p>
                <p className="text-xs text-muted">{art.dimensions} · {art.year}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-4 leading-relaxed">
            High-resolution images available on request. Contact{' '}
            <a href="mailto:hello@mapheane.art" className="text-terracotta hover:text-terracottaDark transition-colors">
              hello@mapheane.art
            </a>
            {' '}with intended use and publication details.
          </p>
        </section>

        {/* Contact block */}
        <section className="bg-parchment/40 border border-charcoal/8 p-7 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-serif italic text-xl text-charcoal mb-2">Press inquiries</p>
              <p className="text-sm text-muted leading-relaxed">
                For interviews, exhibition features, or image requests:<br />
                <a href="mailto:hello@mapheane.art" className="text-terracotta hover:text-terracottaDark transition-colors">
                  hello@mapheane.art
                </a>
              </p>
            </div>
            <button
              onClick={() => onNavigate('contact')}
              className="flex items-center gap-2 bg-terracotta text-background px-6 py-3 text-xs font-sans uppercase tracking-widest hover:bg-terracottaDark transition-colors shadow-button flex-shrink-0"
            >
              Get in touch <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
