import { useSEO } from '../hooks/useSEO';
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface AboutPageProps {
  onNavigate: (page: any) => void;
}

const EXHIBITIONS = [
  { year: '2025', title: 'Group Exhibition — Emerging Voices of the Kingdom',  venue: 'Morija Arts & Cultural Festival, Lesotho', type: 'Group' },
  { year: '2024', title: 'Solo — Terre et Mémoire',                            venue: 'Pioneer Art Gallery, Maseru',                type: 'Solo'  },
  { year: '2024', title: 'Invitational — New Abstraction in Southern Africa',  venue: 'SMAC Gallery, Johannesburg',                 type: 'Group' },
  { year: '2023', title: 'Residency Exhibition',                               venue: 'Alliance Française Maseru',                  type: 'Group' },
  { year: '2023', title: 'Solo — Corps et Territoire',                         venue: 'Lesotho National University Arts Centre',    type: 'Solo'  },
  { year: '2022', title: 'Group Show — Emerging African Painters',             venue: 'Art Africa Fair, Cape Town',                 type: 'Group' },
];

const COLLECTIONS = [
  'Private collection — Maseru, Lesotho',
  'Private collection — Johannesburg, South Africa',
  'Private collection — Brussels, Belgium',
  'Corporate collection — Maseru',
  'Private collection — Paris, France',
];

const PRESS = [
  { title: 'The Voice That Speaks from Lesotho\'s Mountains',  outlet: 'Art Africa Magazine',    year: '2024', type: 'Feature'  },
  { title: 'Resin, Memory and the Mountain Kingdom',           outlet: 'Contemporary And',       year: '2024', type: 'Profile'  },
  { title: 'Five Artists to Watch from Southern Africa',       outlet: 'Latitudes Online',       year: '2023', type: 'Listing' },
  { title: 'Interview: On Clay, Grief, and Creative Practice', outlet: 'Lesotho Times Arts',     year: '2023', type: 'Interview'},
];

