import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Edition {
  id: string;
  artworkId: string | null;
  title: string;
  medium: string;
  year: number | null;
  type: 'Limited' | 'Open' | 'Artist Proof';
  size: string;
  paper: string;
  editionSize: number | null;
  editionSold: number;
  price: { zar: number; eur: number };
  image: string;
  available: boolean;
  description: string;
}

function mapEditionRow(row: Record<string, unknown>): Edition {
  return {
    id:          row.id as string,
    artworkId:   (row.artwork_id as string | null) ?? null,
    title:       (row.title       as string) ?? '',
    medium:      (row.medium      as string) ?? 'Archival Giclée',
    year:        (row.year        as number | null) ?? null,
    type:        ((row.type ?? 'Limited') as Edition['type']),
    size:        (row.size        as string) ?? '',
    paper:       (row.paper       as string) ?? '',
    editionSize: (row.edition_size as number | null) ?? null,
    editionSold: (row.edition_sold as number) ?? 0,
    price: {
      eur: (row.price_eur as number) ?? 0,
      zar: (row.price_zar as number) ?? Math.round(((row.price_eur as number) ?? 0) * 18),
    },
    image:       (row.image_url   as string) ?? '',
    available:   (row.available   as boolean) ?? true,
    description: (row.description as string) ?? '',
  };
}

export function useEditions() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase
      .from('editions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEditions(data.map(mapEditionRow));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { editions, setEditions, loading };
}

export { mapEditionRow };
