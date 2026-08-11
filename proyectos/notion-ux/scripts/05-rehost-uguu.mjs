// Re-hospeda las imágenes (catbox → uguu.se) y actualiza los bloques image en FINAL U3
import { execFileSync } from 'child_process';
import { resolve } from 'path';

const TOKEN = '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';
const API = 'https://api.notion.com/v1';
const PAGE_ID = '3b89e9ed-c6fb-8037-9c19-ea11362627e7';
const CAPTURAS = resolve('/home/leo/notion-ux/capturas');
const DIAGRAMA = resolve('/home/leo/notion-ux/materiales/diagrama/casos_de_uso.png');

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

// Sube un archivo a uguu.se y devuelve la URL directa d.uguu.se
function subirUguu(ruta) {
  const out = execFileSync('curl', ['-s', '-F', 'files[]=@' + ruta, 'https://uguu.se/upload.php'], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const j = JSON.parse(out);
  const url = j?.files?.[0]?.url;
  if (!url) throw new Error('uguu falló para ' + ruta + ': ' + out.slice(0, 200));
  return url;
}

// Mapea caption → archivo local
function archivoLocal(caption) {
  const c = (caption || '').trim();
  if (c.startsWith('Diagrama')) return DIAGRAMA;
  if (c.startsWith('prototipo ·')) {
    const resto = c.replace('prototipo ·', '').trim();
    return resolve(CAPTURAS, 'prototipo__' + resto + '.png');
  }
  const [a, b] = c.split(' ·');
  return resolve(CAPTURAS, (a || '').trim() + '__' + ((b || a) || '').trim() + '.png');
}

// 1. Leer bloques de la página
let blocks = [];
let cursor;
do {
  const q = '/blocks/' + PAGE_ID + '/children?page_size=100' + (cursor ? '&start_cursor=' + cursor : '');
  const r = await notion('GET', q);
  blocks = blocks.concat(r.results);
  cursor = r.has_more ? r.next_cursor : null;
} while (cursor);

const imgs = blocks.filter(b => b.type === 'image');
console.log('Bloques image encontrados:', imgs.length);

// 2. Re-hospedar y actualizar
let ok = 0;
for (const b of imgs) {
  const caption = (b.image?.caption || []).map(t => t.plain_text).join('') || '(sin caption)';
  const local = archivoLocal(caption);
  if (!local) { console.log('✗ sin archivo local para:', caption); continue; }
  const url = subirUguu(local);
  await notion('PATCH', '/blocks/' + b.id, { image: { external: { url } } });
  ok++;
  console.log('✓', caption, '->', url);
}

console.log('DONE —', ok, 'bloques actualizados');
