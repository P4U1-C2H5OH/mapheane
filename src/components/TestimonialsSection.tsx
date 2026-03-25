import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote: "The commission process felt like a true collaboration — Mapheane understood not just what I described, but what I meant. The work now holds a place of honour in our home.",
    name: 'Tsepiso M.',
    location: 'Maseru, Lesotho',
    context: 'Commission client',
  },
  {
    quote: "I bought my first original work online, which I thought I'd never do. But the detail, the provenance, the care in the packing — it arrived as something that will outlast me.",
    name: 'Claire V.',
    location: 'Brussels, Belgium',
    context: 'Gallery collector',
  },
  {
    quote: "I commissioned a charcoal portrait as a gift. The emotion in it left my mother speechless. Worth every Rand and every week of the wait.",
    name: 'Nomvula K.',
    location: 'Johannesburg, South Africa',
    context: 'Commission client',
  },
  {
    quote: "The workshop was unlike anything I expected. I left with something I'd made — and a different understanding of why someone devotes a life to this.",
    name: 'James F.',
    location: 'Cape Town, South Africa',
    context: 'Workshop participant',
  },
  {
    quote: "When I visited the studio in Maseru, I realised the work only makes sense there. The highland light, the materials, the silence — it is all inside each piece.",
    name: 'Amina T.',
    location: 'Paris, France',
    context: 'Collector · Studio visit',
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    timer.current = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 6000);
  };

  useEffect(() => {
    start();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const go = (i: number) => {
    if (timer.current) clearInterval(timer.current);
    setActive(i);
    start();
  };

  const t = TESTIMONIALS[active];

  return (
    <section className="py-28 px-6 md:px-12 bg-parchment/30 border-y border-charcoal/5 overflow-hidden relative">
      {/* Ghost serif background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="font-serif text-[18vw] leading-none text-charcoal/[0.025] italic">Words</span>
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-label uppercase tracking-[0.3em] text-terracotta block text-center mb-14"
        >
          Collector Words
        </motion.span>

        <div className="relative min-h-[220px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full text-center"
            >
              <blockquote
                className="font-serif text-2xl md:text-3xl italic text-charcoal/80 leading-relaxed mb-8 mx-auto max-w-3xl"
                style={{ letterSpacing: '-0.01em' }}
              >
                "{t.quote}"
              </blockquote>

              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-px bg-terracotta/40" />
                <div className="text-center">
                  <p className="text-sm font-sans text-charcoal">{t.name}</p>
                  <p className="text-xs text-muted uppercase tracking-[0.18em] mt-0.5">
                    {t.location} · {t.context}
                  </p>
                </div>
                <div className="w-8 h-px bg-terracotta/40" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot nav */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={`transition-all duration-400 ${
                i === active
                  ? 'w-8 h-1.5 bg-terracotta'
                  : 'w-1.5 h-1.5 rounded-full bg-charcoal/20 hover:bg-charcoal/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