const in_view_variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function AboutPage({ onNavigate }: AboutPageProps) {
  const { ref: bioRef, isVisible: bioVisible } = useScrollReveal(0.1);
  const { ref: cvRef,  isVisible: cvVisible  } = useScrollReveal(0.1);

  useSEO({ title: 'About — Mapheane', description: 'Contemporary fine artist from Maseru, Kingdom of Lesotho' });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-background min-h-screen overflow-hidden"
    >
      {/* ── Opening Hero ─────────────────────────────────── */}
      <section className="relative w-full pt-36 pb-28 px-6 md:px-12 overflow-hidden">
        {/* Large ghost name */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-serif text-[20vw] leading-none text-charcoal/[0.028] italic">
            Mapheane
          </span>
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl">
          <button onClick={() => onNavigate('home')}
            className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-14">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-end">
            <div className="lg:col-span-7">
              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6">
                About the Artist
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-serif text-5xl md:text-7xl text-charcoal mb-8"
                style={{ lineHeight: '1.0', letterSpacing: '-0.02em' }}>
                "Art is not what you see,<br />
                <em className="italic text-terracotta">but what you make others see."</em>
              </motion.h1>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
                className="w-14 h-px bg-terracotta/40 origin-left mb-8" />
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="text-muted text-body-lg leading-relaxed max-w-lg">
                Maseru, Lesotho · Contemporary mixed media artist working across painting, drawing, and ceramic sculpture.
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:col-span-5 relative aspect-[3/4] overflow-hidden shadow-artwork">
              <div className="absolute inset-0 bg-gradient-to-br from-terracotta/6 to-transparent z-10 pointer-events-none" />
              <img src="/Image 3 no-bg.png" alt="Mapheane" draggable={false}
                className="w-full h-full object-cover object-[20%_20%]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Biography ─────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-parchment/30 border-y border-charcoal/5">
        <div ref={bioRef} className="container mx-auto max-w-5xl">
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-14 transition-all duration-1000 ease-luxury ${bioVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="lg:col-span-4">
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6">Biography</span>
              <div className="w-10 h-px bg-terracotta/30 mb-8" />
              {/* Mini stats */}
              <div className="space-y-5">
                {[
                  { label: 'Based in',       value: 'Maseru, Lesotho'                     },
                  { label: 'Practice',       value: 'Painting · Drawing · Sculpture'      },
                  { label: 'Represented',    value: 'Independent · Available on Latitudes' },
                  { label: 'Commissions',    value: 'Open · 4 slots per quarter'          },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-label uppercase tracking-widest text-muted mb-0.5">{item.label}</p>
                    <p className="text-sm text-charcoal">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <p className="text-body-lg text-charcoal/80 leading-relaxed">
                Mapheane is a contemporary artist born and based in Maseru, the capital of the Kingdom of Lesotho — the mountain kingdom entirely surrounded by South Africa, rising to above 3,000 metres at its highest peaks. Her practice spans mixed media painting on resin canvas, charcoal and graphite drawing, and glazed stoneware sculpture.
              </p>
              <p className="text-body text-charcoal/70 leading-relaxed">
                Her work is rooted in the intersection of the personal and the elemental — the body as landscape, grief as form, memory as texture. Raised within the living traditions of Basotho visual culture, Mapheane draws on the geometric logic of litema wall painting, the layered symbolism of seanamarena blanket patterns, and the ochres and clay tones of the Lesotho highlands. These are not decorative references but structural ones — the geometry is in the bones of each piece.
              </p>
              <p className="text-body text-charcoal/70 leading-relaxed">
                Working primarily in resin — a medium that seals, distorts, and preserves simultaneously — Mapheane creates surfaces that hold light differently at every hour. The sculpture practice runs parallel: stoneware vessels and figures that explore the same tensions between fragility and durability, between the handmade mark and the fired permanence of glaze.
              </p>
              <p className="text-body text-charcoal/70 leading-relaxed">
                Her work has been exhibited at the Morija Arts & Cultural Festival, Pioneer Art Gallery Maseru, Alliance Française Maseru, and invitational shows in Johannesburg. She accepts commissions from collectors across Africa and internationally, and teaches in her Maseru studio and through immersive retreats in the Lesotho highlands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Basotho Cultural Context ───────────────────────── */}
      <section className="py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative aspect-[4/5] overflow-hidden order-2 lg:order-1"
            >
              <img src="/artportfolio.jpg" alt="Work detail"
                draggable={false} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent pointer-events-none" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="order-1 lg:order-2"
            >
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6">Rooted Practice</span>
              <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-8" style={{ letterSpacing: '-0.015em', lineHeight: '1.05' }}>
                Kingdom in the Sky
              </h2>

              <div className="space-y-5">
                {[
                  {
                    title: 'Litema / Ditema',
                    body: 'The ancient Basotho tradition of geometric wall painting — created by women using clay, dung, and mineral pigments. Mapheane\'s painted geometries carry this lineage without illustrating it; the structure is felt rather than quoted.',
                  },
                  {
                    title: 'Seanamarena Blankets',
                    body: '"Kobo ke bophelo" — the blanket is life. Worn at every ritual moment of Basotho existence, the blanket is a symbol of identity, protection, and continuity. The layering logic of mixed media resin directly echoes the blanket\'s woven accumulations.',
                  },
                  {
                    title: 'Earth & Clay',
                    body: 'Lesotho\'s highlands are defined by exposed sandstone, red earth, and the mountain streams that carve them. The ceramic practice begins here — local material transformed through fire into something that will outlast everything that made it.',
                  },
                ].map(item => (
                  <div key={item.title} className="border-l-2 border-terracotta/20 pl-5">
                    <h3 className="font-serif italic text-lg text-charcoal mb-1">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Exhibitions & CV ──────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-charcoal/[0.02] border-t border-charcoal/5">
        <div ref={cvRef} className={`container mx-auto max-w-5xl transition-all duration-1000 ease-luxury ${cvVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* Exhibitions */}
            <div>
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-8">Exhibitions</span>
              <div className="space-y-5">
                {EXHIBITIONS.map((ex, i) => (
                  <div key={i} className="flex gap-5 border-b border-charcoal/5 pb-5 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 text-right w-10">
                      <span className="text-xs text-muted/60">{ex.year}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-charcoal leading-tight">{ex.title}</p>
                      <p className="text-xs text-muted mt-0.5">{ex.venue}</p>
                    </div>
                    <span className={`text-label uppercase tracking-widest flex-shrink-0 mt-0.5 ${
                      ex.type === 'Solo' ? 'text-terracotta' : 'text-muted/50'
                    }`}>
                      {ex.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              {/* Collections */}
              <div>
                <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6">Collections</span>
                <ul className="space-y-3">
                  {COLLECTIONS.map((c, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-charcoal/70">
                      <span className="w-1 h-1 rounded-full bg-terracotta/60 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Press */}
              <div>
                <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-6">Press & Publications</span>
                <div className="space-y-4">
                  {PRESS.map((p, i) => (
                    <div key={i} className="flex items-start justify-between gap-4 border-b border-charcoal/5 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm text-charcoal leading-tight">{p.title}</p>
                        <p className="text-xs text-muted mt-0.5">{p.outlet} · {p.year}</p>
                      </div>
                      <span className="text-label text-muted/50 uppercase tracking-widest flex-shrink-0">{p.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Studio Photos ─────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 bg-parchment/20 border-t border-charcoal/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-label uppercase tracking-[0.3em] text-terracotta block mb-4">Inside the Studio</span>
              <h2 className="font-serif text-4xl md:text-5xl text-charcoal" style={{ letterSpacing: '-0.015em', lineHeight: '1.0' }}>
                Where the work begins
              </h2>
            </div>
            <p className="text-sm text-muted max-w-xs">
              Maseru, Lesotho · The studio sits at 1,600m above sea level. The light changes everything.
            </p>
          </div>

          {/* Asymmetric photo grid */}
          <div className="grid grid-cols-12 gap-4 md:gap-5">
            {/* Large left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="col-span-12 md:col-span-7 relative aspect-[4/3] overflow-hidden group"
            >
              <img src="/artportfolio.jpg" alt="Maseru studio — morning light" draggable={false}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1400ms] ease-luxury" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-5">
                <p className="font-serif italic text-white/90 text-sm">Morning, before the work starts</p>
                <p className="text-white/50 text-xs mt-0.5 uppercase tracking-widest">Maseru Studio</p>
              </div>
            </motion.div>

            {/* Right column: two stacked */}
            <div className="col-span-12 md:col-span-5 flex flex-col gap-4 md:gap-5">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative aspect-[3/2] overflow-hidden group"
              >
                <img src="/artportfolio.jpg" alt="Clay work in progress" draggable={false}
                  className="w-full h-full object-cover object-[50%_30%] group-hover:scale-[1.04] transition-transform duration-[1400ms] ease-luxury" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4">
                  <p className="font-serif italic text-white/80 text-xs">Clay at the wheel</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.28, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative aspect-[3/2] overflow-hidden group"
              >
                <img src="/artportfolio.jpg" alt="Resin canvas process" draggable={false}
                  className="w-full h-full object-cover object-[60%_50%] group-hover:scale-[1.04] transition-transform duration-[1400ms] ease-luxury" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4">
                  <p className="font-serif italic text-white/80 text-xs">Resin layers, mid-process</p>
                </div>
              </motion.div>
            </div>

            {/* Bottom row: three equal */}
            {[
              { caption: 'Pigments from the highland earth', pos: '50% 60%' },
              { caption: 'Glazing before the kiln', pos: '40% 50%' },
              { caption: 'Charcoal studies at dusk', pos: '50% 40%' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="col-span-12 md:col-span-4 relative aspect-[4/3] overflow-hidden group"
              >
                <img src="/artportfolio.jpg" alt={item.caption} draggable={false}
                  className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-[1200ms] ease-luxury"
                  style={{ objectPosition: item.pos }} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent pointer-events-none" />
                <p className="absolute bottom-3 left-3 right-3 font-serif italic text-white/80 text-xs">{item.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Philosophy quote ───────────────────────────────── */}
      <section className="py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="w-px h-16 bg-terracotta/20 mx-auto mb-8" />
          <blockquote className="font-serif text-3xl md:text-4xl italic text-charcoal/80 leading-relaxed mb-8" style={{ letterSpacing: '-0.01em' }}>
            "The strength that exists in each of us. A grief followed by an encounter can open up an infinite world. My art is the record of that opening."
          </blockquote>
          <p className="text-xs font-sans uppercase tracking-[0.25em] text-muted">— Mapheane</p>
          <div className="w-px h-16 bg-terracotta/20 mx-auto mt-8" />
        </div>
      </section>

      {/* ── Navigation CTAs ────────────────────────────────── */}
      <section className="py-16 px-6 md:px-12 border-t border-charcoal/5">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'View the Portfolio',  page: 'gallery',    desc: 'Original works available'    },
              { label: 'Commission a Work',   page: 'commission', desc: 'Bespoke artworks for you'    },
              { label: 'Workshop Bookings',   page: 'workshops',  desc: 'Learn in the Maseru studio'  },
            ].map(cta => (
              <button key={cta.page} onClick={() => onNavigate(cta.page)}
                className="group flex flex-col items-start p-6 border border-charcoal/8 hover:border-terracotta/30 hover:shadow-card-hover transition-all duration-400">
                <span className="text-xs font-sans uppercase tracking-widest text-muted mb-1 group-hover:text-terracotta transition-colors">{cta.desc}</span>
                <span className="font-serif italic text-xl text-charcoal group-hover:text-terracotta transition-colors">{cta.label}</span>
                <ArrowRight className="w-4 h-4 text-muted mt-3 group-hover:text-terracotta group-hover:translate-x-1 transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
