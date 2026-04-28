import { useSEO } from '../hooks/useSEO';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Tag, Heart } from 'lucide-react';
import { useMoments, DbMoment } from '../hooks/useMoments';
import { MomentType } from '../data/moments';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { trackInteraction } from '../lib/interactions';

interface MomentsPageProps {
  onNavigate: (page: any) => void;
  onSelectMoment: (id: string) => void;
}

const momentTypeLabels: Record<MomentType, string> = {
  studio: 'Studio',
  exhibition: 'Exhibition',
  process: 'Process',
  travel: 'Travel',
  inspiration: 'Inspiration',
  personal: 'Personal'
};

export function MomentsPage({ onNavigate, onSelectMoment }: MomentsPageProps) {
  const { moments, loading, error } = useMoments();
  const [selectedType, setSelectedType] = useState<MomentType | 'all'>('all');
  const [likedMoments, setLikedMoments] = useState<Set<string>>(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredMoments = selectedType === 'all'
    ? moments
    : moments.filter(m => m.type === selectedType);

  const sortedMoments = [...filteredMoments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleLike = (moment: DbMoment) => {
    const liked = likedMoments.has(moment.id);
    setLikedMoments(prev => {
      const newSet = new Set(prev);
      if (liked) {
        newSet.delete(moment.id);
      } else {
        newSet.add(moment.id);
      }
      return newSet;
    });
    trackInteraction({
      action: liked ? 'moment_unlike' : 'moment_like',
      targetType: 'moment',
      targetId: moment.id,
      targetTitle: moment.title,
      source: 'moments_page',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-background min-h-screen w-full pt-32 pb-20 px-6 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <button
            onClick={() => onNavigate('home')}
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-muted hover:text-charcoal transition-colors mb-12 self-start"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-xs md:text-sm tracking-[0.3em] uppercase text-terracotta mb-4 block">
              Behind the Canvas
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-charcoal mb-8">
              Artist Moments
            </h1>
            <p className="text-charcoal/80 font-light text-lg leading-relaxed">
              A collection of moments, memories, and musings from the studio and beyond. 
              The stories behind the art, the process, the struggle, and the joy.
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 pb-8 border-b border-charcoal/10">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-6 py-2 text-sm tracking-wider uppercase transition-all ${
              selectedType === 'all'
                ? 'bg-terracotta text-white'
                : 'bg-white text-charcoal hover:bg-charcoal/5 border border-charcoal/10'
            }`}
          >
            All Moments
          </button>
          {(Object.keys(momentTypeLabels) as MomentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 text-sm tracking-wider uppercase transition-all ${
                selectedType === type
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-charcoal hover:bg-charcoal/5 border border-charcoal/10'
              }`}
            >
              {momentTypeLabels[type]}
            </button>
          ))}
        </div>

        {/* Moments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedMoments.map((moment, index) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              index={index}
              isLiked={likedMoments.has(moment.id)}
              onLike={() => toggleLike(moment)}
              onClick={() => onSelectMoment(moment.id)}
            />
          ))}
        </div>

        {loading && sortedMoments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted text-lg">Loading moments...</p>
          </div>
        )}

        {!loading && error && sortedMoments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted text-lg">Unable to load moments. Please refresh.</p>
          </div>
        )}

        {!loading && !error && sortedMoments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted text-lg">No moments found in this category.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface MomentCardProps {
  moment: DbMoment;
  index: number;
  isLiked: boolean;
  onLike: () => void;
  onClick: () => void;
}

function MomentCard({ moment, index, isLiked, onLike, onClick }: MomentCardProps) {
  const { ref, isVisible } = useScrollReveal(0.1);
  
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
      studio: 'bg-clay text-white',
      exhibition: 'bg-terracotta text-white',
      process: 'bg-sage text-white',
      travel: 'bg-gold text-charcoal',
      inspiration: 'bg-charcoal text-white',
      personal: 'bg-muted text-white'
    };
    return colors[type];
  };

  return (
    <div
      ref={ref}
      className={`group cursor-pointer transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div 
        onClick={onClick}
        className="relative w-full aspect-[4/5] overflow-hidden mb-4"
      >
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-all duration-500 z-10"></div>
        
        {/* Featured badge */}
        {moment.featured && (
          <div className="absolute top-4 right-4 z-20 bg-terracotta text-white px-3 py-1 text-xs tracking-wider uppercase">
            Featured
          </div>
        )}

        {/* Type badge */}
        <div className={`absolute top-4 left-4 z-20 ${getTypeColor(moment.type)} px-3 py-1 text-xs tracking-wider uppercase`}>
          {momentTypeLabels[moment.type]}
        </div>

        <img
          src={moment.media?.[0]?.url || '/artportfolio.jpg'}
          alt={moment.media?.[0]?.alt || moment.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="absolute bottom-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
        >
          <Heart 
            className={`w-5 h-5 transition-all ${
              isLiked ? 'fill-terracotta text-terracotta' : 'text-charcoal'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div onClick={onClick} className="space-y-3">
        <h3 className="font-serif text-2xl text-charcoal group-hover:text-terracotta transition-colors line-clamp-2">
          {moment.title}
        </h3>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(moment.date)}</span>
          </div>
          {moment.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{moment.location}</span>
            </div>
          )}
          {moment.mood && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{moment.mood}</span>
            </div>
          )}
        </div>

        <p className="text-charcoal/70 font-light leading-relaxed line-clamp-3">
          {moment.excerpt}
        </p>

        <div className="pt-2">
          <span className="text-sm text-terracotta tracking-wider uppercase border-b border-transparent group-hover:border-terracotta transition-all inline-block">
            Read More →
          </span>
        </div>
      </div>
    </div>
  );
}
