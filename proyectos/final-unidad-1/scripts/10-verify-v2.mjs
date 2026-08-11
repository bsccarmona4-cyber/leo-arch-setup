// 10-verify-v2.mjs — Verifica imágenes (imgur), código (inglés) y tablas v2
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
console.log('Total bloques:', all.length);

for (const idx of [26, 117, 121, 138, 155]) {
  const b = all[idx];
  const url = b.image?.external?.url || 'SIN URL';
  const capt = (b.image?.caption || []).map(t => t.plain_text).join('');
  console.log(`Imagen[${idx}] ${url} | caption: ${capt}`);
}

for (const idx of [136, 153]) {
  const b = all[idx];
  const code = (b.code?.rich_text || []).map(t => t.plain_text).join('');
  const firstLine = code.split('\n').slice(0, 2).join(' / ');
  console.log(`Codigo[${idx}] lang=${b.code?.language} | ${firstLine.slice(0, 120)}`);
}

for (const idx of [18, 20, 24]) {
  const b = all[idx];
  const rows = await notion('GET', `/blocks/${b.id}/children?page_size=100`);
  console.log(`Tabla[${idx}] filas: ${rows.results.length}`);
}
