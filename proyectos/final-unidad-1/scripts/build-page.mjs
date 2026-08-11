// ─────────────────────────────────────────────────────────────
// build-page.mjs — Construye la página FINAL UNIDAD 1 en Notion
// Las imágenes ya están en catbox (imagenes/urls.json)
// ─────────────────────────────────────────────────────────────
import { PAGE_ID, clearPage, appendBlocks } from './lib.mjs';
import { buildBlocks } from './content.mjs';
import { readFileSync } from 'node:fs';

async function main() {
  console.log('1) Cargando URLs de imágenes...');
  const urls = JSON.parse(readFileSync('/home/leo/final-unidad-1/imagenes/urls.json', 'utf8'));

  console.log('2) Limpiando página...');
  await clearPage(PAGE_ID);

  console.log('3) Construyendo bloques...');
  const blocks = buildBlocks(urls);
  console.log('   Total bloques top-level:', blocks.length);

  console.log('4) Subiendo bloques (chunks de 90)...');
  await appendBlocks(PAGE_ID, blocks, 'página');

  console.log('✅ Página construida:', blocks.length, 'bloques');
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
