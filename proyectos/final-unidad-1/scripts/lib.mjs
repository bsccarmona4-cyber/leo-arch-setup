// ─────────────────────────────────────────────────────────────
// lib.mjs — Helpers comunes para Notion API
// ─────────────────────────────────────────────────────────────
export const TOKEN = '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';
export const API = 'https://api.notion.com/v1';
export const PAGE_ID = '3b89e9ed-c6fb-8014-b08a-c3409cf910a2'; // FINAL UNIDAD 1

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

// ── Constructores de bloques ─────────────────────────────────
export const H = (level, text, color) => ({ [`heading_${level}`]: { rich_text: [{ text: { content: text } }], color: color || 'default' } });
export const P = (text, color) => ({ paragraph: { rich_text: [{ text: { content: text } }], color: color || 'default' } });
export const D = () => ({ divider: {} });
export const B = (text) => ({ bulleted_list_item: { rich_text: [{ text: { content: text } }] } });
export const NB = (text) => ({ numbered_list_item: { rich_text: [{ text: { content: text } }] } });
export const Q = (text) => ({ quote: { rich_text: [{ text: { content: text } }], color: 'gray_background' } });
export const CALLOUT = (text, emoji, color) => ({ callout: { rich_text: [{ text: { content: text } }], icon: { emoji }, color: color || 'gray_background' } });

// Tabla (máximo 6 columnas en API de Notion)
// Nota: con has_column_header:true el API aplica el bold de encabezado solo;
//       no se debe mandar bold manual en la primera fila.
export const TABLE = (headers, rows, hasRowHeader = false) => {
  const table_rows = [];
  table_rows.push({
    type: 'table_row',
    table_row: {
      cells: headers.map(h => [{ text: { content: h } }])
    }
  });
  for (const row of rows) {
    table_rows.push({
      type: 'table_row',
      table_row: {
        cells: row.map(c => [{ text: { content: String(c || '') } }])
      }
    });
  }
  return { type: 'table', table: { table_width: headers.length, has_column_header: true, has_row_header: hasRowHeader, children: table_rows } };
};

// Columnas (2)
export const COL2 = (leftBlocks, rightBlocks) => ({
  type: 'column_list',
  column_list: {
    children: [
      { type: 'column', column: { children: leftBlocks } },
      { type: 'column', column: { children: rightBlocks } },
    ]
  }
});

// Bloque imagen con URL (subida o externa)
export const IMG = (url, caption) => ({
  type: 'image',
  image: {
    type: 'external',
    external: { url },
    caption: caption ? [{ text: { content: caption } }] : [],
  }
});

// Subir archivo local a Notion (devuelve URL temporal)
export async function uploadFile(filePath, fileName) {
  const { readFile } = await import('node:fs/promises');
  const buf = await readFile(filePath);
  const form = new FormData();
  form.append('file', new Blob([buf]), fileName);
  const res = await fetch(API + '/files', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Notion-Version': '2022-06-28' },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(res.status + ': ' + (data.message || JSON.stringify(data)));
  return data.file.url;
}

// Subir bloques en chunks de 90 (límite API = 100)
export async function appendBlocks(parentId, blocks, label = 'bloques') {
  for (let i = 0; i < blocks.length; i += 90) {
    const chunk = blocks.slice(i, i + 90);
    await notion('PATCH', `/blocks/${parentId}/children`, { children: chunk });
    console.log(`  [${label}] subidos ${i + chunk.length}/${blocks.length}`);
  }
}

// Limpiar todos los bloques hijos de una página (con paginación)
export async function clearPage(pageId) {
  let cursor = undefined;
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
