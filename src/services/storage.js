import AsyncStorage from '@react-native-async-storage/async-storage';

// Lecturas/escrituras tolerantes a fallos (modo privado, almacenamiento bloqueado, etc.).
export async function loadJSON(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento: la app sigue funcionando en memoria */
  }
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export const KEYS = {
  theme: 'foodlink.theme',
  lang: 'foodlink.lang',
  token: 'foodlink.token',
  prefs: 'foodlink.prefs',
};
