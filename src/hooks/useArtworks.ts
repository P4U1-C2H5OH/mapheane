import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Artwork } from '../data/artworks';

function mapRow(row: Record<string, unknown>): Artwork {
  return {
    id:           (row.id as string),
    title:        (row.title        as string) ?? '',
    dimensions:   (row.dimensions   as string) ?? '',
    technique:    (row.technique    as string) ?? '',
    medium:       ((row.medium ?? 'Painting') as Artwork['medium']),
    status:       ((row.status ?? 'Available') as Artwork['status']),
    cropPosition: (row.crop_position as string) ?? '50% 50%',
    offsetClass:  (row.offset_class  as string) ?? 'mt-0',
    price:        (row.price_eur     as number) ?? 0,
    description:  (row.description  as string) ?? '',
    images:       Array.isArray(row.images) ? (row.images as string[]) : [],
    year:         (row.year as number | undefined) ?? undefined,
    statement:    (row.statement as string | undefined) ?? undefined,
    video:        (row.video     as string | undefined) ?? undefined,
  };
}

export function useArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setArtworks(data.map(mapRow));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { artworks, loading };
}
