// render-u2.mjs — Renderiza los .puml de final-unidad-2 a PNG vía kroki.io
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '/home/leo/final-unidad-2/diagramas';
const OUT = '/home/leo/final-unidad-2/imagenes';

const DIAGRAMS = ['clases', 'casos_de_uso', 'secuencia_prestamo'];

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
