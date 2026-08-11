// ─────────────────────────────────────────────────────────────
// lib-u2.mjs — Helpers Notion para FINAL U2 POO
// ─────────────────────────────────────────────────────────────
export const TOKEN = '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';
export const API = 'https://api.notion.com/v1';
export const PAGE_ID_U2 = '3b99e9ed-c6fb-8118-8424-c4ea132414c2'; // FINAL U2 POO

export async function notion(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(res.status + ': ' + (data.message || JSON.stringify(data)));
  return data;
}

export async function appendBlocks(parentId, blocks, label = 'bloques') {
  for (let i = 0; i < blocks.length; i += 90) {
    const chunk = blocks.slice(i, i + 90);
    await notion('PATCH', `/blocks/${parentId}/children`, { children: chunk });
    console.log(`  [${label}] subidos ${i + chunk.length}/${blocks.length}`);
  }
}

export async function clearPage(pageId) {
  let cursor;
  let deleted = 0;
  do {
    const params = new URLSearchParams({ page_size: '100' });
    if (cursor) params.set('start_cursor', cursor);
    const existing = await notion('GET', `/blocks/${pageId}/children?${params}`);
    for (const block of existing.results || []) {
      await notion('DELETE', `/blocks/${block.id}`);
      deleted++;
    }
    cursor = existing.has_more ? existing.next_cursor : undefined;
  } while (cursor);
  console.log(`  [limpieza] eliminados ${deleted} bloques`);
}
