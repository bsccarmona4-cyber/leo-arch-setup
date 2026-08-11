import { TOKEN, API } from './lib.mjs';
async function notion(method, path, body) {
  const res = await fetch(API + path, { method, headers: { 'Authorization': 'Bearer ' + TOKEN, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(res.status + ': ' + (data.message || JSON.stringify(data)));
  return data;
}
const PAGE_ID = '3b99e9ed-c6fb-8001-ac43-c1701717d357';
let cursor;
let i = 0;
do {
  const params = new URLSearchParams({ page_size: '100' });
  if (cursor) params.set('start_cursor', cursor);
  const res = await notion('GET', `/blocks/${PAGE_ID}/children?${params}`);
  for (const b of res.results) {
    const t = b.type;
    const txt = (b[t]?.rich_text || []).map(x => x.plain_text).join('');
    const kids = b[t]?.children?.length || 0;
    console.log(`${i}\t${t}\t${kids}\t${txt.slice(0, 120)}`);
    i++;
  }
  cursor = res.has_more ? res.next_cursor : undefined;
} while (cursor);
console.log('TOTAL:', i);
