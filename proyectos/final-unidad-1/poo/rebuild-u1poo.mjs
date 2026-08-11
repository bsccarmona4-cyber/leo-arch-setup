// ─────────────────────────────────────────────────────────────
// rebuild-u1poo.mjs — Reemplaza el reporte de FINAL U1 POO.
// Conserva la portada (primeros 11 bloques) y reconstruye el
// resto con el contenido actualizado.
// ─────────────────────────────────────────────────────────────
import { TOKEN, API, appendBlocks } from '../scripts/lib.mjs';
import { buildBlocks } from './content-u1poo.mjs';
import { readFileSync } from 'node:fs';

const PAGE_U1POO = '3b99e9ed-c6fb-8001-ac43-c1701717d357'; // FINAL U1 POO
const PORTADA = 11; // bloques de la portada que se conservan

async function notion(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(res.status + ': ' + (data.message || JSON.stringify(data)));
  return data;
}

async function main() {
  console.log('1) Leyendo bloques actuales de la página...');
  const all = [];
  let cursor;
  do {
    const params = new URLSearchParams({ page_size: '100' });
    if (cursor) params.set('start_cursor', cursor);
    const res = await notion('GET', `/blocks/${PAGE_U1POO}/children?${params}`);
    all.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  console.log('   Total actual:', all.length, 'bloques');

  if (all.length < PORTADA) throw new Error(`La página tiene menos de ${PORTADA} bloques; no toco nada.`);

  console.log(`2) Eliminando bloques del reporte (${all.length - PORTADA})...`);
  for (const b of all.slice(PORTADA)) {
    await notion('DELETE', `/blocks/${b.id}`);
  }

  console.log('3) Cargando URLs de imágenes (imgur)...');
  const urls = JSON.parse(readFileSync('/home/leo/final-unidad-1/poo/imagenes/urls.json', 'utf8'));

  console.log('4) Construyendo bloques nuevos...');
  const blocks = buildBlocks(urls);
  console.log('   Total bloques nuevos:', blocks.length);

  console.log('5) Agregando bloques...');
  await appendBlocks(PAGE_U1POO, blocks, 'reporte');

  console.log('Listo. Portada intacta + reporte nuevo.');
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
