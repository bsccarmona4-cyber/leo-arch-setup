// Verifica la página FINAL U2 POO
import { TOKEN, API } from './lib-u2.mjs';
async function notion(method, path, body) {
  const res = await fetch(API + path, { method, headers: { 'Authorization': 'Bearer ' + TOKEN, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(res.status + ': ' + (data.message || JSON.stringify(data)));
  return data;
}
const PAGE_ID = '3b99e9ed-c6fb-8118-8424-c4ea132414c2';
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
let imgs = 0, codes = 0;
all.forEach((b, i) => {
  if (b.type === 'image') {
    imgs++;
    const url = b.image?.external?.url || 'SIN URL';
    console.log(`Imagen[${i}]`, url);
  }
  if (b.type === 'code') codes++;
});
console.log('Imagenes:', imgs, '| Bloques de codigo:', codes);
// primer y ultimo bloque
console.log('Primero:', all[0].type, '| Ultimo:', all[all.length - 1].type);
