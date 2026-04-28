import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ArrowRight, Camera, Heart, Sparkles } from 'lucide-react';
import { momentTypeLabels } from '../data/moments';
import { useMoments } from '../hooks/useMoments';

interface ArtistMomentsSectionProps {
  onNavigate?: (page: 'moments') => void;
}

export function ArtistMomentsSection({ onNavigate }: ArtistMomentsSectionProps) {
  const { ref, isVisible } = useScrollReveal(0.2);
  const { moments, loading } = useMoments();
  const latestMoments = moments.slice(0, 3);
  const hasDbMoments = latestMoments.length > 0;
  const momentCountLabel = loading && moments.length === 0
    ? 'Loading Moments'
    : `${moments.length} Moments`;

  return (
    <section
      id="moments"
      className="py-24 md:py-32 w-full bg-cream relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl -z-0"></div>

      <div ref={ref} className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content - Left */}
          <div
            className={`lg:col-span-5 order-2 lg:order-1 transition-all duration-1000 ease-out transform ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-6 h-6 text-terracotta" />
              <span className="text-sm tracking-[0.2em] uppercase text-terracotta">
                Behind the Canvas
              </span>
            </div>

            <h2 className="font-serif text-5xl md:text-6xl text-charcoal mb-6">
              Artist Moments
            </h2>

            <div className="space-y-6 max-w-md">
              <p className="text-charcoal/80 font-light leading-relaxed text-lg">
                Step into my creative world. From studio sessions to exhibition openings,
                these moments capture the journey behind each piece.
              </p>
              <p className="text-muted font-light leading-relaxed">
                Photo journals, process videos, and candid glimpses of the artistic
                life—raw, authentic, and unfiltered.
              </p>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-terracotta" />
                  <span className="text-sm text-muted">{momentCountLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sage" />
                  <span className="text-sm text-muted">Updated Weekly</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate?.('moments')}
                className="inline-flex items-center gap-2 text-charcoal border-b-2 border-charcoal pb-1 hover:text-terracotta hover:border-terracotta transition-colors duration-300 mt-8 group"
              >
                <span className="text-sm tracking-widest uppercase font-medium">
                  Explore All Moments
                </span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Image Grid - Right */}
          <div
            className={`lg:col-span-7 order-1 lg:order-2 transition-all duration-1000 delay-200 ease-out transform ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
            }`}
          >
            <div className="grid grid-cols-2 gap-4 ml-auto max-w-2xl">
              {hasDbMoments ? (
                <>
                  {/* Large featured image — latest DB moment */}
                  <div className="col-span-2 relative aspect-[16/10] overflow-hidden group cursor-pointer"
                    onClick={() => onNavigate?.('moments')}>
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500 z-10 pointer-events-none" />
                    <img
                      src={latestMoments[0].media?.[0]?.url || '/Image 5.png'}
                      alt={latestMoments[0].media?.[0]?.alt || latestMoments[0].title}
                      draggable={false}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                    <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm px-3 py-1.5">
                      <p className="text-label uppercase tracking-[0.2em] text-charcoal">
                        {momentTypeLabels[latestMoments[0].type]} · {latestMoments[0].title}
                      </p>
                    </div>
                  </div>

                  {/* Two smaller images */}
                  {latestMoments.slice(1).map((moment) => (
                    <div key={moment.id} className="relative aspect-square overflow-hidden group cursor-pointer"
                      onClick={() => onNavigate?.('moments')}>
                      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500 z-10 pointer-events-none" />
                      <img
                        src={moment.media?.[0]?.url || '/artportfolio.jpg'}
                        alt={moment.media?.[0]?.alt || moment.title}
                        draggable={false}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                      <div className="absolute bottom-3 left-3 z-20 bg-background/90 backdrop-blur-sm px-2.5 py-1">
                        <p className="text-label uppercase tracking-[0.2em] text-charcoal">
                          {momentTypeLabels[moment.type]}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {/* Placeholder images when no DB moments yet */}
                  <div className="col-span-2 relative aspect-[16/10] overflow-hidden group cursor-pointer"
                    onClick={() => onNavigate?.('moments')}>
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500 z-10 pointer-events-none" />
                    <img src="/Image 5.png" alt="Studio Moment" draggable={false}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm px-3 py-1.5">
                      <p className="text-label uppercase tracking-[0.2em] text-charcoal">Studio · Latest Session</p>
                    </div>
                  </div>

                  <div className="relative aspect-square overflow-hidden group cursor-pointer"
                    onClick={() => onNavigate?.('moments')}>
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500 z-10 pointer-events-none" />
                    <img src="/Fruits.jpg" alt="Process" draggable={false}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    <div className="absolute bottom-3 left-3 z-20 bg-background/90 backdrop-blur-sm px-2.5 py-1">
                      <p className="text-label uppercase tracking-[0.2em] text-charcoal">Process</p>
                    </div>
                  </div>

                  <div className="relative aspect-square overflow-hidden group cursor-pointer"
                    onClick={() => onNavigate?.('moments')}>
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500 z-10 pointer-events-none" />
                    <img src="/exhibition_1.jpg" alt="Exhibition" draggable={false}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    <div className="absolute bottom-3 left-3 z-20 bg-background/90 backdrop-blur-sm px-2.5 py-1">
                      <p className="text-label uppercase tracking-[0.2em] text-charcoal">Exhibition</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
