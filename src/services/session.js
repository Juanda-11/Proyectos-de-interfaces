import { KEYS, loadJSON, removeKey, saveJSON } from './storage';

// El token de sesión que entrega el backend se guarda en el dispositivo.
let cached = null;

export async function getToken() {
  if (cached === null) cached = await loadJSON(KEYS.token, '');
  return cached || null;
}

export async function setToken(token) {
  cached = token;
  await saveJSON(KEYS.token, token);
}

export async function clearToken() {
  cached = '';
  await removeKey(KEYS.token);
}
