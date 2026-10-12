import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    auth
      .restoreSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (data) => setUser(await auth.login(data)), []);
  const signUp = useCallback(async (data) => setUser(await auth.register(data)), []);
  const signOut = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, []);
  const update = useCallback(async (patch) => setUser(await auth.updateProfile(user.id, patch)), [user]);
  const changePassword = useCallback((current, next) => auth.changePassword(user.id, current, next), [user]);
  const removeAccount = useCallback(async () => {
    await auth.deleteAccount(user.id);
    setUser(null);
  }, [user]);

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut, update, changePassword, removeAccount }),
    [user, ready, signIn, signUp, signOut, update, changePassword, removeAccount]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
