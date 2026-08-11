// Lee bloques hijos de la página FINAL UNIDAD 1 (a partir del 100)
const TOKEN = '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';
const API = 'https://api.notion.com/v1';
const PAGE_ID = '3b89e9ed-c6fb-8014-b08a-c3409cf910a2';

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

// Paginar todos los bloques hijos
let cursor = undefined;
let all = [];
do {
  const params = new URLSearchParams({ page_size: '100' });
  if (cursor) params.set('start_cursor', cursor);
  const res = await notion('GET', `/blocks/${PAGE_ID}/children?${params}`);
  all = all.concat(res.results);
  cursor = res.has_more ? res.next_cursor : undefined;
} while (cursor);

console.log('TOTAL REAL:', all.length);
all.slice(100).forEach((b, i) => {
  let txt = '';
  if (['heading_1', 'heading_2', 'heading_3', 'paragraph', 'callout', 'quote'].includes(b.type)) {
    txt = (b[b.type]?.rich_text || []).map(t => t.plain_text).join('').slice(0, 90);
  } else if (b.type === 'image') {
    const img = b.image;
    txt = '[IMAGEN] ' + (img.caption || []).map(t => t.plain_text).join('').slice(0, 50) + ' | url=' + (img.external?.url || img.file?.url || '').slice(0, 70);
  } else if (b.type === 'table') {
    txt = '[TABLA ' + (b.table?.table_width || '?') + ' cols]';
  } else if (b.type === 'divider') {
    txt = '---';
  } else {
    txt = '[' + b.type + ']';
  }
  console.log((i + 101) + '.', b.type, '|', txt);
});
