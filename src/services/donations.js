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
