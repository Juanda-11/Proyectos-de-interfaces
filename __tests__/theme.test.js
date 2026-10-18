import { darkColors, lightColors } from '../src/theme/colors';

describe('paletas', () => {
  test('claro y oscuro definen los mismos tokens', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });
  test('los modos están etiquetados', () => {
    expect(lightColors.mode).toBe('light');
    expect(darkColors.mode).toBe('dark');
  });
  test('el fondo cambia entre temas', () => {
    expect(lightColors.bg).not.toBe(darkColors.bg);
  });
});
