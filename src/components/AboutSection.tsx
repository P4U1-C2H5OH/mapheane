import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  onNavigate?: (page: any) => void;
}

export function AboutSection({ onNavigate }: AboutSectionProps) {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <section id="about" className="py-24 md:py-32 w-full bg-parchment/30 relative overflow-hidden border-y border-charcoal/5">
      {/* Ambient warm glow */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none -z-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 100% 50%, rgba(196,149,106,0.04) 0%, transparent 60%)' }} />

      <div ref={ref} className="relative z-10 container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* Portrait */}
          <div className={`lg:col-span-6 transition-all duration-1000 ease-luxury ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
            <div className="relative w-full aspect-[4/5] overflow-hidden group shadow-artwork group-hover:shadow-artwork-hover transition-shadow duration-500 artwork-container">
              <div className="absolute inset-0 bg-terracotta/0 group-hover:bg-terracotta/10 transition-colors duration-700 z-10 pointer-events-none" />
              <img
                src="/Img9.png"
                alt="Mapheane — Contemporary Artist"
                draggable={false}
                className="w-full h-full object-cover object-[20%_30%] filter saturate-[0.92] group-hover:saturate-100 group-hover:scale-[1.03] transition-all duration-700"
              />
              {/* Location tag */}
              <div className="absolute bottom-5 left-5 z-20">
                <span className="bg-background/90 backdrop-blur-sm px-3 py-1.5 text-label uppercase tracking-[0.2em] text-charcoal">
                  Maseru · Lesotho
                </span>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className={`lg:col-span-6 transition-all duration-1000 delay-200 ease-luxury ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>

            {/* Big name */}
            <h2 className="font-serif text-7xl md:text-9xl italic text-charcoal mb-2 leading-none" style={{ letterSpacing: '-0.025em' }}>
              Mapheane
            </h2>
            <p className="text-label uppercase tracking-[0.25em] text-terracotta mb-10">Contemporary Artist · Kingdom of Lesotho</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <span className="text-label uppercase tracking-[0.2em] text-terracotta font-medium block mb-4">
                  Who am I?
                </span>
                <h3 className="font-serif text-2xl italic text-charcoal leading-snug" style={{ letterSpacing: '-0.01em' }}>
                  A story of resilience,<br />rooted in the mountains.
                </h3>
              </div>

              <div className="space-y-5">
                <p className="text-muted leading-relaxed text-sm">
                  Born and working in Maseru, Lesotho — the Mountain Kingdom. My practice spans mixed media painting on resin canvas, charcoal and graphite drawing, and glazed stoneware sculpture.
                </p>
                <p className="text-muted leading-relaxed text-sm">
                  Each work begins with a question about the body, about memory, about what the earth holds and what it releases. The resin seals what the brushstroke begins. The clay remembers the hand that shaped it.
                </p>

                <button
                  onClick={() => onNavigate?.('about')}
                  className="inline-flex items-center gap-3 text-charcoal hover:text-terracotta transition-colors duration-300 group mt-2"
                >
                  <span className="text-xs font-sans uppercase tracking-[0.2em] border-b border-charcoal/20 pb-px group-hover:border-terracotta transition-colors">
                    Full Biography & CV
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Medium tags */}
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-charcoal/6">
              {['Mixed Media on Resin Canvas', 'Charcoal & Graphite', 'Glazed Stoneware', 'Site-Specific Work'].map(tag => (
                <span key={tag} className="badge border-charcoal/12 text-muted hover:border-terracotta/40 hover:text-charcoal transition-all duration-300 text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
