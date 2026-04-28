import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { eurToZar } from '../lib/pricing';

const EDITIONS_CACHE_KEY = 'mapheane_editions_cache';
let cachedEditions: Edition[] | null = null;
let inFlight: Promise<Edition[]> | null = null;

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
      zar: (row.price_zar as number) ?? eurToZar((row.price_eur as number) ?? 0),
    },
    image:       (row.image_url   as string) ?? '',
    available:   (row.available   as boolean) ?? true,
    description: (row.description as string) ?? '',
  };
}

function readCache(): Edition[] {
  if (cachedEditions) return cachedEditions;
  try {
    const saved = localStorage.getItem(EDITIONS_CACHE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    cachedEditions = parsed.filter((edition: any) => typeof edition?.id === 'string');
    return cachedEditions;
  } catch {
    return [];
  }
}

function writeCache(editions: Edition[]) {
  cachedEditions = editions;
  try {
    localStorage.setItem(EDITIONS_CACHE_KEY, JSON.stringify(editions));
  } catch {
    // Best-effort resilience only; Supabase remains the source of truth.
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchEditionsWithRetry() {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await supabase
      .from('editions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      const next = (data ?? []).map(mapEditionRow);
      writeCache(next);
      return next;
    }

    lastError = error;
    await delay(350 * (attempt + 1));
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to load editions from Supabase.');
}

export function useEditions() {
  const [editions, setEditionsState] = useState<Edition[]>(() => readCache());
  const [loading, setLoading]   = useState(() => readCache().length === 0);
  const [error, setError] = useState<string | null>(null);

  const setEditions = (next: Edition[] | ((prev: Edition[]) => Edition[])) => {
    setEditionsState(prev => {
      const resolved = typeof next === 'function'
        ? (next as (prev: Edition[]) => Edition[])(prev)
        : next;
      writeCache(resolved);
      return resolved;
    });
  };

  useEffect(() => {
    let active = true;

    if (!inFlight) {
      inFlight = fetchEditionsWithRetry().finally(() => {
        inFlight = null;
      });
    }

    inFlight
      .then(next => {
        if (!active) return;
        setEditionsState(next);
        setError(null);
        setLoading(false);
      }).catch(err => {
        if (!active) return;
        const fallback = readCache();
        setEditionsState(fallback);
        setError(err instanceof Error ? err.message : 'Failed to load editions.');
        setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { editions, setEditions, loading, error };
}

export { mapEditionRow };
