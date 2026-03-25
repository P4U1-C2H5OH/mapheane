import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
  width?: number;
  height?: number;
  /** Aspect ratio as CSS value e.g. "3/4" — used for skeleton sizing */
  aspectRatio?: string;
  /** Object position for artwork framing */
  objectPosition?: string;
  onLoad?: () => void;
  onClick?: () => void;
}

/**
 * Intersection-observer-based lazy image with blur-up placeholder.
 * Replaces direct <img> on all artwork images for zero layout shift.
 */
export function LazyImage({
  src,
  alt,
  className = '',
  style,
  draggable = false,
  aspectRatio,
  objectPosition,
  onLoad,
  onClick,
}: LazyImageProps) {
  const [loaded,  setLoaded]  = useState(false);
  const [entered, setEntered] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Intersection observer — start loading when 100px from viewport
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setEntered(true); observer.disconnect(); } },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden w-full h-full"
      style={aspectRatio ? { aspectRatio } : undefined}
      aria-label={alt}
    >
      {/* Skeleton shimmer shown until loaded */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-parchment"
          style={{
            background: 'linear-gradient(90deg, #EDE8E0 0%, #F5F0EB 50%, #EDE8E0 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.6s ease-in-out infinite',
          }}
        />
      )}

      {/* Actual image */}
      {entered && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={draggable}
          onLoad={handleLoad}
          onClick={onClick}
          className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ ...style, objectPosition: objectPosition }}
        />
      )}

      {/* Global shimmer keyframes — injected once */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}
