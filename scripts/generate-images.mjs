// Génère les visuels de la refonte via OpenRouter (Gemini image).
// Usage : node scripts/generate-images.mjs [nom…]   (sans argument : tous les visuels manquants)
// Les visuels produit partent de la vraie photo du flacon : l'emballage doit rester fidèle.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]),
);
const KEY = env.OPENROUTER_API_KEY;
if (!KEY) throw new Error('OPENROUTER_API_KEY absent de .env.local');

const MODELS = ['google/gemini-2.5-flash-image', 'google/gemini-2.5-flash-image-preview'];
const OUT = 'public/images/refonte';
const PYLOR = 'https://tvhqldvmmbslrcbcwhhs.supabase.co/storage/v1/object/public/elrophe-media/products/1792803887044-sujgco.webp';

const STYLE =
  'Premium editorial still-life photography for a luxury natural health house. Soft natural daylight, gentle shadows, realistic textures, ' +
  'restrained palette of deep forest green (#17372C), natural ivory and muted sage. No text, no logos, no watermark, no gold halo, ' +
  'no metallic glow, no artificial gradients, no lens flare, no fantasy elements.';
const KEEP =
  'Use the exact product bottle from the reference photo: keep its shape, amber glass, cap, label design, colours and all label text identical and legible. ' +
  'Do not redraw, restyle or invent packaging. ';

const jobs = {
  'hero-desktop': {
    ratio: '16:9',
    ref: PYLOR,
    prompt:
      KEEP +
      'Place the bottle standing on a natural weathered stone on the right third of a wide composition, framed by authentic fresh green leaves, ' +
      'a few small white jasmine flowers and pieces of fresh ginger root. Deep forest green background softly out of focus. ' +
      'The left half is calm, dark green negative space for a headline. ' +
      STYLE,
  },
  'hero-mobile': {
    ratio: '3:4',
    ref: PYLOR,
    prompt:
      KEEP +
      'Vertical composition: the bottle stands on a natural stone in the lower half, centred, framed by authentic fresh green leaves, ' +
      'a few white jasmine flowers and fresh ginger root. The upper half is calm, dark forest green negative space for a headline. ' +
      STYLE,
  },
  'maison-feuille': {
    ratio: '4:3',
    prompt:
      'Macro photograph of a single fresh tropical green leaf with small water droplets, diagonal composition, deep green bokeh background, ' +
      'warm soft morning light from the side. ' +
      STYLE,
  },
  'engagements-feuillage': {
    ratio: '16:9',
    prompt:
      'Close-up of lush fresh green leaves with dew drops at the bottom of the frame, softly lit, the top of the frame fades into a calm ' +
      'out-of-focus green. Authentic botanical detail, nothing artificial. ' +
      STYLE,
  },
  'contact-botanique': {
    ratio: '16:9',
    prompt:
      'Overhead view of fresh medicinal plants on a natural linen cloth: moringa leaves, a few ginger roots, a sprig of mint, small white flowers, ' +
      'arranged sparsely with generous empty space. ' +
      STYLE,
  },
  // Page /best-seller
  'bestseller-feuillage': {
    ratio: '4:3',
    prompt:
      'Fresh glossy green tea-like leaves on a branch entering from the top right corner, soft natural daylight, the rest of the frame is a ' +
      'very light warm ivory (#F6F3EC) background, softly out of focus, lots of empty space on the left for a title. ' +
      STYLE,
  },
  'ingredient-pylopass': {
    ratio: '1:1',
    prompt:
      'Minimal scientific still life: a small glass petri dish with a fine white probiotic powder and a few white capsules on a light ivory surface, ' +
      'soft daylight, clean and calm, no text. ' +
      STYLE,
  },
  'ingredient-brocoli': {
    ratio: '1:1',
    prompt: 'Fresh broccoli florets and a few young broccoli sprouts on a light ivory surface, soft daylight, close-up, clean. ' + STYLE,
  },
  'ingredient-mastic': {
    ratio: '1:1',
    prompt: 'Natural mastic gum resin tears (pale translucent yellow drops) from Pistacia lentiscus, with a small sprig of lentisk leaves, on a light ivory surface, soft daylight, close-up. ' + STYLE,
  },
  'ingredient-nac': {
    ratio: '1:1',
    prompt:
      'Minimal still life: a few white capsules and a small heap of fine white crystalline powder in a small glass bowl on a light ivory surface, ' +
      'soft daylight, clean laboratory elegance, no text. ' +
      STYLE,
  },
  'raisons-feuilles': {
    ratio: '3:4',
    prompt: 'A delicate sprig of fresh green leaves seen from above on a very light ivory background, soft shadow, generous empty space. ' + STYLE,
  },
};

async function generate(name, { prompt, ratio, ref }) {
  const content = [{ type: 'text', text: prompt }];
  if (ref) content.push({ type: 'image_url', image_url: { url: ref } });
  for (const model of MODELS) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', 'X-Title': 'EL ROPHE refonte' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content }], modalities: ['image', 'text'], image_config: { aspect_ratio: ratio } }),
    });
    const json = await res.json().catch(() => ({}));
    const url = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (res.ok && url?.startsWith('data:image/')) {
      const [, ext, b64] = url.match(/^data:image\/(\w+);base64,(.+)$/) ?? [];
      const file = join(OUT, `${name}.${ext === 'jpeg' ? 'jpg' : ext}`);
      writeFileSync(file, Buffer.from(b64, 'base64'));
      console.log(`✓ ${name} → ${file} (${model})`);
      return;
    }
    console.warn(`… ${name} : ${model} a échoué (${res.status}) ${JSON.stringify(json?.error ?? json).slice(0, 200)}`);
  }
  console.error(`✗ ${name} : aucun modèle n'a renvoyé d'image`);
}

mkdirSync(OUT, { recursive: true });
const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(jobs).filter((n) => !['png', 'jpg', 'webp'].some((e) => existsSync(join(OUT, `${n}.${e}`))));
await Promise.all(names.map((n) => generate(n, jobs[n])));
