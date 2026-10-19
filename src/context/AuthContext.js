import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '../services/auth';
import { setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

// status: 'loading' (comprobando sesión) | 'ready' | 'offline' (no se pudo contactar al backend)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const restore = useCallback(async () => {
    setStatus('loading');
    try {
      setUser(await auth.restoreSession());
      setStatus('ready');
    } catch {
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    restore();
    // Si el backend dice que el token ya no vale, se cierra la sesión local.
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, [restore]);

  const signIn = useCallback(async (data) => setUser(await auth.login(data)), []);
  const signUp = useCallback(async (data) => setUser(await auth.register(data)), []);
  const signOut = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, []);
  const update = useCallback(async (patch) => setUser(await auth.updateProfile(patch)), []);
  const changePassword = useCallback((current, next) => auth.changePassword(current, next), []);
  const removeAccount = useCallback(async () => {
    await auth.deleteAccount();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready: status !== 'loading', offline: status === 'offline', retry: restore, signIn, signUp, signOut, update, changePassword, removeAccount }),
    [user, status, restore, signIn, signUp, signOut, update, changePassword, removeAccount]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
