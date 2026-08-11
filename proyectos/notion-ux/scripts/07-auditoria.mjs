// Auditoría: dump completo de la página FINAL U3 contra los 7 puntos del informe
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

console.log('=== TOTAL:', blocks.length, 'bloques ===');
for (const [i, b] of blocks.entries()) {
  const n = i + 1;
  const t = b.type;
  if (t.startsWith('heading_')) {
    const txt = (b[t]?.rich_text || []).map(x => x.plain_text).join('');
    console.log('\n#' + n + ' [' + t + '] ' + txt);
  } else if (t === 'paragraph') {
    const txt = (b[t]?.rich_text || []).map(x => x.plain_text).join('');
    console.log('  P' + n + ': ' + txt);
  } else if (t === 'callout') {
    const txt = (b[t]?.rich_text || []).map(x => x.plain_text).join('');
    console.log('  CALLOUT' + n + ': ' + txt);
  } else if (t === 'bulleted_list_item') {
    const txt = (b[t]?.rich_text || []).map(x => x.plain_text).join('');
    console.log('  • ' + txt);
  } else if (t === 'numbered_list_item') {
    const txt = (b[t]?.rich_text || []).map(x => x.plain_text).join('');
    console.log('  1) ' + txt);
  } else if (t === 'divider') {
    console.log('  ---');
  } else if (t === 'image') {
    const cap = (b.image?.caption || []).map(x => x.plain_text).join('');
    console.log('  [IMG] ' + cap + ' | ' + (b.image?.external?.url || ''));
  } else if (t === 'table') {
    const rows = await notion('GET', '/blocks/' + b.id + '/children');
    console.log('  [TABLA ' + b.table.table_width + ' col]:');
    for (const r of rows.results) {
      const cells = (r.table_row?.cells || []).map(c => c.map(x => x.plain_text).join(''));
      console.log('    | ' + cells.join(' | '));
    }
  } else {
    console.log('  [' + t + ']');
  }
}
