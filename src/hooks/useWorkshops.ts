import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DbWorkshop {
  id: string;
  title: string;
  medium: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  capacity: number;
  price: { local: string; intl: string };
  status: 'upcoming' | 'full' | 'past' | 'draft';
  description: string;
  materials: string[];
}

function mapRow(row: Record<string, unknown>): DbWorkshop {
  return {
    id:          row.id as string,
    title:       (row.title       as string) ?? '',
    medium:      (row.medium      as string) ?? '',
    date:        (row.date        as string) ?? '',
    time:        (row.time        as string) ?? '',
    duration:    (row.duration    as string) ?? '',
    location:    (row.location    as string) ?? '',
    capacity:    (row.capacity    as number) ?? 8,
    price: {
      local: (row.price_local as string) ?? '',
      intl:  (row.price_intl  as string) ?? '',
    },
    status:      ((row.status ?? 'upcoming') as DbWorkshop['status']),
    description: (row.description as string) ?? '',
    materials:   Array.isArray(row.materials) ? (row.materials as string[]) : [],
  };
}

export function useWorkshops() {
  const [workshops, setWorkshops] = useState<DbWorkshop[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let active = true;

    async function loadWorkshops() {
      const { data } = await supabase
        .from('workshops')
        .select('*')
        .order('date', { ascending: true });

      if (!active) return;
      if (data) setWorkshops(data.map(mapRow));
      setLoading(false);
    }

    loadWorkshops().catch(() => {
      if (active) {
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, []);

  return { workshops, loading };
}
