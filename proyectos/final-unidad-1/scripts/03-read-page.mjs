// Lee bloques hijos de la página FINAL UNIDAD 1
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

const page = await notion('GET', '/pages/' + PAGE_ID);
const title = (page.properties?.title?.title || []).map(t => t.plain_text).join('');
console.log('PÁGINA:', JSON.stringify(title));
console.log('ICONO:', page.icon ? JSON.stringify(page.icon) : '(sin icono)');
console.log('PORTADA:', page.cover ? JSON.stringify(page.cover).slice(0, 120) : '(sin portada)');

const blocks = await notion('GET', '/blocks/' + PAGE_ID + '/children?page_size=100');
console.log('TOTAL BLOQUES:', blocks.results.length);
blocks.results.forEach((b, i) => {
  let txt = '';
  if (['heading_1', 'heading_2', 'heading_3', 'paragraph', 'callout', 'quote'].includes(b.type)) {
    txt = (b[b.type]?.rich_text || []).map(t => t.plain_text).join('').slice(0, 90);
  } else if (b.type === 'image') {
    txt = '[IMAGEN] ' + (b.image?.caption || []).map(t => t.plain_text).join('').slice(0, 40);
  } else if (b.type === 'divider') {
    txt = '---';
  } else if (b.type === 'child_page') {
    txt = '[SUBPÁGINA] ' + (b.child_page?.title || '');
  } else {
    txt = '[' + b.type + ']';
  }
  console.log(i + 1 + '.', b.id, '|', b.type, '|', txt);
});
