// upload-imgur-u2.mjs — Sube los diagramas de final-unidad-2 a Imgur
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = '/home/leo/final-unidad-2/imagenes';
const CLIENT_ID = '546c25a59c58ad7';

const FILES = ['clases.png', 'casos_de_uso.png', 'secuencia_prestamo.png'];

async function upload(file) {
  const data = readFileSync(`${BASE}/${file}`);
  const form = new FormData();
  form.append('image', new Blob([data]), file);
  form.append('type', 'file');
  const res = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: { 'Authorization': `Client-ID ${CLIENT_ID}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`${file}: ${json.data?.error || res.status}`);
  return `https://i.imgur.com/${json.data.id}.png`;
}

const urls = {};
for (const f of FILES) {
  const url = await upload(f);
  urls[f.replace('.png', '')] = url;
  console.log(f, '->', url);
}
writeFileSync(`${BASE}/urls.json`, JSON.stringify(urls, null, 2));
console.log('OK:', Object.keys(urls).length);
