import { CATEGORIES, CATEGORY_ICONS, STAGES, computeImpact, isFinal, isMine } from '../src/services/donations';

const donor = { id: 'd1', role: 'donor' };
const receiver = { id: 'r1', role: 'receiver' };
const d = (over) => ({ id: 'x', donorId: 'd1', receiverId: 'r1', status: 'collected', kg: 2, ...over });

describe('isMine / isFinal', () => {
  test('el donante ve las suyas y el receptor las que reservó', () => {
    expect(isMine(d(), donor)).toBe(true);
    expect(isMine(d({ donorId: 'otro' }), donor)).toBe(false);
    expect(isMine(d(), receiver)).toBe(true);
    expect(isMine(d({ receiverId: null }), receiver)).toBe(false);
  });
  test('estados finales', () => {
    expect(isFinal(d({ status: 'collected' }))).toBe(true);
    expect(isFinal(d({ status: 'cancelled' }))).toBe(true);
    expect(isFinal(d({ status: 'reserved' }))).toBe(false);
  });
});

describe('computeImpact', () => {
  const list = [
    d({ id: '1', kg: 3 }),
    d({ id: '2', kg: 5, receiverId: 'r2' }),
    d({ id: '3', kg: 4, status: 'reserved' }),
    d({ id: '4', kg: 9, status: 'cancelled' }),
  ];
  test('solo cuenta entregas completadas del usuario', () => {
    const out = computeImpact(list, donor);
    expect(out.kg).toBe(8);
    expect(out.deliveries).toBe(2);
    expect(out.allies).toBe(2);
    expect(out.people).toBe(24);
    expect(out.co2).toBe(20);
  });
  test('para el receptor usa sus propias entregas', () => {
    const out = computeImpact(list, receiver);
    expect(out.kg).toBe(3);
    expect(out.allies).toBe(1);
  });
  test('sin entregas todo es cero', () => {
    expect(computeImpact([], donor)).toEqual({ kg: 0, deliveries: 0, allies: 0, people: 0, co2: 0 });
  });
});

describe('constantes', () => {
  test('cuatro etapas en orden y un icono por categoría', () => {
    expect(STAGES).toEqual(['available', 'reserved', 'onTheWay', 'collected']);
    CATEGORIES.forEach((c) => expect(CATEGORY_ICONS[c]).toBeTruthy());
  });
});
