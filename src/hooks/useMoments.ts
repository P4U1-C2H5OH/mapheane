import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MomentType, MomentMedia } from '../data/moments';

const MOMENTS_CACHE_KEY = 'mapheane_moments_cache';
let cachedMoments: DbMoment[] | null = null;
let inFlight: Promise<DbMoment[]> | null = null;

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

function readCache(): DbMoment[] {
  if (cachedMoments) return cachedMoments;
  try {
    const saved = localStorage.getItem(MOMENTS_CACHE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    cachedMoments = parsed.filter((moment: any) => typeof moment?.id === 'string');
    return cachedMoments;
  } catch {
    return [];
  }
}

function writeCache(moments: DbMoment[]) {
  cachedMoments = moments;
  try {
    localStorage.setItem(MOMENTS_CACHE_KEY, JSON.stringify(moments));
  } catch {
    // Best-effort resilience only; Supabase remains the source of truth.
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchMomentsWithRetry() {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await supabase
      .from('moments')
      .select('*')
      .order('date', { ascending: false });

    if (!error) {
      const next = (data ?? []).map(mapRow);
      writeCache(next);
      return next;
    }

    lastError = error;
    await delay(350 * (attempt + 1));
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to load moments from Supabase.');
}

export function useMoments() {
  const [moments, setMoments] = useState<DbMoment[]>(() => readCache());
  const [loading, setLoading] = useState(() => readCache().length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!inFlight) {
      inFlight = fetchMomentsWithRetry().finally(() => {
        inFlight = null;
      });
    }

    inFlight
      .then(next => {
        if (!active) return;
        setMoments(next);
        setError(null);
        setLoading(false);
      }).catch(err => {
        if (!active) return;
        const fallback = readCache();
        setMoments(fallback);
        setError(err instanceof Error ? err.message : 'Failed to load moments.');
        setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return { moments, loading, error };
}
