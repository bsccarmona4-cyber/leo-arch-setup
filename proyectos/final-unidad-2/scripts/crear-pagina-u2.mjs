// crear-pagina-u2.mjs — Crea la página "FINAL U2 POO" en Notion,
// con el mismo padre que FINAL U1 POO
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

// 1) Ver el padre de FINAL U1 POO
const u1 = await notion('GET', '/pages/3b99e9ed-c6fb-8001-ac43-c1701717d357');
console.log('Padre de FINAL U1 POO:', JSON.stringify(u1.parent));

// 2) Crear la página FINAL U2 POO como hija de FINAL U1 POO
// (la integración no permite páginas a nivel workspace; el dueño
// puede arrastrarla después a donde prefiera)
const body = {
  parent: { type: 'page_id', page_id: '3b99e9ed-c6fb-8001-ac43-c1701717d357' },
  properties: {
    title: { title: [{ text: { content: 'FINAL U2 POO' } }] },
  },
};
const created = await notion('POST', '/pages', body);
console.log('Creada:', created.id, '|', created.url);
