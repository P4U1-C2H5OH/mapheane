import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Clock, AlertCircle } from 'lucide-react';

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  hours: string;
  note?: string | null;
  primary?: boolean;
  lat: number;
  lng: number;
}

interface PickupMapProps {
  points: PickupPoint[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Lightweight Leaflet map for pickup point selection.
 * Falls back to a styled list if Leaflet fails to load (e.g. CSP).
 */
export function PickupMap({ points, selectedId, onSelect }: PickupMapProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObj    = useRef<any>(null);
  const markers   = useRef<Record<string, any>>({});
  const [ready, setReady]     = useState(false);
  const [failed, setFailed]   = useState(false);

  useEffect(() => {
    if (mapObj.current || !mapRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => initMap();
    script.onerror = () => setFailed(true);
    document.head.appendChild(script);

    return () => {
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    };
  }, []);

  const initMap = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current) { setFailed(true); return; }

    const maseru = points.find(p => p.primary) ?? points[0];
    const map = L.map(mapRef.current, {
      center: [maseru.lat, maseru.lng],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom pin icon using SVG
    const makeIcon = (active: boolean) => L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;
        background:${active ? '#A0522D' : '#9E9890'};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        transition:background 0.2s;
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    points.forEach(pt => {
      const marker = L.marker([pt.lat, pt.lng], { icon: makeIcon(pt.id === selectedId) })
        .addTo(map)
        .on('click', () => onSelect(pt.id));
      marker.bindTooltip(pt.name, { permanent: false, direction: 'top' });
      markers.current[pt.id] = marker;
    });

    mapObj.current = map;
    setReady(true);
  };

  // Update marker styles when selection changes
  useEffect(() => {
    if (!ready || !(window as any).L) return;
    const L = (window as any).L;
    points.forEach(pt => {
      const m = markers.current[pt.id];
      if (!m) return;
      const active = pt.id === selectedId;
      m.setIcon(L.divIcon({
        className: '',
        html: `<div style="
          width:28px;height:28px;
          background:${active ? '#A0522D' : '#9E9890'};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:2px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          transition:background 0.2s;
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      }));
      if (active && mapObj.current) {
        mapObj.current.flyTo([pt.lat, pt.lng], 14, { duration: 0.8 });
      }
    });
  }, [selectedId, ready]);

  const selected = points.find(p => p.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Map canvas — or fallback */}
      {!failed ? (
        <div
          ref={mapRef}
          className="w-full border border-charcoal/10 overflow-hidden"
          style={{ height: 280, borderRadius: 0 }}
          aria-label="Pickup point map"
        >
          {!ready && (
            <div className="flex items-center justify-center h-full bg-parchment/40">
              <div className="w-5 h-5 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-parchment/30 border border-charcoal/10 p-4 text-center">
          <MapPin className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-xs text-muted">Map unavailable — select a point below</p>
        </div>
      )}

      {/* Point list */}
      <div className="space-y-2">
        {points.map(pt => (
          <button
            key={pt.id}
            type="button"
            onClick={() => onSelect(pt.id)}
            className={`w-full p-4 border-2 text-left transition-all duration-250 ${
              selectedId === pt.id
                ? 'border-sage bg-sage/5'
                : 'border-charcoal/10 hover:border-charcoal/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-4 h-4 border rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedId === pt.id ? 'border-sage' : 'border-charcoal/25'
              }`}>
                {selectedId === pt.id && <div className="w-2.5 h-2.5 bg-sage rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-sm font-sans font-500 text-charcoal">{pt.name}</p>
                  {pt.primary && (
                    <span className="text-[10px] bg-terracotta text-white px-1.5 py-0.5 uppercase tracking-widest">Studio</span>
                  )}
                </div>
                <div className="flex items-start gap-1.5 mb-1">
                  <MapPin className="w-3 h-3 text-muted/60 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted">{pt.address}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-muted/60 flex-shrink-0" />
                  <p className="text-xs text-muted">{pt.hours}</p>
                </div>
                {pt.note && (
                  <p className="text-xs text-terracotta/70 italic mt-1.5">{pt.note}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected point summary */}
      {selected && (
        <div className="bg-sage/8 border border-sage/20 p-3 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-sans font-500 text-charcoal">{selected.name}</p>
            <p className="text-xs text-muted">{selected.hours}</p>
            {selected.note && (
              <p className="text-xs text-terracotta/70 italic mt-0.5">{selected.note}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
