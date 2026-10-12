import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from './colors';
import { KEYS, loadJSON, saveJSON } from '../services/storage';

const ThemeContext = createContext(null);

// preference: 'system' | 'light' | 'dark'
export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState('system');

  useEffect(() => {
    loadJSON(KEYS.theme, 'system').then(setPreference);
  }, []);

  const mode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const colors = mode === 'dark' ? darkColors : lightColors;

  const choose = useCallback((next) => {
    setPreference(next);
    saveJSON(KEYS.theme, next);
  }, []);

  const toggle = useCallback(() => choose(mode === 'dark' ? 'light' : 'dark'), [mode, choose]);

  const value = useMemo(
    () => ({ colors, mode, preference, setPreference: choose, toggle }),
    [colors, mode, preference, choose, toggle]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// Crea los estilos una sola vez por paleta.
export function useStyles(factory) {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
