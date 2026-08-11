// ─────────────────────────────────────────────────────────────
// build-u1poo.mjs — Agrega el reporte a la página FINAL U1 POO.
// No borra la portada: solo hace append de los bloques nuevos.
// ─────────────────────────────────────────────────────────────
import { appendBlocks } from '../scripts/lib.mjs';
import { buildBlocks } from './content-u1poo.mjs';
import { readFileSync } from 'node:fs';

const PAGE_U1POO = '3b99e9ed-c6fb-8001-ac43-c1701717d357'; // FINAL U1 POO

async function main() {
  console.log('1) Cargando URLs de imágenes...');
  const urls = JSON.parse(readFileSync('/home/leo/final-unidad-1/poo/imagenes/urls.json', 'utf8'));

  console.log('2) Construyendo bloques...');
  const blocks = buildBlocks(urls);
  console.log('   Total bloques top-level:', blocks.length);

  console.log('3) Agregando bloques a la página (append)...');
  await appendBlocks(PAGE_U1POO, blocks, 'reporte');

  console.log('Listo. Reporte agregado después de la portada.');
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
