import * as ImageManipulator from 'expo-image-manipulator';
import { API_BASE } from './config';

export class AnalysisError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // 'unavailable' | 'notFood' | 'failed'
  }
}

// Reduce la foto antes de enviarla (más rápido, más barato y bajo el límite de Vercel).
async function prepareImage(uri) {
  const out = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1024 } }], {
    compress: 0.6,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });
  return { base64: out.base64, uri: out.uri };
}

export async function analyzeFood(uri, lang) {
  const { base64 } = await prepareImage(uri);
  let res;
  try {
    res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mediaType: 'image/jpeg', lang }),
    });
  } catch {
    throw new AnalysisError('failed');
  }
  if (res.status === 503 || res.status === 404) throw new AnalysisError('unavailable');
  if (!res.ok) throw new AnalysisError('failed');
  const data = await res.json();
  if (data.isFood === false) throw new AnalysisError('notFood');
  return data;
}

// Miniatura ligera (data URI) para guardar junto a la donación sin llenar el almacenamiento.
export async function makeThumbnail(uri) {
  try {
    const out = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 360 } }], {
      compress: 0.5,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return `data:image/jpeg;base64,${out.base64}`;
  } catch {
    return null;
  }
}
