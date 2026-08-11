// ─────────────────────────────────────────────────────────────
// build-u2.mjs — Construye la página FINAL U2 POO en Notion.
// Limpia la página y sube el contenido completo.
// ─────────────────────────────────────────────────────────────
import { PAGE_ID_U2, clearPage, appendBlocks } from './lib-u2.mjs';
import { buildBlocks } from './content-u2.mjs';
import { readFileSync } from 'node:fs';

async function main() {
  console.log('1) Cargando URLs de imágenes...');
  const urls = JSON.parse(readFileSync('/home/leo/final-unidad-2/imagenes/urls.json', 'utf8'));

  console.log('2) Limpiando página...');
  await clearPage(PAGE_ID_U2);

  console.log('3) Construyendo bloques...');
  const blocks = buildBlocks(urls);
  console.log('   Total bloques top-level:', blocks.length);

  console.log('4) Subiendo bloques...');
  await appendBlocks(PAGE_ID_U2, blocks, 'página');

  console.log('Listo:', blocks.length, 'bloques');
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
