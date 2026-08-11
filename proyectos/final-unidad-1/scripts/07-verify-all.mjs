// Verifica imágenes y columnas del resto de la página (paginación completa)
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

// Paginar TODO
let cursor = undefined;
let all = [];
do {
  const params = new URLSearchParams({ page_size: '100' });
  if (cursor) params.set('start_cursor', cursor);
  const res = await notion('GET', `/blocks/${PAGE_ID}/children?${params}`);
  all = all.concat(res.results);
  cursor = res.has_more ? res.next_cursor : undefined;
} while (cursor);

console.log('TOTAL:', all.length);

// Imágenes top-level
const topImages = all.filter(b => b.type === 'image');
console.log('\nIMÁGENES TOP-LEVEL:', topImages.length);
for (const b of topImages) {
  console.log('  -', (b.image.caption || []).map(t => t.plain_text).join('').slice(0, 60), '|', (b.image.external?.url || b.image.file?.url || '').slice(0, 70));
}

// Column lists → verificar imágenes dentro
for (const b of all.filter(x => x.type === 'column_list')) {
  const cols = await notion('GET', `/blocks/${b.id}/children?page_size=10`);
  for (const col of cols.results) {
    const kids = await notion('GET', `/blocks/${col.id}/children?page_size=10`);
    for (const k of kids.results) {
      if (k.type === 'image') {
        console.log('  [col] imagen:', (k.image.caption || []).map(t => t.plain_text).join('').slice(0, 60), '|', (k.image.external?.url || '').slice(0, 70));
      }
    }
  }
}

// Tablas restantes (fuera del primer fetch): verificar filas
const allTables = [];
for (const b of all.filter(x => x.type === 'table')) {
  const rows = await notion('GET', `/blocks/${b.id}/children?page_size=30`);
  allTables.push({ width: b.table.table_width, rows: rows.results.length });
}
console.log('\nTABLAS TOTALES:', allTables.length);
allTables.forEach((t, i) => console.log(`  tabla ${i + 1}: ${t.width} cols, ${t.rows} filas`));
