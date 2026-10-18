import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import * as backend from '../services/donationsApi';

const DataContext = createContext(null);
const POLL_MS = 15000;

// Los datos viven en el backend: aquí se cargan, se refrescan cada pocos segundos
// (así donante y receptor ven los cambios del otro) y se exponen las acciones.
export function DataProvider({ children }) {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [d, n] = await Promise.all([backend.listDonations(), backend.listNotifications()]);
      setDonations(d);
      setNotifications(n);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setReady(true);
    }
  }, []);

  const userId = user ? user.id : null;
  const active = useRef(true);
  useEffect(() => {
    if (!userId) {
      setDonations([]);
      setNotifications([]);
      setError(null);
      setReady(true);
      return undefined;
    }
    setReady(false);
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

  const value = useMemo(
    () => ({ donations, notifications, ready, error, refresh, publish, reserve, startPickup, confirmDelivery, cancel, markAllRead, resetDemo }),
    [donations, notifications, ready, error, refresh, publish, reserve, startPickup, confirmDelivery, cancel, markAllRead, resetDemo]
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
