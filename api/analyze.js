// Función serverless de Vercel: analiza la foto de un alimento con Claude (visión).
// Requiere la variable de entorno ANTHROPIC_API_KEY. La clave nunca llega al cliente.

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'ai_not_configured' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const { image, mediaType = 'image/jpeg', lang = 'es' } = body || {};
  if (typeof image !== 'string' || image.length < 100) return res.status(400).json({ error: 'image_required' });
  if (image.length > MAX_BASE64_CHARS) return res.status(413).json({ error: 'image_too_large' });
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mediaType)) return res.status(400).json({ error: 'bad_media_type' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system: SYSTEM(lang === 'en' ? 'en' : 'es'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
              { type: 'text', text: 'Analyze this food photo and return the JSON.' },
            ],
          },
        ],
      }),
    });
    if (!response.ok) {
      console.error('anthropic error', response.status, await response.text());
      return res.status(502).json({ error: 'upstream_error' });
    }
    const data = await response.json();
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    return res.status(200).json(normalize(extractJson(text)));
  } catch (err) {
    console.error('analyze failed', err);
    return res.status(500).json({ error: 'analysis_failed' });
  }
};

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
