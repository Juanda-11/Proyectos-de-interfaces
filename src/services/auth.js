import * as Crypto from 'expo-crypto';
import { KEYS, loadJSON, removeKey, saveJSON } from './storage';

// Cuentas locales: guardadas en el dispositivo con la contraseña cifrada (SHA-256 + sal).
// La interfaz de este módulo (register / login / logout / ...) permite cambiarlo
// por un backend real (Supabase, Firebase...) sin tocar las pantallas.

const normalize = (email) => String(email).trim().toLowerCase();
const hash = (password, salt) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
const randomSalt = () => Crypto.randomUUID();

export class AuthError extends Error {
  constructor(code, extra) {
    super(code);
    this.code = code;
    this.extra = extra;
  }
}

const publicUser = ({ passwordHash, salt, ...rest }) => rest;

async function seedDemoUsers() {
  const users = await loadJSON(KEYS.users, null);
  if (users) return users;
  const mk = async (id, name, email, role, phone, address) => {
    const salt = randomSalt();
    return {
      id, name, email, role, phone, address, salt,
      passwordHash: await hash('demo1234', salt),
      createdAt: new Date('2026-08-15T10:00:00Z').toISOString(),
    };
  };
  const seeded = [
    await mk('demo-receiver', 'Juan Pérez', 'receptor@foodlink.app', 'receiver', '300 123 4567', 'Centro, Pasto'),
    await mk('demo-donor', 'Panadería La 14', 'donante@foodlink.app', 'donor', '300 765 4321', 'Calle 14 #22-10, Pasto'),
  ];
  await saveJSON(KEYS.users, seeded);
  return seeded;
}

export const DEMO_ACCOUNTS = {
  receiver: { email: 'receptor@foodlink.app', password: 'demo1234' },
  donor: { email: 'donante@foodlink.app', password: 'demo1234' },
};

export async function restoreSession() {
  const users = await seedDemoUsers();
  const id = await loadJSON(KEYS.session, null);
  const user = users.find((u) => u.id === id);
  return user ? publicUser(user) : null;
}

export async function register({ name, email, password, role }) {
  const users = await seedDemoUsers();
  const mail = normalize(email);
  if (users.some((u) => u.email === mail)) throw new AuthError('exists');
  const salt = randomSalt();
  const user = {
    id: `u-${Crypto.randomUUID()}`,
    name: name.trim(),
    email: mail,
    role,
    phone: '',
    address: '',
    salt,
    passwordHash: await hash(password, salt),
    createdAt: new Date().toISOString(),
  };
  await saveJSON(KEYS.users, [...users, user]);
  await saveJSON(KEYS.session, user.id);
  return publicUser(user);
}

export async function login({ email, password, role }) {
  const users = await seedDemoUsers();
  const user = users.find((u) => u.email === normalize(email));
  if (!user || (await hash(password, user.salt)) !== user.passwordHash) throw new AuthError('credentials');
  if (role && user.role !== role) throw new AuthError('role', user.role);
  await saveJSON(KEYS.session, user.id);
  return publicUser(user);
}

export async function logout() {
  await removeKey(KEYS.session);
}

export async function updateProfile(id, patch) {
  const users = await seedDemoUsers();
  const next = users.map((u) => (u.id === id ? { ...u, ...patch } : u));
  await saveJSON(KEYS.users, next);
  return publicUser(next.find((u) => u.id === id));
}

export async function changePassword(id, current, next) {
  const users = await seedDemoUsers();
  const user = users.find((u) => u.id === id);
  if (!user || (await hash(current, user.salt)) !== user.passwordHash) throw new AuthError('current');
  const salt = randomSalt();
  const passwordHash = await hash(next, salt);
  await saveJSON(KEYS.users, users.map((u) => (u.id === id ? { ...u, salt, passwordHash } : u)));
}

export async function deleteAccount(id) {
  const users = await seedDemoUsers();
  await saveJSON(KEYS.users, users.filter((u) => u.id !== id));
  await removeKey(KEYS.session);
}
