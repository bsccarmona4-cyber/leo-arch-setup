// Sube el informe UX completo a la página FINAL U3 (después del primer bloque)
// Imágenes: subidas a catbox.moe (host público) y referenciadas como external en Notion
import { readFileSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { resolve } from 'path';

const TOKEN = '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';
const API = 'https://api.notion.com/v1';
const PAGE_ID = '3b89e9ed-c6fb-8037-9c19-ea11362627e7';
const AFTER_BLOCK = '3b89e9ed-c6fb-8084-a4d1-e1416a210589'; // primer bloque (synced_block)
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

// Sube a catbox.moe vía curl (multipart) y devuelve URL pública
function subirCatbox(ruta) {
  const nombre = ruta.split('/').pop();
  const out = execFileSync('curl', ['-s', '-F', 'reqtype=fileupload', '-F', 'fileToUpload=@' + ruta, 'https://catbox.moe/user/api.php'], { encoding: 'utf8' }).trim();
  if (!out.startsWith('http')) throw new Error('catbox falló para ' + nombre + ': ' + out);
  console.log('  ↑ imagen:', nombre, '->', out);
  return out;
}

function blockImagen(url, caption) {
  return { type: 'image', image: { type: 'external', external: { url }, caption: [{ type: 'text', text: { content: caption } }] } };
}

// ---- Helpers de texto ----
const H = (lvl, text) => ({ ['heading_' + lvl]: { rich_text: [{ type: 'text', text: { content: text } }] } });
const P = (text) => ({ paragraph: { rich_text: [{ type: 'text', text: { content: text } }] } });
const B = (text) => ({ bulleted_list_item: { rich_text: [{ type: 'text', text: { content: text } }] } });
const D = () => ({ divider: {} });
const CAL = (text, emoji) => ({ callout: { rich_text: [{ type: 'text', text: { content: text } }], icon: { emoji: emoji || '💡' } } });
function TABLE(headers, rows) {
  return {
    type: 'table', table: { table_width: headers.length, has_column_header: true,
      children: [
        { type: 'table_row', table_row: { cells: headers.map(h => [{ type: 'text', text: { content: h } }]) } },
        ...rows.map(r => ({ type: 'table_row', table_row: { cells: r.map(c => [{ type: 'text', text: { content: String(c ?? '') } }]) } })),
      ] },
  };
}

// ---- 1. Subir imágenes a catbox ----
const pngs = readdirSync(CAPTURAS).filter(f => f.endsWith('.png')).sort();
console.log('Subiendo', pngs.length + 1, 'imágenes a catbox...');
const img = {};
for (const f of pngs) {
  const key = f.replace('.png', '');
  const url = subirCatbox(resolve(CAPTURAS, f));
  img[key] = blockImagen(url, key.replace(/__/g, ' · '));
}
const urlDiag = subirCatbox(DIAGRAMA);
img.diagrama = blockImagen(urlDiag, 'Diagrama de Casos de Uso — UML');

// ---- 2. Construir bloques del informe ----
const blocks = [];

// PORTADA
blocks.push(H(1, '🏥 Plataforma de Gestión de Citas Médicas y Expediente Electrónico'));
blocks.push(P('Informe Final — Experiencia de Usuario (Unidad 3) · Hospital de alcance local · Agosto 2026'));
blocks.push(CAL('Objetivo del proyecto: reducir los tiempos de espera y la aglomeración en recepción mediante la digitalización de la atención médica primaria. Plataforma web y móvil, intuitiva, accesible y eficiente para adultos mayores (usuarios frecuentes), pacientes jóvenes y personal médico.', '🎯'));
blocks.push(D());

// 1. DIAGRAMA DE CASOS DE USO
blocks.push(H(2, '1. Diagrama de Casos de Uso'));
blocks.push(P('Se modelan los flujos principales del sistema con UML: agendar cita, cancelar/reprogramar, consultar historial médico y gestionar disponibilidad del médico. Se identifican actores principales (Paciente, con sus perfiles Adulto Mayor y Joven) y secundarios (Médico, Recepcionista y Sistema de Recordatorios).'));
blocks.push(img.diagrama);
blocks.push(H(3, 'Actores identificados'));
blocks.push(TABLE(['Actor', 'Tipo', 'Casos de uso principales'], [
  ['Paciente (principal)', 'Principal', 'Agendar, cancelar, reprogramar, consultar historial, expediente, receta, recordatorios'],
  ['Paciente Adulto Mayor', 'Principal (herencia)', 'Mismos que Paciente, con flujo simplificado y accesible'],
  ['Paciente Joven', 'Principal (herencia)', 'Mismos que Paciente, con canales digitales avanzados'],
  ['Médico', 'Secundario', 'Gestionar disponibilidad, consultar expediente e historial, agendar'],
  ['Recepcionista', 'Secundario', 'Registrar paciente, confirmar cita, agendar por ventanilla/teléfono'],
  ['Sistema de Recordatorios', 'Secundario (no humano)', 'Enviar recordatorios automáticos al paciente'],
]));
blocks.push(B('Relaciones <<include>>: Agendar cita → Verificar disponibilidad y Autenticarse; Consultar historial/expediente → Autenticarse.'));
blocks.push(B('Relación <<extend>>: Reprogramar cita extiende Cancelar cita (al reprogramar se libera la cita anterior).'));
blocks.push(D());

// 2. PROTOPERSONAS
blocks.push(H(2, '2. Características de los Usuarios y Stakeholders (Protopersonas)'));
blocks.push(P('Se elaboraron dos fichas de protopersonas representativas: una paciente adulto mayor con poca destreza tecnológica y un médico especialista con poco tiempo disponible. Cada ficha incluye objetivos, necesidades, frustraciones y contexto de uso.'));
blocks.push(img['protopersonas__protopersonas']);
blocks.push(H(3, 'Resumen de perfiles'));
blocks.push(TABLE(['Perfil', 'Objetivo principal', 'Necesidad clave', 'Frustración principal'], [
  ['María "Lupita" Hernández (67)', 'Agendar sin filas y entender su cita', 'Letra grande, pasos guiados, confirmación por WhatsApp', 'Filas largas y miedo a equivocarse en apps'],
  ['Dr. Carlos Mendoza (45)', 'Agenda clara y expediente a la mano', 'Ver agenda de un vistazo, bloquear horarios, recordatorios', 'No-shows y expedientes en papel'],
]));
blocks.push(D());

// 3. ESTRATEGIA DE INVESTIGACIÓN
blocks.push(H(2, '3. Estrategia de Investigación'));
blocks.push(P('Plan de investigación UX con metodología mixta para comprender los hábitos de los pacientes y los puntos de fricción del proceso actual.'));
blocks.push(img['estrategia__estrategia']);
blocks.push(H(3, 'Síntesis del plan'));
blocks.push(B('Metodología: entrevistas cualitativas semiestructuradas (12 pacientes, 4 médicos, 3 administrativos) + encuestas cuantitativas (120 respuestas) + observación directa en sala de espera (2 semanas).'));
blocks.push(B('Objetivos: identificar fricciones del agendado actual, medir tiempos de espera reales, detectar barreras de accesibilidad en adultos mayores y validar la aceptación de la plataforma.'));
blocks.push(B('Preguntas clave: ¿cómo agenda hoy el paciente? ¿cuánto espera? ¿qué canal prefiere? ¿qué barreras tecnológicas enfrenta el adulto mayor? ¿qué le daría confianza para ingresar sus datos?'));
blocks.push(D());

// 4. BENCHMARKING
blocks.push(H(2, '4. Análisis de Competencia (Benchmarking)'));
blocks.push(P('Análisis comparativo de tres plataformas de salud o gestión de citas (locales e internacionales): Doctoralia, Zocdoc y Mi Salud Digital (IMSS). Se identifican fortalezas, debilidades, buenas prácticas de UX y áreas de oportunidad.'));
blocks.push(img['benchmarking__benchmarking']);
blocks.push(H(3, 'Matriz comparativa resumida'));
blocks.push(TABLE(['Criterio', 'Doctoralia', 'Zocdoc', 'Mi Salud IMSS'], [
  ['Agendado en línea', '✓', '✓', '✓'],
  ['Recordatorios automáticos', '✓', '✓', '✗'],
  ['Expediente electrónico', '✗', '✗', '✓'],
  ['Modo accesible (adultos mayores)', 'Parcial', 'Parcial', '✗'],
  ['Cancelación/reprogramación en línea', '✓', '✓', 'Parcial'],
  ['Búsqueda por especialidad', '✓', '✓', 'Parcial'],
]));
blocks.push(CAL('Oportunidad detectada: ninguna plataforma combina agendado simple (3 pasos), expediente electrónico y accesibilidad para adultos mayores. Diferenciador: confirmaciones y recordatorios por WhatsApp, el canal que dominan los adultos mayores en México.', '💡'));
blocks.push(D());

// 5. WIREFRAMES
blocks.push(H(2, '5. Wireframes / Mockups'));
blocks.push(P('Esquemas estructurales de baja/media fidelidad para las pantallas clave: pantalla principal, calendario de citas, confirmación y expediente electrónico. Diseñados con botones grandes, alto contraste y máximo 3 acciones visibles por pantalla.'));
blocks.push(img['wireframes__wireframes']);
blocks.push(B('W1 Pantalla principal: botón único "Agendar cita" arriba del pliegue, accesos a Mis citas, Expediente y Perfil.'));
blocks.push(B('W2 Calendario: selector de especialidad, días disponibles y franjas horarias en 1 toque.'));
blocks.push(B('W3 Confirmación: resumen verificable antes de confirmar + recordatorio opcional por WhatsApp.'));
blocks.push(B('W4 Expediente: historial cronológico de consultas, recetas, resultados y descarga en PDF.'));
blocks.push(D());

// 6. PROTOTIPO FUNCIONAL
blocks.push(H(2, '6. Diseño de Prototipo Funcional Centrado en el Usuario'));
blocks.push(P('Prototipo navegable e interactivo (HTML/CSS) que cumple principios de usabilidad, legibilidad y accesibilidad: botones ≥44px, alto contraste, máximo 3 acciones por pantalla, lenguaje sencillo y recordatorios por WhatsApp. Flujo completo: agendar → especialidad → calendario → confirmación → éxito → expediente.'));
const protoCaps = ['index', 'especialidades', 'calendario', 'confirmacion', 'exito', 'expediente'];
for (const c of protoCaps) {
  const kk = Object.keys(img).find(x => x.includes('prototipo__' + c));
  if (kk) blocks.push(img[kk]);
}
blocks.push(P('Pantallas del prototipo (arriba → abajo): inicio, selección de especialidad, calendario con horarios, confirmación, pantalla de éxito y expediente electrónico.'));
blocks.push(D());

// 7. PRUEBAS DE USABILIDAD
blocks.push(H(2, '7. Pruebas de Usabilidad'));
blocks.push(P('Plan básico de pruebas con usuarios reales o simulados: 9 participantes (4 adultos mayores, 3 pacientes jóvenes, 2 médicos), 5 tareas, métricas de tiempo por tarea, tasa de éxito y retroalimentación cualitativa.'));
blocks.push(img['pruebas__pruebas']);
blocks.push(H(3, 'Tareas del estudio'));
blocks.push(TABLE(['ID', 'Tarea', 'Criterio de éxito', 'Tiempo objetivo'], [
  ['T1', 'Agenda una cita con un cardiólogo para el próximo martes a las 10:00 AM', 'Cita confirmada', '≤ 3 min'],
  ['T2', 'Cancela tu cita del 18 de agosto', 'Cita cancelada', '≤ 1.5 min'],
  ['T3', 'Reprograma tu cita al jueves siguiente', 'Nueva fecha confirmada', '≤ 2 min'],
  ['T4', 'Consulta tu último resultado de laboratorio', 'Resultado encontrado', '≤ 1.5 min'],
  ['T5', 'Descarga tu receta médica', 'PDF descargado', '≤ 1 min'],
]));
blocks.push(CAL('Umbrales de aceptación: tasa de éxito T1 ≥ 80% sin ayuda, tiempo promedio ≤ 180 s, errores ≤ 2 por tarea, SUS ≥ 70 y abandono ≤ 10%.', '📊'));
blocks.push(D());

// CIERRE
blocks.push(H(2, 'Conclusiones del Informe'));
blocks.push(B('El flujo de agendado se reduce a 3 pasos (especialidad → médico → hora), con confirmación verificable y recordatorios por WhatsApp.'));
blocks.push(B('El diseño prioriza la accesibilidad para adultos mayores: letra grande, alto contraste, lenguaje sencillo y ayuda al alcance.'));
blocks.push(B('La oportunidad de mercado está en combinar agendado simple + expediente electrónico + canal WhatsApp, algo que ninguna plataforma analizada ofrece.'));
blocks.push(CAL('Informe generado como parte del entregable de la Unidad 3 — Experiencia de Usuario. Diagramas y capturas generados con PlantUML y render HTML. · Equipo de Diseño UX · Agosto 2026', '✅'));

console.log('Bloques a insertar:', blocks.length);

// ---- 3. Insertar después del primer bloque ----
const CHUNK = 50;
let inserted = 0;
for (let i = 0; i < blocks.length; i += CHUNK) {
  const chunk = blocks.slice(i, i + CHUNK);
  const body = { children: chunk };
  if (i === 0) body.after = AFTER_BLOCK;
  const res = await notion('PATCH', '/blocks/' + PAGE_ID + '/children', body);
  inserted += res.results?.length || chunk.length;
  console.log('  ✓ insertados', inserted, '/', blocks.length);
}

console.log('DONE — Informe subido a FINAL U3');
