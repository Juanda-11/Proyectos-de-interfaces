import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { DEFAULT_LOCATION } from '../services/config';
import { getUserLocation } from '../services/geo';

const LocationContext = createContext(null);

// La ubicación se pide solo cuando una pantalla la necesita (no al abrir la app).
export function LocationProvider({ children }) {
  const [state, setState] = useState({ coords: DEFAULT_LOCATION, granted: false, loading: false, asked: false });
  const inflight = useRef(false);

  const request = useCallback(async (force = false) => {
    if (inflight.current) return;
    inflight.current = true;
    setState((s) => (s.asked && !force ? s : { ...s, loading: true }));
    const { coords, granted } = await getUserLocation();
    setState({ coords, granted, loading: false, asked: true });
    inflight.current = false;
  }, []);

  const value = useMemo(() => ({ ...state, request }), [state, request]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useLocation = () => useContext(LocationContext);
