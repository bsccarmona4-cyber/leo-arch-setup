// upload-u1poo.mjs — Sube los diagramas a catbox y guarda urls.json
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const BASE = '/home/leo/final-unidad-1/poo/imagenes';
const FILES = [
  'casos_de_uso.png',
  'clases.png',
  'secuencia_canalizacion.png',
  'actividad_riesgo.png',
  'secuencia_citas.png',
];

const urls = {};
for (const f of FILES) {
  const path = `${BASE}/${f}`;
  let out = '';
  for (let attempt = 1; attempt <= 4; attempt++) {
    out = execFileSync('curl', ['-s', '-A', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '-F', 'reqtype=fileupload', '-F', `fileToUpload=@${path}`, 'https://catbox.moe/user/api.php'], { encoding: 'utf8' }).trim();
    if (out.startsWith('http')) break;
    console.log(`  reintento ${f} (intento ${attempt}): respuesta vacía`);
    execFileSync('sleep', ['3']);
  }
  if (!out.startsWith('http')) throw new Error(`Fallo subida ${f}: ${out}`);
  urls[f.replace('.png', '')] = out;
  console.log(f, '->', out);
  execFileSync('sleep', ['2']);
}
writeFileSync(`${BASE}/urls.json`, JSON.stringify(urls, null, 2));
console.log('OK:', Object.keys(urls).length, 'imagenes');
