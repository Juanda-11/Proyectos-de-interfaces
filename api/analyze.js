// Función serverless de Vercel: analiza la foto de un alimento con un modelo de visión.
// Proveedores (la clave nunca llega al cliente):
//   - Gemini  → variable GEMINI_API_KEY (tiene plan gratuito en Google AI Studio)
//   - Claude  → variable ANTHROPIC_API_KEY
// Si están las dos se usa Gemini; se puede forzar con AI_PROVIDER=gemini|anthropic.

const PROVIDERS = {
  gemini: {
    key: () => process.env.GEMINI_API_KEY,
    // Se prueban en orden hasta que uno exista para la clave configurada.
    models: () => [process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'].filter(Boolean),
  },
  anthropic: {
    key: () => process.env.ANTHROPIC_API_KEY,
    models: () => [process.env.ANTHROPIC_MODEL, 'claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-haiku-4-5', 'claude-sonnet-4-5'].filter(Boolean),
  },
};

function pickProvider() {
  const forced = process.env.AI_PROVIDER;
  if (forced && PROVIDERS[forced]?.key()) return forced;
  return ['gemini', 'anthropic'].find((name) => PROVIDERS[name].key()) || null;
}

// Cada llamador devuelve { ok, status, text?, detail? }.
async function callGemini({ model, apiKey, system, image, mediaType }) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ inline_data: { mime_type: mediaType, data: image } }, { text: 'Analyze this food photo and return the JSON.' }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 2048 },
    }),
  });
  if (!response.ok) return { ok: false, status: response.status, detail: await response.text() };
  const data = await response.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  if (!text) return { ok: false, status: 502, detail: `empty response (${data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason || 'unknown'})` };
  return { ok: true, text };
}

async function callAnthropic({ model, apiKey, system, image, mediaType }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mediaType, data: image } }, { type: 'text', text: 'Analyze this food photo and return the JSON.' }] }],
    }),
  });
  if (!response.ok) return { ok: false, status: response.status, detail: await response.text() };
  const data = await response.json();
  return { ok: true, text: (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('') };
}

const CALLERS = { gemini: callGemini, anthropic: callAnthropic };
const MAX_BASE64_CHARS = 6 * 1024 * 1024; // ~4.5 MB de imagen
const CATEGORIES = ['bakery', 'fruits', 'vegetables', 'meals', 'dairy', 'other'];

const SYSTEM = (lang) => `You are FoodLink AI, a food-safety and food-classification assistant for a food-donation app.
Look at the photo and describe the food that could be donated.
Reply with ONLY a JSON object (no markdown, no prose) with exactly these keys:
{
  "isFood": boolean,                 // false if the photo does not show edible food
  "name": string,                    // short name of the food, in ${lang === 'en' ? 'English' : 'Spanish'}
  "category": "bakery"|"fruits"|"vegetables"|"meals"|"dairy"|"other",
  "quantityText": string,            // visible quantity, e.g. "12 units", "3 kg", "6 portions" (${lang === 'en' ? 'English' : 'Spanish'})
  "weightKg": number,                // rough total weight estimate in kg
  "freshness": "good"|"fair"|"poor", // visible condition
  "shelfLifeDays": number,           // estimated remaining days it stays safe to eat (integer >= 0)
  "storage": string,                 // one short storage tip in ${lang === 'en' ? 'English' : 'Spanish'}
  "allergens": string[],             // likely allergens (gluten, lactose, nuts, eggs...) in ${lang === 'en' ? 'English' : 'Spanish'}; [] if none
  "safeToDonate": boolean,           // false if it looks spoiled, moldy, or unsafe
  "notes": string,                   // one short sentence for the receiver in ${lang === 'en' ? 'English' : 'Spanish'}
  "confidence": number               // 0 to 1
}
These are estimates from a photo only; be conservative about safety.`;

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error('no json');
  }
}

const num = (v, fallback) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

function normalize(raw) {
  return {
    isFood: raw.isFood !== false,
    name: String(raw.name || '').slice(0, 80),
    category: CATEGORIES.includes(raw.category) ? raw.category : 'other',
    quantityText: String(raw.quantityText || '').slice(0, 60),
    weightKg: Math.max(0, Math.round(num(raw.weightKg, 1) * 10) / 10),
    freshness: ['good', 'fair', 'poor'].includes(raw.freshness) ? raw.freshness : 'good',
    shelfLifeDays: Math.max(0, Math.round(num(raw.shelfLifeDays, 1))),
    storage: String(raw.storage || '').slice(0, 160),
    allergens: Array.isArray(raw.allergens) ? raw.allergens.map(String).slice(0, 8) : [],
    safeToDonate: raw.safeToDonate !== false,
    notes: String(raw.notes || '').slice(0, 200),
    confidence: Math.min(1, Math.max(0, num(raw.confidence, 0.7))),
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const provider = pickProvider();
  // GET: diagnóstico rápido (abre /api/analyze en el navegador).
  if (req.method === 'GET') return res.status(200).json({ configured: !!provider, provider, models: provider ? PROVIDERS[provider].models() : [] });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!provider) return res.status(503).json({ error: 'ai_not_configured' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const { image, mediaType = 'image/jpeg', lang = 'es' } = body || {};
  if (typeof image !== 'string' || image.length < 100) return res.status(400).json({ error: 'image_required' });
  if (image.length > MAX_BASE64_CHARS) return res.status(413).json({ error: 'image_too_large' });
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mediaType)) return res.status(400).json({ error: 'bad_media_type' });

  const cleanImage = image.replace(/^data:image\/[a-z+.-]+;base64,/i, '');
  const system = SYSTEM(lang === 'en' ? 'en' : 'es');
  const apiKey = PROVIDERS[provider].key();

  try {
    let last = null;
    for (const model of PROVIDERS[provider].models()) {
      const result = await CALLERS[provider]({ model, apiKey, system, image: cleanImage, mediaType });
      if (result.ok) return res.status(200).json(normalize(extractJson(result.text)));
      console.error(provider, 'error', model, result.status, result.detail);
      last = { status: result.status, detail: String(result.detail).slice(0, 300) };
      if (result.status !== 404) break; // solo se prueba otro modelo si este no existe
    }
    return res.status(502).json({ error: 'upstream_error', provider, upstreamStatus: last?.status, detail: last?.detail });
  } catch (err) {
    console.error('analyze failed', err);
    return res.status(500).json({ error: 'analysis_failed', detail: String(err.message || err) });
  }
};

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
