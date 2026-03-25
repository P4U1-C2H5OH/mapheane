import React from 'react';

const ITEMS = [
  'Mixed Media on Resin Canvas',
  'Lesotho · Southern Africa',
  'Glazed Stoneware Sculpture',
  'Charcoal & Graphite Drawing',
  'Commissions Open',
  'Contemporary Painting',
  'Studio Workshops',
  'Limited Print Editions',
  'Kingdom in the Sky',
  'Original Works Available',
];

export function MarqueeSection() {
  // Double items for seamless loop
  const track = [...ITEMS, ...ITEMS];

  return (
    <div className="py-7 border-y border-charcoal/6 overflow-hidden bg-parchment/40 relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee-slow" aria-hidden="true">
        {track.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center gap-4 px-6"
          >
            <span className="font-serif italic text-xl md:text-2xl text-charcoal/60 whitespace-nowrap">
              {item}
            </span>
            {/* Diamond separator */}
            <span className="text-terracotta/40 text-xs">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}
