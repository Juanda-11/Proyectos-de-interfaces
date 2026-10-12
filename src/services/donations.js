import { DEFAULT_LOCATION } from './config';

// Orden de las etapas del seguimiento.
export const STAGES = ['available', 'reserved', 'onTheWay', 'collected'];
export const CATEGORIES = ['bakery', 'fruits', 'vegetables', 'meals', 'dairy', 'other'];

export const CATEGORY_ICONS = {
  bakery: 'nutrition-outline',
  fruits: 'leaf-outline',
  vegetables: 'flower-outline',
  meals: 'restaurant-outline',
  dairy: 'water-outline',
  other: 'basket-outline',
};

export const CATEGORY_TONES = { bakery: 'orange', fruits: 'green', vegetables: 'green', meals: 'purple', dairy: 'blue', other: 'green' };

const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

// Donaciones de ejemplo alrededor de Pasto.
export function seedDonations() {
  return [
    {
      id: 'seed-1', title: 'Pan artesanal', category: 'bakery', qty: '12 unidades', kg: 3,
      donorId: 'demo-donor', donorName: 'Panadería La 14', receiverId: null,
      lat: DEFAULT_LOCATION.lat + 0.004, lng: DEFAULT_LOCATION.lng + 0.003,
      address: 'Calle 14 #22-10, Pasto', shelfLifeDays: 1, freshness: 'good', ai: true,
      notes: 'Disponible hasta las 7:00 PM.', code: 'FL-2026-084', status: 'available',
      createdAt: hoursAgo(2), history: { available: hoursAgo(2) },
    },
    {
      id: 'seed-2', title: 'Frutas mixtas', category: 'fruits', qty: '8 kg', kg: 8,
      donorId: 'demo-donor', donorName: 'Fruver El Campo', receiverId: 'demo-receiver',
      lat: DEFAULT_LOCATION.lat - 0.006, lng: DEFAULT_LOCATION.lng + 0.008,
      address: 'Plaza de Mercado El Potrerillo', shelfLifeDays: 2, freshness: 'fair', ai: true,
      notes: 'Maduración avanzada, ideal para jugos.', code: 'FL-2026-085', status: 'reserved',
      createdAt: hoursAgo(5), history: { available: hoursAgo(5), reserved: hoursAgo(3) },
    },
    {
      id: 'seed-3', title: 'Arroz preparado', category: 'meals', qty: '20 porciones', kg: 6,
      donorId: 'demo-donor', donorName: 'Restaurante Sabor Nariñense', receiverId: 'demo-receiver',
      lat: DEFAULT_LOCATION.lat + 0.009, lng: DEFAULT_LOCATION.lng - 0.006,
      address: 'Carrera 27 #18-40, Pasto', shelfLifeDays: 1, freshness: 'good', ai: false,
      notes: 'Mantener refrigerado.', code: 'FL-2026-086', status: 'onTheWay',
      createdAt: hoursAgo(7), history: { available: hoursAgo(7), reserved: hoursAgo(5), onTheWay: hoursAgo(1) },
    },
    {
      id: 'seed-4', title: 'Verduras frescas', category: 'vegetables', qty: '5 kg', kg: 5,
      donorId: 'demo-donor', donorName: 'Supermercado Central', receiverId: 'demo-receiver',
      lat: DEFAULT_LOCATION.lat - 0.003, lng: DEFAULT_LOCATION.lng - 0.009,
      address: 'Avenida Idema, Pasto', shelfLifeDays: 3, freshness: 'good', ai: true,
      notes: '', code: 'FL-2026-080', status: 'collected',
      createdAt: hoursAgo(50), history: { available: hoursAgo(50), reserved: hoursAgo(48), onTheWay: hoursAgo(47), collected: hoursAgo(46) },
    },
    {
      id: 'seed-5', title: 'Yogures y quesos', category: 'dairy', qty: '15 unidades', kg: 4,
      donorId: 'demo-donor', donorName: 'Lácteos Doña Rosa', receiverId: null,
      lat: DEFAULT_LOCATION.lat + 0.012, lng: DEFAULT_LOCATION.lng + 0.011,
      address: 'Barrio Lorenzo, Pasto', shelfLifeDays: 4, freshness: 'good', ai: true,
      notes: 'Cadena de frío garantizada.', code: 'FL-2026-087', status: 'available',
      createdAt: hoursAgo(1), history: { available: hoursAgo(1) },
    },
  ];
}

export function newCode() {
  return `FL-2026-${String(Math.floor(100 + Math.random() * 900)).padStart(3, '0')}`;
}

export const isFinal = (d) => d.status === 'collected' || d.status === 'cancelled';

export const isMine = (d, user) => (user.role === 'donor' ? d.donorId === user.id : d.receiverId === user.id);

// Estadísticas de impacto calculadas a partir de las entregas completadas del usuario.
export function computeImpact(donations, user) {
  const done = donations.filter((d) => isMine(d, user) && d.status === 'collected');
  const kg = done.reduce((sum, d) => sum + (Number(d.kg) || 0), 0);
  const allies = new Set(done.map((d) => (user.role === 'donor' ? d.receiverId : d.donorId)).filter(Boolean)).size;
  return {
    kg: Math.round(kg * 10) / 10,
    deliveries: done.length,
    allies,
    people: Math.round(kg * 3),
    co2: Math.round(kg * 2.5 * 10) / 10,
  };
}
