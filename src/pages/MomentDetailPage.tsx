import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Tag, Share2, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMoments } from '../hooks/useMoments';
import { momentTypeLabels, MomentType } from '../data/moments';

interface MomentDetailPageProps {
  momentId: string;
  onNavigate: (page: any) => void;
  onSelectMoment: (id: string) => void;
}

export function MomentDetailPage({ momentId, onNavigate, onSelectMoment }: MomentDetailPageProps) {
  const { moments } = useMoments();
  const moment = moments.find(m => m.id === momentId);
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [momentId]);

  if (!moment) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-charcoal mb-4">Moment Not Found</h1>
          <button
            onClick={() => onNavigate('moments')}
            className="text-terracotta hover:underline"
          >
            Return to Moments
          </button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: moment.title, text: moment.excerpt, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTypeColor = (type: MomentType) => {
    const colors: Record<MomentType, string> = {
      studio: 'bg-clay',
      exhibition: 'bg-terracotta',
      process: 'bg-sage',
      travel: 'bg-gold',
      inspiration: 'bg-charcoal',
      personal: 'bg-muted'
    };
    return colors[type];
  };

  // Get related moments (same type, excluding current)
  const relatedMoments = moments
    .filter(m => m.type === moment.type && m.id !== moment.id)
    .slice(0, 3);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % moment.media.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + moment.media.length) % moment.media.length);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-background min-h-screen w-full pt-32 pb-20 px-6 md:px-12"
      >
        <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('moments')}
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-muted hover:text-charcoal transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Moments
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12"
          >
            {/* Type Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`${getTypeColor(moment.type)} text-white px-4 py-2 text-xs tracking-wider uppercase`}>
                {momentTypeLabels[moment.type]}
              </span>
              {moment.featured && (
                <span className="bg-terracotta text-white px-4 py-2 text-xs tracking-wider uppercase">
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-serif text-4xl md:text-6xl text-charcoal mb-6 leading-tight">
              {moment.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(moment.date)}</span>
              </div>
              {moment.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{moment.location}</span>
                </div>
              )}
              {moment.mood && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="italic">{moment.mood}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center gap-2 px-4 py-2 border border-charcoal/20 hover:border-terracotta transition-colors group"
              >
                <Heart 
                  className={`w-4 h-4 transition-all ${
                    isLiked ? 'fill-terracotta text-terracotta' : 'text-charcoal group-hover:text-terracotta'
                  }`}
                />
                <span className="text-sm">{isLiked ? 'Loved' : 'Love this'}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-charcoal/20 hover:border-terracotta hover:text-terracotta transition-colors" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </motion.div>

          {/* Hero Media */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-12"
          >
            {moment.media?.[0]?.type === 'video' ? (
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-charcoal">
                <video
                  src={moment.media[0].url}
                  poster={moment.media[0].thumbnail}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                  aria-label={moment.media[0].alt}
                />
              </div>
            ) : (
              <div
                onClick={() => openLightbox(0)}
                className="relative w-full aspect-[16/10] overflow-hidden cursor-pointer group"
              >
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500 z-10" />
                <img
                  src={moment.media[0].url}
                  alt={moment.media[0].alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}
            {moment.media[0].caption && (
              <p className="text-sm text-muted italic mt-3 text-center">
                {moment.media[0].caption}
              </p>
            )}
          </motion.div>

          {/* Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="prose prose-lg max-w-none mb-16"
          >
            <div className="text-charcoal/80 font-light leading-relaxed space-y-6">
              {moment.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.article>

          {/* Additional Media Gallery */}
          {moment.media.length > 1 && (
            <div className="mb-16">
              <h3 className="font-serif text-2xl text-charcoal mb-6">More from this moment</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {moment.media.slice(1).map((media, index) => (
                  <div
                    key={index}
                    onClick={() => openLightbox(index + 1)}
                    className="relative aspect-square overflow-hidden cursor-pointer group bg-charcoal/5"
                  >
                    {media.type === 'video' ? (
                      <>
                        <img
                          src={media.thumbnail || media.url}
                          alt={media.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center group-hover:bg-terracotta/90 transition-colors duration-300">
                            <svg className="w-4 h-4 text-charcoal group-hover:text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-500 z-10" />
                        <img
                          src={media.url}
                          alt={media.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {moment.tags.length > 0 && (
            <div className="mb-16 pb-16 border-b border-charcoal/10">
              <div className="flex flex-wrap gap-2">
                {moment.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-charcoal/5 text-charcoal text-sm hover:bg-terracotta/10 hover:text-terracotta transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Moments */}
          {relatedMoments.length > 0 && (
            <div>
              <h3 className="font-serif text-3xl text-charcoal mb-8">More {momentTypeLabels[moment.type]} Moments</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedMoments.map((related) => (
                  <div
                    key={related.id}
                    onClick={() => onSelectMoment(related.id)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden mb-3">
                      <img
                        src={related.media[0].url}
                        alt={related.media[0].alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="font-serif text-xl text-charcoal group-hover:text-terracotta transition-colors line-clamp-2">
                      {related.title}
                    </h4>
                    <p className="text-sm text-muted mt-2">{formatDate(related.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/95 z-[100] flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white hover:text-terracotta transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {moment.media.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-6 text-white hover:text-terracotta transition-colors"
                >
                  <ChevronLeft className="w-12 h-12" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-6 text-white hover:text-terracotta transition-colors"
                >
                  <ChevronRight className="w-12 h-12" />
                </button>
              </>
            )}

            <div
              className="max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {moment.media[currentImageIndex].type === 'video' ? (
                <video
                  src={moment.media[currentImageIndex].url}
                  poster={moment.media[currentImageIndex].thumbnail}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[80vh] object-contain"
                  aria-label={moment.media[currentImageIndex].alt}
                />
              ) : (
                <img
                  src={moment.media[currentImageIndex].url}
                  alt={moment.media[currentImageIndex].alt}
                  className="w-full h-full object-contain"
                />
              )}
              {moment.media[currentImageIndex].caption && (
                <p className="text-white text-center mt-4 text-sm">
                  {moment.media[currentImageIndex].caption}
                </p>
              )}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentImageIndex + 1} / {moment.media.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
