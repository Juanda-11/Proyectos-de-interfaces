import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import es from './es';
import en from './en';
import { KEYS, loadJSON, saveJSON } from '../services/storage';

const dictionaries = { es, en };
const I18nContext = createContext(null);

function detectLanguage() {
  try {
    const nav = Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.language : '';
    return String(nav).toLowerCase().startsWith('en') ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

function lookup(dict, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), dict);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage());

  useEffect(() => {
    loadJSON(KEYS.lang, null).then((saved) => {
      if (saved === 'es' || saved === 'en') setLangState(saved);
    });
  }, []);

  const setLang = useCallback((next) => {
    setLangState(next);
    saveJSON(KEYS.lang, next);
  }, []);

  const t = useCallback(
    (path, vars) => {
      let text = lookup(dictionaries[lang], path);
      if (typeof text !== 'string') text = lookup(dictionaries.es, path);
      if (typeof text !== 'string') return path;
      if (vars) Object.keys(vars).forEach((k) => (text = text.split(`{${k}}`).join(String(vars[k]))));
      return text;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
