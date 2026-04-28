import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Artwork } from '../data/artworks';

const ARTWORK_CACHE_KEY = 'mapheane_artworks_cache';
let cachedArtworks: Artwork[] | null = null;
let inFlight: Promise<Artwork[]> | null = null;

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

function readCache(): Artwork[] {
  if (cachedArtworks) return cachedArtworks;
  try {
    const saved = localStorage.getItem(ARTWORK_CACHE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    cachedArtworks = parsed.filter((a: any) => typeof a?.id === 'string');
    return cachedArtworks;
  } catch {
    return [];
  }
}

function writeCache(artworks: Artwork[]) {
  cachedArtworks = artworks;
  try {
    localStorage.setItem(ARTWORK_CACHE_KEY, JSON.stringify(artworks));
  } catch {
    // Best-effort resilience only; Supabase remains the source of truth.
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchArtworksWithRetry() {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      const next = (data ?? []).map(mapRow);
      writeCache(next);
      return next;
    }

    lastError = error;
    await delay(350 * (attempt + 1));
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to load artworks from Supabase.');
}

export function useArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>(() => readCache());
  const [loading, setLoading] = useState(() => readCache().length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!inFlight) {
      inFlight = fetchArtworksWithRetry().finally(() => {
        inFlight = null;
      });
    }

    inFlight
      .then(next => {
        if (!active) return;
        setArtworks(next);
        setError(null);
        setLoading(false);
      }).catch(err => {
        if (!active) return;
        const fallback = readCache();
        setArtworks(fallback);
        setError(err instanceof Error ? err.message : 'Failed to load artworks.');
        setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { artworks, loading, error };
}
