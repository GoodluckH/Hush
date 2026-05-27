// Render assets/icon.svg into the PNG sizes the manifest needs.
// Uses a simplified icon-small.svg for the 16/32 sizes so the glyph
// survives at toolbar resolution (same metaphor, less detail).
// Run with: npm run icons

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/icon');

const TARGETS = [
  { size: 16, src: 'assets/icon-small.svg' },
  { size: 32, src: 'assets/icon-small.svg' },
  { size: 48, src: 'assets/icon.svg' },
  { size: 96, src: 'assets/icon.svg' },
  { size: 128, src: 'assets/icon.svg' },
];

mkdirSync(OUT_DIR, { recursive: true });

for (const { size, src } of TARGETS) {
  const svg = readFileSync(resolve(ROOT, src));
  const out = resolve(OUT_DIR, `${size}.png`);
  const png = await sharp(svg, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(out, png);
  console.log(`✓ ${size}.png  (${src.replace('assets/', '')}, ${png.length} bytes)`);
}

console.log(`\nWrote ${TARGETS.length} icons to ${OUT_DIR}`);
