// Verifica bloques anidados: column_list → column → image, y tabla 1.a
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

// 1) Inspeccionar column_lists e imágenes top-level
const top = await notion('GET', `/blocks/${PAGE_ID}/children?page_size=100`);
for (const b of top.results) {
  if (b.type === 'column_list') {
    console.log('COLUMN_LIST', b.id);
    const cols = await notion('GET', `/blocks/${b.id}/children?page_size=10`);
    for (const col of cols.results) {
      if (col.type === 'column') {
        const kids = await notion('GET', `/blocks/${col.id}/children?page_size=10`);
        for (const k of kids.results) {
          if (k.type === 'image') {
            console.log('   └─ image:', (k.image.caption || []).map(t => t.plain_text).join('').slice(0, 60), '|', (k.image.external?.url || k.image.file?.url || '').slice(0, 80));
          } else {
            console.log('   └─', k.type);
          }
        }
      }
    }
  }
}

// 2) Inspeccionar la tabla 1.a (primer table top-level: ficha de formatos)
const tables = top.results.filter(b => b.type === 'table');
console.log('\nTABLAS TOP-LEVEL:', tables.length);
if (tables[0]) {
  const rows = await notion('GET', `/blocks/${tables[0].id}/children?page_size=20`);
  console.log('Tabla 1.a — filas:', rows.results.length);
  for (const r of rows.results.slice(0, 4)) {
    const cells = r.table_row.cells.map(c => c.map(t => t.plain_text).join(''));
    console.log('  |', cells.join(' | ').slice(0, 150));
  }
}
