import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { KEYS, loadJSON, saveJSON } from '../services/storage';
import { STAGES, newCode, seedDonations } from '../services/donations';

const DataContext = createContext(null);
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function DataProvider({ children }) {
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const [d, n] = await Promise.all([loadJSON(KEYS.donations, null), loadJSON(KEYS.notifications, [])]);
      setDonations(d || seedDonations());
      setNotifications(n);
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded.current) saveJSON(KEYS.donations, donations);
  }, [donations]);
  useEffect(() => {
    if (loaded.current) saveJSON(KEYS.notifications, notifications);
  }, [notifications]);

  const notify = useCallback((userId, type, donation) => {
    if (!userId) return;
    setNotifications((list) =>
      [{ id: uid(), userId, type, donationId: donation.id, title: donation.title, createdAt: new Date().toISOString(), read: false }, ...list].slice(0, 60)
    );
  }, []);

  const patch = useCallback((id, fn) => setDonations((list) => list.map((d) => (d.id === id ? fn(d) : d))), []);

  const publish = useCallback(
    (draft, user) => {
      const donation = {
        id: uid(),
        donorId: user.id,
        donorName: user.name,
        receiverId: null,
        status: 'available',
        code: newCode(),
        createdAt: new Date().toISOString(),
        history: { available: new Date().toISOString() },
        ...draft,
      };
      setDonations((list) => [donation, ...list]);
      notify(user.id, 'published', donation);
      return donation;
    },
    [notify]
  );

  const advance = useCallback(
    (donation, to, receiverId) => {
      patch(donation.id, (d) => ({
        ...d,
        status: to,
        receiverId: receiverId ?? d.receiverId,
        history: { ...d.history, [to]: new Date().toISOString() },
      }));
      notify(donation.donorId, to, donation);
      if (to === 'collected' && donation.receiverId) notify(donation.receiverId, to, donation);
    },
    [patch, notify]
  );

  const reserve = useCallback((donation, user) => advance(donation, 'reserved', user.id), [advance]);
  const startPickup = useCallback((donation) => advance(donation, 'onTheWay'), [advance]);
  // El receptor debe ingresar el código del donante para cerrar la entrega.
  const confirmDelivery = useCallback(
    (donation, code) => {
      if (String(code).trim().toUpperCase() !== donation.code.toUpperCase()) return false;
      advance(donation, 'collected');
      return true;
    },
    [advance]
  );
  const cancel = useCallback(
    (donation) => {
      patch(donation.id, (d) => ({ ...d, status: 'cancelled', history: { ...d.history, cancelled: new Date().toISOString() } }));
      notify(donation.donorId, 'cancelled', donation);
      if (donation.receiverId) notify(donation.receiverId, 'cancelled', donation);
    },
    [patch, notify]
  );

  const markAllRead = useCallback(
    (userId) => setNotifications((list) => list.map((n) => (n.userId === userId ? { ...n, read: true } : n))),
    []
  );
  const resetDemo = useCallback(() => {
    setDonations(seedDonations());
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({ donations, notifications, ready, publish, reserve, startPickup, confirmDelivery, cancel, markAllRead, resetDemo }),
    [donations, notifications, ready, publish, reserve, startPickup, confirmDelivery, cancel, markAllRead, resetDemo]
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
export { STAGES };
