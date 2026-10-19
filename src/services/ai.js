import * as ImageManipulator from 'expo-image-manipulator';
import { api } from './api';

export class AnalysisError extends Error {
  constructor(code, detail) {
    super(code);
    this.code = code; // 'unavailable' | 'notFood' | 'failed'
    this.detail = detail;
  }
}

// Reduce la foto antes de enviarla (más rápido, más barato y dentro del límite de tamaño del servidor).
async function prepareImage(uri) {
  const out = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1024 } }], {
    compress: 0.6,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });
  return { base64: out.base64, uri: out.uri };
}

// Envía la foto al backend (/api/analyze, que usa Gemini o Claude) y devuelve el análisis.
export async function analyzeFood(uri, lang) {
  const { base64 } = await prepareImage(uri);
  let data;
  try {
    data = await api.post('/analyze', { image: base64, mediaType: 'image/jpeg', lang });
  } catch (e) {
    if (e.code === 'ai_not_configured') throw new AnalysisError('unavailable');
    const detail = [e.code, e.status || '', e.details && e.details.detail].filter(Boolean).join(' · ');
    throw new AnalysisError('failed', detail);
  }
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
