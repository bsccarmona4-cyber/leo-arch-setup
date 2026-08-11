// Inspecciona las dos páginas sin título para identificar la de U2
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

for (const id of ['3909e9ed-c6fb-81cc-b929-c261f5ebb765', '3909e9ed-c6fb-813f-b8e2-cc1744e32e12']) {
  const p = await notion('GET', `/pages/${id}`);
  const title = (p.properties?.title?.title || []).map(t => t.plain_text).join('');
  console.log('ID:', id);
  console.log('  title:', JSON.stringify(title));
  console.log('  created:', p.created_time);
  console.log('  last_edited:', p.last_edited_time);
  console.log('  parent:', JSON.stringify(p.parent));
  console.log('  url:', p.url);
  const blocks = await notion('GET', `/blocks/${id}/children?page_size=20`);
  console.log('  bloques hijos:', blocks.results.length);
  console.log('');
}
