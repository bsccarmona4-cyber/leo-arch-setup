// render-diagramas.mjs — Renderiza los .puml a PNG vía kroki.io
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '/home/leo/final-unidad-1/poo/diagramas';
const OUT = '/home/leo/final-unidad-1/poo/imagenes';

const DIAGRAMS = [
  'casos_de_uso',
  'clases',
  'secuencia_canalizacion',
  'actividad_riesgo',
  'secuencia_citas',
];

for (const name of DIAGRAMS) {
  const src = readFileSync(join(DIR, `${name}.puml`), 'utf8');
  const res = await fetch('https://kroki.io/plantuml/png', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: src,
  });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(OUT, `${name}.png`), buf);
  console.log(`${name}.png  ${buf.length} bytes`);
}
console.log('OK');
