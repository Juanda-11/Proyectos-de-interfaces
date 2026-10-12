import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BackHandler, Platform } from 'react-native';

const RouterContext = createContext(null);

// Router mínimo basado en pila. Las pestañas principales reinician la pila.
export const TABS = ['home', 'explore', 'publish', 'map', 'activity', 'profile'];

export function RouterProvider({ initial = 'home', children }) {
  const [stack, setStack] = useState([{ name: initial, params: {} }]);
  const current = stack[stack.length - 1];

  const go = useCallback((name, params = {}) => {
    setStack((s) => (TABS.includes(name) ? [{ name, params }] : [...s, { name, params }]));
  }, []);
  const replace = useCallback((name, params = {}) => {
    setStack((s) => [...s.slice(0, -1), { name, params }]);
  }, []);
  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);
  const reset = useCallback((name = 'home', params = {}) => setStack([{ name, params }]), []);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, back]);

  const value = useMemo(
    () => ({ screen: current.name, params: current.params, canGoBack: stack.length > 1, go, replace, back, reset }),
    [current, stack.length, go, replace, back, reset]
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);
