// Verifica la estructura final de la página FINAL U3
const TOKEN = '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';
const API = 'https://api.notion.com/v1';
const PAGE_ID = '3b89e9ed-c6fb-8037-9c19-ea11362627e7';

async function notion(method, path) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(res.status + ': ' + (data.message || JSON.stringify(data)));
  return data;
}

let blocks = [];
let cursor;
do {
  const q = '/blocks/' + PAGE_ID + '/children?page_size=100' + (cursor ? '&start_cursor=' + cursor : '');
  const r = await notion('GET', q);
  blocks = blocks.concat(r.results);
  cursor = r.has_more ? r.next_cursor : null;
} while (cursor);

console.log('TOTAL BLOQUES:', blocks.length);
let nImg = 0, nTab = 0, nH = 0;
blocks.forEach((b, i) => {
  let txt = '';
  if (b.type.startsWith('heading_')) { nH++; txt = (b[b.type]?.rich_text || []).map(t => t.plain_text).join('').slice(0, 70); }
  else if (b.type === 'paragraph' || b.type === 'callout') { txt = (b[b.type]?.rich_text || []).map(t => t.plain_text).join('').slice(0, 70); }
  else if (b.type === 'image') { nImg++; txt = 'URL: ' + (b.image?.external?.url || b.image?.file?.url || '').slice(0, 55); }
  else if (b.type === 'table') { nTab++; txt = 'tabla ' + b.table.table_width + ' col'; }
  else if (b.type === 'divider') txt = '---';
  else txt = '[' + b.type + ']';
  console.log(String(i + 1).padStart(3), '|', b.type.padEnd(14), '|', txt);
});
console.log('\nResumen: ' + nH + ' headings, ' + nImg + ' imágenes, ' + nTab + ' tablas');
