// V2 limpia: re-subir imágenes a uguu + captions descriptivos + quitar meta-info de texto
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

function subirUguu(ruta) {
  const out = execFileSync('curl', ['-s', '-F', 'files[]=@' + ruta, 'https://uguu.se/upload.php'], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const j = JSON.parse(out);
  const url = j?.files?.[0]?.url;
  if (!url) throw new Error('uguu falló para ' + ruta + ': ' + out.slice(0, 200));
  return url;
}

// Captions nuevos por caption actual
const NUEVOS_CAPTIONS = {
  'protopersonas · protopersonas': 'Fichas de protopersonas: paciente adulto mayor y médico especialista',
  'estrategia · estrategia': 'Estrategia de investigación: metodología, objetivos y preguntas clave',
  'benchmarking · benchmarking': 'Análisis comparativo de plataformas de salud y gestión de citas',
  'wireframes · wireframes': 'Wireframes de baja/media fidelidad de las pantallas clave',
  'prototipo · index': 'Prototipo — Pantalla principal',
  'prototipo · especialidades': 'Prototipo — Selección de especialidad',
  'prototipo · calendario': 'Prototipo — Calendario y horarios disponibles',
  'prototipo · confirmacion': 'Prototipo — Confirmación de cita',
  'prototipo · exito': 'Prototipo — Cita confirmada',
  'prototipo · expediente': 'Prototipo — Expediente electrónico',
  'pruebas · pruebas': 'Plan de pruebas de usabilidad: tareas y métricas',
};

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

// 1. Leer bloques
let blocks = [];
let cursor;
do {
  const q = '/blocks/' + PAGE_ID + '/children?page_size=100' + (cursor ? '&start_cursor=' + cursor : '');
  const r = await notion('GET', q);
  blocks = blocks.concat(r.results);
  cursor = r.has_more ? r.next_cursor : null;
} while (cursor);

// 2. Imágenes: re-subir + actualizar URL y caption
const imgs = blocks.filter(b => b.type === 'image');
console.log('Imágenes:', imgs.length);
for (const b of imgs) {
  const caption = (b.image?.caption || []).map(t => t.plain_text).join('') || '';
  const local = archivoLocal(caption);
  const nuevoCaption = NUEVOS_CAPTIONS[caption] || caption;
  const url = subirUguu(local);
  await notion('PATCH', '/blocks/' + b.id, {
    image: { external: { url }, caption: [{ type: 'text', text: { content: nuevoCaption } }] },
  });
  console.log('  ✓', (caption || '?').slice(0, 30).padEnd(32), '->', 'caption:' + nuevoCaption.slice(0, 40));
}

// 3. Texto: quitar meta-info
for (const b of blocks) {
  const text = (b[b.type]?.rich_text || []).map(t => t.plain_text).join('');
  if (b.type === 'paragraph' && text.startsWith('Informe Final — Experiencia de Usuario')) {
    await notion('PATCH', '/blocks/' + b.id, {
      paragraph: { rich_text: [{ type: 'text', text: { content: 'Plataforma web y móvil para reducir los tiempos de espera y la aglomeración en recepción: gestión de citas médicas y consulta de expediente electrónico para pacientes adultos mayores, pacientes jóvenes y personal médico.' } }] },
    });
    console.log('  ✓ párrafo portada actualizado');
  }
  if (b.type === 'paragraph' && text.startsWith('Prototipo navegable e interactivo (HTML/CSS)')) {
    await notion('PATCH', '/blocks/' + b.id, {
      paragraph: { rich_text: [{ type: 'text', text: { content: 'Prototipo funcional centrado en el usuario que asegura el cumplimiento de principios de usabilidad, legibilidad y accesibilidad. Flujo completo: agendar cita, elegir especialidad, seleccionar fecha y hora, confirmar y consultar el expediente.' } }] },
    });
    console.log('  ✓ párrafo sección 6 actualizado');
  }
  if (b.type === 'callout' && text.startsWith('Informe generado como parte del entregable')) {
    await notion('DELETE', '/blocks/' + b.id);
    console.log('  ✓ callout de cierre eliminado');
  }
}

console.log('DONE');
