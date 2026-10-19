import fs from 'fs';
import path from 'path';
import es from '../src/i18n/es';
import en from '../src/i18n/en';

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]));

const esFlat = Object.fromEntries(flatten(es));
const enFlat = Object.fromEntries(flatten(en));
const vars = (s) => (s.match(/\{(\w+)\}/g) || []).sort().join(',');

describe('diccionarios es/en', () => {
  test('tienen exactamente las mismas claves', () => {
    expect(Object.keys(enFlat).sort()).toEqual(Object.keys(esFlat).sort());
  });
  test('ninguna traducción está vacía', () => {
    for (const [k, v] of [...Object.entries(esFlat), ...Object.entries(enFlat)]) {
      expect(typeof v).toBe('string');
      expect(v.trim().length).toBeGreaterThan(0);
      expect(k).toBeTruthy();
    }
  });
  test('usan las mismas variables {x} en ambos idiomas', () => {
    for (const k of Object.keys(esFlat)) expect([k, vars(enFlat[k])]).toEqual([k, vars(esFlat[k])]);
  });
});

describe('uso de claves en el código', () => {
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : [];
    });
  const source = walk(path.join(__dirname, '../src')).map((f) => fs.readFileSync(f, 'utf8')).join('\n');

  test('todas las claves literales t("...") existen', () => {
    const used = [...source.matchAll(/\bt\(\s*'([\w.]+)'/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThan(50);
    expect(used.filter((k) => !(k in esFlat))).toEqual([]);
  });
  test('las claves con prefijo dinámico tienen todas sus variantes', () => {
    const prefixes = [...source.matchAll(/t\(`([\w.]+?)\$\{/g)].map((m) => m[1]);
    for (const prefix of new Set(prefixes)) {
      expect(Object.keys(esFlat).some((k) => k.startsWith(prefix))).toBe(true);
    }
  });
});
