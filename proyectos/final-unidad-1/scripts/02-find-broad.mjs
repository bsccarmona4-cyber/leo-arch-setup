// Busca páginas recientes / con "final" o "unidad" en Notion
const TOKEN = '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';
const API = 'https://api.notion.com/v1';

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

for (const q of ['final', 'unidad', 'formato']) {
  const res = await notion('POST', '/search', { query: q, filter: { value: 'page', property: 'object' }, page_size: 20 });
  console.log('\n=== query:', JSON.stringify(q), '=>', res.results.length, 'resultados ===');
  for (const p of res.results) {
    const title = (p.properties?.title?.title || []).map(t => t.plain_text).join('');
    console.log('-', p.id, '|', JSON.stringify(title), '|', p.url);
  }
}
