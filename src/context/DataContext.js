import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import * as backend from '../services/donationsApi';

const DataContext = createContext(null);
const POLL_MS = 15000;
const EMPTY = [];

// Los datos viven en el backend: aquí se cargan, se refrescan cada pocos segundos
// (así donante y receptor ven los cambios del otro) y se exponen las acciones.
export function DataProvider({ children }) {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadedFor, setLoadedFor] = useState(null); // id del usuario cuyos datos ya se intentaron cargar
  const [error, setError] = useState(null);
  const userId = user ? user.id : null;
  const userIdRef = useRef(userId);

  const refresh = useCallback(async () => {
    try {
      const [d, n] = await Promise.all([backend.listDonations(), backend.listNotifications()]);
      setDonations(d);
      setNotifications(n);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoadedFor(userIdRef.current);
    }
  }, []);

  const active = useRef(true);
  useEffect(() => {
    userIdRef.current = userId;
    if (!userId) return undefined;
    refresh();
    const timer = setInterval(() => active.current && refresh(), POLL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      active.current = state === 'active';
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [userId, refresh]);

  // Reemplaza (o agrega) una donación devuelta por el backend sin esperar al siguiente refresco.
  const upsert = useCallback((donation) => {
    setDonations((list) => (list.some((d) => d.id === donation.id) ? list.map((d) => (d.id === donation.id ? donation : d)) : [donation, ...list]));
    return donation;
  }, []);
  const syncNotifications = useCallback(() => backend.listNotifications().then(setNotifications).catch(() => {}), []);

  const run = useCallback(
    async (action) => {
      const donation = upsert(await action());
      syncNotifications();
      return donation;
    },
    [upsert, syncNotifications]
  );

  const publish = useCallback((draft) => run(() => backend.createDonation(draft)), [run]);
  const reserve = useCallback((donation) => run(() => backend.reserveDonation(donation.id)), [run]);
  const startPickup = useCallback((donation) => run(() => backend.startPickup(donation.id)), [run]);
  const cancel = useCallback((donation) => run(() => backend.cancelDonation(donation.id)), [run]);

  // El receptor debe escribir el código del donante: devuelve false si no coincide.
  const confirmDelivery = useCallback(
    async (donation, code) => {
      try {
        await run(() => backend.deliverDonation(donation.id, code));
        return true;
      } catch (e) {
        if (e.code === 'wrong_code') return false;
        throw e;
      }
    },
    [run]
  );

  const markAllRead = useCallback(async () => {
    await backend.markNotificationsRead();
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));
  }, []);

  const resetDemo = useCallback(async () => {
    await backend.resetDemoData();
    await refresh();
  }, [refresh]);

  // Sin sesión no se exponen datos (ni de una cuenta anterior); 'ready' espera la primera carga.
  const signedIn = !!userId;
  const ready = !signedIn || loadedFor === userId;
  const value = useMemo(
    () => ({ donations: signedIn ? donations : EMPTY, notifications: signedIn ? notifications : EMPTY, ready, error: signedIn ? error : null, refresh, publish, reserve, startPickup, confirmDelivery, cancel, markAllRead, resetDemo }),
    [signedIn, donations, notifications, ready, error, refresh, publish, reserve, startPickup, confirmDelivery, cancel, markAllRead, resetDemo]
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
