// upload-imgur-u1poo.mjs — Sube los diagramas a Imgur (URLs permanentes
// y compatibles con el visor de imágenes de Notion) y guarda urls.json
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = '/home/leo/final-unidad-1/poo/imagenes';
const CLIENT_ID = '546c25a59c58ad7'; // client ID público para subidas anónimas

const FILES = [
  'casos_de_uso.png',
  'clases.png',
  'secuencia_canalizacion.png',
  'actividad_riesgo.png',
  'secuencia_citas.png',
];

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
console.log('OK:', Object.keys(urls).length, 'imagenes en imgur');
