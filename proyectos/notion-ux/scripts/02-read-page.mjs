// Lee bloques hijos de la página FINAL U3
const TOKEN = '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';
const API = 'https://api.notion.com/v1';
const PAGE_ID = '3b89e9ed-c6fb-8037-9c19-ea11362627e7';

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

// Info de la página
const page = await notion('GET', '/pages/' + PAGE_ID);
const title = (page.properties?.title?.title || []).map(t => t.plain_text).join('');
console.log('PÁGINA:', JSON.stringify(title));

// Bloques hijos
const blocks = await notion('GET', '/blocks/' + PAGE_ID + '/children?page_size=100');
console.log('TOTAL BLOQUES:', blocks.results.length);
blocks.results.forEach((b, i) => {
  let txt = '';
  if (b.type === 'heading_1' || b.type === 'heading_2' || b.type === 'heading_3' || b.type === 'paragraph' || b.type === 'callout') {
    txt = (b[b.type]?.rich_text || []).map(t => t.plain_text).join('').slice(0, 80);
  } else if (b.type === 'image') {
    txt = '[IMAGEN] ' + (b.image?.caption || []).map(t => t.plain_text).join('').slice(0, 40);
  } else if (b.type === 'divider') {
    txt = '---';
  } else {
    txt = '[' + b.type + ']';
  }
  console.log(i + 1 + '.', b.id, '|', b.type, '|', txt);
});
