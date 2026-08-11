// Busca la página "final u2 poo" en Notion (variantes)
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

const queries = ['u2', 'final u2', 'biblioteca', 'poo'];
for (const q of queries) {
  const res = await notion('POST', '/search', { query: q, filter: { value: 'page', property: 'object' } });
  console.log(`\n=== QUERY: "${q}" (${res.results.length}) ===`);
  for (const p of res.results) {
    const title = (p.properties?.title?.title || []).map(t => t.plain_text).join('');
    console.log('-', p.id, '|', JSON.stringify(title));
  }
}
