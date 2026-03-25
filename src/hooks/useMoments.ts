import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MomentType, MomentMedia } from '../data/moments';

export interface DbMoment {
  id: string;
  title: string;
  date: string;
  type: MomentType;
  excerpt: string;
  content: string;
  media: MomentMedia[];
  tags: string[];
  featured: boolean;
  location?: string;
  mood?: string;
}

function mapRow(row: Record<string, unknown>): DbMoment {
  return {
    id:       row.id as string,
    title:    (row.title    as string)  ?? '',
    date:     (row.date     as string)  ?? '',
    type:     ((row.type    ?? 'studio') as MomentType),
    excerpt:  (row.excerpt  as string)  ?? '',
    content:  (row.content  as string)  ?? '',
    media:    Array.isArray(row.media)  ? (row.media as MomentMedia[]) : [],
    tags:     Array.isArray(row.tags)   ? (row.tags  as string[])      : [],
    featured: !!(row.featured as boolean | undefined),
    location: (row.location as string | undefined) ?? undefined,
    mood:     (row.mood     as string | undefined) ?? undefined,
  };
}

export function useMoments() {
  const [moments, setMoments] = useState<DbMoment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('moments')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) setMoments(data.map(mapRow));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { moments, loading };
}
