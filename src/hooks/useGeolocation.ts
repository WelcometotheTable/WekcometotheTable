import { useEffect, useState } from 'react';

export interface Coords {
  readonly latitude: number;
  readonly longitude: number;
}

export type GeoState =
  | { readonly status: 'idle' | 'requesting' | 'denied' | 'unavailable' }
  | { readonly status: 'ready'; readonly coords: Coords };

// Third Ward fallback centroid when location is denied/unavailable.
const FALLBACK: Coords = { latitude: 29.7238, longitude: -95.385 };

export function useGeolocation(): { geo: GeoState; fallback: Coords } {
  const [geo, setGeo] = useState<GeoState>({ status: 'idle' });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeo({ status: 'unavailable' });
      return;
    }
    setGeo({ status: 'requesting' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          status: 'ready',
          coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        });
      },
      () => { setGeo({ status: 'denied' }); },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  return { geo, fallback: FALLBACK };
}
