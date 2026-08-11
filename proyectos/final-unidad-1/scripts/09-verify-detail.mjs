// 09-verify-detail.mjs — Verifica tablas e imágenes de la página FINAL U1 POO
import { TOKEN, API } from '../scripts/lib.mjs';
async function notion(method, path, body) {
  const res = await fetch(API + path, { method, headers: { 'Authorization': 'Bearer ' + TOKEN, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(res.status + ': ' + (data.message || JSON.stringify(data)));
  return data;
}
const PAGE_ID = '3b99e9ed-c6fb-8001-ac43-c1701717d357';
const all = [];
let cursor;
do {
  const params = new URLSearchParams({ page_size: '100' });
  if (cursor) params.set('start_cursor', cursor);
  const res = await notion('GET', `/blocks/${PAGE_ID}/children?${params}`);
  all.push(...res.results);
  cursor = res.has_more ? res.next_cursor : undefined;
} while (cursor);
const targets = new Map();
all.forEach((b, i) => { targets.set(i, b); });
console.log('Bloques totales leídos:', all.length);

// Tablas: bloque 18 (RF), 20 (RNF), 24 (actores)
for (const idx of [18, 20, 24]) {
  const b = targets.get(idx);
  console.log(`\n=== Tabla (bloque ${idx}) ===`);
  const rows = await notion('GET', `/blocks/${b.id}/children?page_size=100`);
  for (const r of rows.results.slice(0, 3)) {
    const cells = (r.table_row?.cells || []).map(c => c.map(t => t.plain_text).join(''));
    console.log(' |', cells.join(' | '));
  }
  console.log(`... filas totales: ${rows.results.length}`);
}

// Imágenes
for (const idx of [26, 117, 120, 137, 154]) {
  const b = targets.get(idx);
  const url = b.image?.external?.url || b.image?.file?.url || 'SIN URL';
  console.log(`\n=== Imagen (bloque ${idx}) === ${url.slice(0, 80)}`);
  const capt = (b.image?.caption || []).map(t => t.plain_text).join('');
  console.log('caption:', capt);
}

// Código
for (const idx of [135, 152]) {
  const b = targets.get(idx);
  console.log(`\n=== Código (bloque ${idx}) lang=${b.code?.language} ===`);
  console.log((b.code?.rich_text || []).map(t => t.plain_text).join('').slice(0, 200));
}
