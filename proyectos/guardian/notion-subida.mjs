const TOKEN = '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';
const API = 'https://api.notion.com/v1';
const PAGE_ID = '3969e9ed-c6fb-8044-a239-c54ef1063639';

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

// Clear existing
const existing = await notion('GET', '/blocks/' + PAGE_ID + '/children?page_size=100');
for (const block of (existing.results || [])) {
  await notion('DELETE', '/blocks/' + block.id);
}

// Helper functions - plain JS
function H(lvl, text) {
  const key = 'heading_' + lvl;
  return { [key]: { rich_text: [{ text: { content: text } }] } };
}

function P(text) {
  return { paragraph: { rich_text: [{ text: { content: text } }] } };
}

function D() {
  return { divider: {} };
}

function B(text) {
  return { bulleted_list_item: { rich_text: [{ text: { content: text } }] } };
}

function NB(text) {
  return { numbered_list_item: { rich_text: [{ text: { content: text } }] } };
}

function CAL(text, emoji) {
  return { callout: { rich_text: [{ text: { content: text } }], icon: { emoji: emoji || '💡' } } };
}

function TABLE(headers, rows) {
  var children = [];
  children.push({ type: 'table_row', table_row: { cells: headers.map(function(h) { return [{ text: { content: h } }]; }) } });
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    children.push({ type: 'table_row', table_row: { cells: row.map(function(c) { return [{ text: { content: String(c || '') } }]; }) } });
  }
  return { type: 'table', table: { table_width: headers.length, children: children } };
}

var blocks = [
  // PORTADA
  { heading_1: { rich_text: [{ text: { content: 'Guardián — Sistema Anti-Fraude Digital' } }] } },
  P('Documento de proyecto — Tópicos de Calidad de Software | UPVT ITI TSU | Julio 2026'),
  D(),

  // 1. INVESTIGACIÓN MERCADO
  H(1, '1. Investigación de Mercado'),
  H(2, '1.1 El Problema'),
  P('Adultos mayores mexicanos reciben links fraudulentos por WhatsApp y no tienen forma confiable de verificar si son seguros. Las estafas digitales crecieron 38% anual.'),
  H(2, '1.2 Datos Clave'),
  TABLE(
    ['Indicador', 'Valor', 'Fuente'],
    [
      ['Crecimiento fraudes MX 2024-2025', '+38%', 'Condusef'],
      ['Adultos mayores víctimas', '23% del total', 'INEGI'],
      ['Valor perdido anual por adultos mayores', '1,470 M MXN', 'Condusef'],
      ['Usan solo WhatsApp', '94%', 'IFT México'],
      ['Phishing como fraude más común', '34% de incidentes', 'Kaspersky MX'],
      ['Falso SAT vía WhatsApp', '+160% en 2025', 'SAT MX'],
      ['Tasa de denuncia en adultos mayores', '12%', 'ENS'],
      ['Estafa promedio por adulto mayor', '28,000 MXN', 'Condusef'],
    ]
  ),
  H(2, '1.3 Tipos de Fraude'),
  TABLE(
    ['Tipo', '%', 'Canal Principal', 'Descripción'],
    [
      ['Phishing (links)', '34%', 'WhatsApp / SMS', 'Suplantan SAT, bancos, gobierno'],
      ['Smishing (SMS)', '22%', 'SMS', 'Urgencia falsa, tarjeta bloqueada'],
      ['Vishing (llamadas)', '18%', 'Teléfono', 'Suplantan instituciones'],
      ['Suplantación redes', '12%', 'Facebook / WhatsApp', 'Perfiles falsos de familiares'],
      ['Otros', '14%', 'Web', 'Compras falsas, inversiones'],
    ]
  ),
  H(2, '1.4 Oportunidad'),
  CAL('Mercado virgen. 0 competidores directos en México. 18 millones de adultos mayores desprotegidos. 3,500 M MXN pérdida anual.', '🎯'),
  D(),

  // 2. ANÁLISIS COMPETENCIA
  H(1, '2. Análisis de Competencia'),
  H(2, '2.1 Mapa de Competidores'),
  TABLE(
    ['Producto', 'Tipo', 'Precio', 'Contexto MX', 'WhatsApp', 'Sin instalar', 'Gratuito'],
    [
      ['Trend Micro Check', 'App + extensión', '~30 USD/año', 'No', 'No', 'No', 'Parcial'],
      ['Guardio', 'Extensión Chrome', '9.99 USD/mes', 'No', 'No', 'No', 'No'],
      ['VirusTotal', 'Web + API', 'Gratis', 'No', 'No', 'Sí', 'Sí'],
      ['PhishTank', 'Base datos', 'Gratis', 'No', 'No', 'Sí', 'Sí'],
      ['Any.Run', 'Sandbox web', 'Gratis/99 USD', 'No', 'No', 'Sí', 'Parcial'],
      ['Bots Telegram', 'Bot', 'Gratis', 'No', 'No', 'Sí', 'Sí'],
      ['Herramientas MX', 'Informativas', 'Gratis', 'Sí', 'No', 'Sí', 'Sí'],
      ['Guardián', 'Bot WhatsApp + Web', 'Gratis / 99 MXN', 'Sí', 'Sí', 'Sí', 'Sí'],
    ]
  ),
  H(2, '2.2 Seis Brechas de Mercado'),
  B('Brecha 1: Contexto México — Ningún competidor entiende SAT, BBVA, Banamex, Condusef, CFE'),
  B('Brecha 2: WhatsApp nativo — 94% adultos mayores usan solo WhatsApp. Competidores requieren app o extensión'),
  B('Brecha 3: Sin instalación — Bot WhatsApp: reenvías link, recibes resultado. Cero fricción'),
  B('Brecha 4: Precio accesible — Competidores $200+ MXN/mes. Pensión promedio $6,000 MXN'),
  B('Brecha 5: Prevención + Dashboard — PhishTank solo lookup. Guardián alertas proactivas + dashboard familiar'),
  B('Brecha 6: Crowdsourcing MX — Como PhishTank pero enfocado fraudes mexicanos'),
  H(2, '2.3 Posicionamiento'),
  CAL('Primer servicio anti-phishing diseñado específicamente para México. WhatsApp nativo. Sin instalación. Gratuito. IA entrenada en fraudes mexicanos.', '🛡️'),
  D(),

  // 3. CASOS DE USO
  H(1, '3. Diagrama de Casos de Uso'),
  H(2, '3.1 Actores'),
  TABLE(
    ['Actor', 'Descripción', 'Canal Principal'],
    [
      ['Usuario (Adulto Mayor)', 'Recibe links, envía al bot, recibe veredicto', 'WhatsApp / Web'],
      ['Familiar Cuidador', 'Monitorea alertas, historial, configura protección', 'Dashboard'],
      ['Administrador', 'Opera sistema, monitorea amenazas, estadísticas', 'Dashboard'],
    ]
  ),
  H(2, '3.2 Ocho Casos de Uso'),
  TABLE(
    ['ID', 'Caso de Uso', 'Actor', 'Prioridad'],
    [
      ['CU-01', 'Analizar link vía web', 'Usuario', 'Alta'],
      ['CU-02', 'Analizar link vía WhatsApp', 'Usuario', 'Alta'],
      ['CU-03', 'Ver dashboard en vivo', 'Admin', 'Media'],
      ['CU-04', 'Ver feed de análisis', 'Admin', 'Media'],
      ['CU-05', 'Ver detalle de amenaza', 'Admin', 'Baja'],
      ['CU-06', 'Filtrar análisis', 'Admin', 'Baja'],
      ['CU-07', 'Ver estadísticas', 'Admin', 'Media'],
      ['CU-08', 'Recibir alerta de fraude', 'Usuario', 'Alta'],
    ]
  ),
  H(2, '3.3 Pipeline Seis Capas'),
  NB('Capa 1: Resolver URL — redirecciones, cadena, max 10 saltos. Bloqueo SSRF'),
  NB('Capa 2: WHOIS — edad dominio. <7 días alerta alta, <30 días alerta media'),
  NB('Capa 3: PhishTank — URL reportada? +50 score directo'),
  NB('Capa 4: Brand Check MX — Levenshtein vs 15+ marcas mexicanas (SAT, BBVA, Banamex)'),
  NB('Capa 5: LLM DeepSeek/Groq — análisis semántico. Urgencia, datos sensibles, suplantación'),
  NB('Capa 6: Fusión 30% técnico + 70% LLM — veredicto final 0-100'),
  H(2, '3.4 Veredictos'),
  TABLE(
    ['Veredicto', 'Score', 'Significado', 'Acción'],
    [
      ['Seguro', '0-24', 'Sin señales de fraude', 'Navega con confianza'],
      ['Sospechoso', '25-64', 'Señales presentes', 'Verifica antes de dar datos'],
      ['Fraude', '65-100', 'Fraude confirmado', 'No ingreses ningún dato'],
    ]
  ),
  D(),

  // 4. PROTOPERSONAS
  H(1, '4. Protopersonas'),
  CAL('Tres arquetipos de usuario que definen el diseño de Guardián. Basados en datos INEGI, Condusef y observación de campo.', '👥'),

  H(2, '4.1 María García — 72 años — Usuaria Principal'),
  CAL('"Mi hijo me dice no le hagas caso, pero el mensaje tiene el logo del SAT y mi nombre. ¿Y si pierdo mi devolución?"', '👵'),
  TABLE(
    ['Atributo', 'Valor'],
    [
      ['Edad', '72 años'],
      ['Residencia', 'CDMX, Iztapalapa'],
      ['Ocupación', 'Jubilada, ama de casa'],
      ['Educación', 'Secundaria'],
      ['Tecnología', 'Moto E, solo WhatsApp'],
      ['Ingreso', '$6,000 MXN/mes'],
      ['Apps', 'WhatsApp, llamadas, cámara'],
      ['Vivienda', 'Sola, hijos en otra colonia'],
    ]
  ),
  B('Dolores: Miedo a SAT, recibe links falsos diario, no distingue URLs, vergüenza de preguntar, ha perdido dinero'),
  B('Necesidades: Alguien que le diga "esto es seguro", proceso simple reenviar-recibir, sin apps, en español claro'),
  B('Comportamiento: WhatsApp 3-4 hrs/día, 0 apps bancarias, 0 redes sociales'),

  H(2, '4.2 Roberto Hernández — 68 años — Usuario Secundario'),
  CAL('"Sé que existen estafas. Pero cuando el mensaje tiene el logo del banco y mi nombre exacto, dudo."', '👨‍💼'),
  TABLE(
    ['Atributo', 'Valor'],
    [
      ['Edad', '68 años'],
      ['Residencia', 'Zapopan, Jalisco'],
      ['Ocupación', 'Contador jubilado'],
      ['Educación', 'Universidad (Contaduría)'],
      ['Tecnología', 'iPhone SE 2022 + laptop HP'],
      ['Ingreso', '$15,000 MXN/mes'],
      ['Apps', 'WhatsApp, BBVA, Banamex, Facebook'],
      ['Vivienda', 'Con esposa, hijos en Querétaro'],
    ]
  ),
  B('Dolores: Mensajes de tarjeta bloqueada, entró a link falso una vez, hijos lejos, amigos también caen'),
  B('Necesidades: Verificación rápida <5s, compartir con amigos, confirmación visual (verde/rojo), explicación breve'),

  H(2, '4.3 Ana García — 45 años — Familiar Cuidador'),
  CAL('"Mi mamá me manda capturas preguntando si es verdad. Yo no puedo contestar rápido. Necesito ayuda."', '👩‍💻'),
  TABLE(
    ['Atributo', 'Valor'],
    [
      ['Edad', '45 años'],
      ['Relación', 'Hija de María'],
      ['Residencia', 'CDMX, Benito Juárez'],
      ['Ocupación', 'Contadora, jornada completa'],
      ['Tecnología', 'iPhone 14 + MacBook Air'],
      ['Ingreso', '$28,000 MXN/mes'],
      ['Familia', 'Casada, 2 hijos, mamá sola'],
    ]
  ),
  B('Dolores: No protege en tiempo real, mamá no cuenta casi-caídas, frustración, preocupación por pensión'),
  B('Necesidades: Alertas tiempo real, historial, configuración remota, tranquilidad. Disposición a pagar $99/mes'),

  H(2, '4.4 Matriz de Funcionalidades'),
  TABLE(
    ['Funcionalidad', 'María', 'Roberto', 'Ana', 'Admin'],
    [
      ['Enviar link', 'WhatsApp', 'WhatsApp/Web', '—', '—'],
      ['Veredicto claro', 'Sí', 'Sí', '—', '—'],
      ['Explicación', 'No', 'Opcional', 'Sí', 'Sí'],
      ['Dashboard', '—', '—', 'Sí', 'Sí'],
      ['Alertas', '—', '—', 'Alta', 'Alta'],
      ['Historial', 'No', 'Opcional', 'Sí', 'Sí'],
      ['Configurar', 'No', 'Sí', 'Sí', 'Sí'],
      ['Recomendar', 'No', 'Sí', 'Sí', '—'],
    ]
  ),
  D(),

  // 5. ESTRATEGIA INVESTIGACIÓN
  H(1, '5. Estrategia de Investigación'),
  H(2, '5.1 Objetivos'),
  TABLE(
    ['Objetivo', 'Pregunta', 'Método', 'Duración'],
    [
      ['Validar dolor', 'Adultos reciben links y no verifican?', 'Encuesta + Entrevistas', '3 semanas'],
      ['Validar solución', 'Usarían bot WhatsApp?', 'Prototipo + Prueba', '2 semanas'],
      ['Validar precio', 'Pagarían $99/mes?', 'Encuesta precios', '1 semana'],
      ['Validar UX', 'Flujo es intuitivo?', 'Prueba usabilidad', '3 sesiones'],
      ['Validar precisión', 'Pipeline detecta fraudes MX?', 'Prueba técnica', 'Continuo'],
    ]
  ),
  H(2, '5.2 Segmento Usuarios'),
  TABLE(
    ['Segmento', 'Descripción', 'Perfil', 'Reclutamiento', 'N'],
    [
      ['Adulto bajo tech', 'Solo WhatsApp', 'María', 'Centros DIF, iglesias', '5'],
      ['Adulto tech media', 'Apps bancarias', 'Roberto', 'Clubes jubilados', '5'],
      ['Familiar cuidador', 'Monitorea padres', 'Ana', 'WhatsApp familiar', '5'],
      ['Control joven', '25-40 tech savvy', '—', 'Online', '5'],
    ]
  ),
  H(2, '5.3 Métricas Clave'),
  B('Tasa completitud análisis > 90%'),
  B('Tiempo entender veredicto < 10 segundos'),
  B('Tasa reenvío a familiares > 30%'),
  B('CSAT (satisfacción) > 4.0 / 5.0'),
  B('Precisión detector > 95%'),
  H(2, '5.4 Cronograma'),
  TABLE(
    ['Semana', 'Actividad', 'Entregable'],
    [
      ['1-2', 'Encuesta cuantitativa', 'Reporte 200+ respuestas'],
      ['3', 'Entrevistas cualitativas', 'Transcripts, mapa dolores'],
      ['4', 'Iteración prototipo', 'Prototipo V2'],
      ['5', 'Prueba usabilidad', 'Reporte métricas'],
      ['6', 'Ajustes finales', 'Prototipo V3 producción'],
    ]
  ),
  D(),

  // 6. DISEÑO VISUAL
  H(1, '6. Diseño Visual'),
  H(2, '6.1 Paleta'),
  TABLE(
    ['Token', 'Hex', 'Uso'],
    [
      ['surface', '#FAFAF9', 'Fondo página'],
      ['elevated', '#F5F5F4', 'Fondo tarjetas'],
      ['border', '#E7E5E4', 'Bordes'],
      ['text-muted', '#A8A29E', 'Texto secundario'],
      ['text-primary', '#292524', 'Texto principal'],
      ['accent', '#6366F1', 'Acento indigo'],
      ['success', '#16A34A', 'Seguro'],
      ['warning', '#D97706', 'Sospechoso'],
      ['danger', '#DC2626', 'Fraude'],
    ]
  ),
  H(2, '6.2 Wireframes'),
  CAL('Archivos HTML en /home/leo/guardian/wireframes/', '📁'),
  B('landing.html — Input URL + resultado + 3 pasos'),
  B('dashboard.html — KPIs, charts, feed, tabla amenazas'),
  B('protopersonas.html — 4 perfiles + matriz'),
  B('plan-pruebas.html — Tests, cobertura, flujo'),
  H(2, '6.3 Deck Presentación'),
  CAL('Deck HTML interactivo en /home/leo/guardian/deck-guardian.html. 17 slides. Navegación teclado/flechas.', '🎬'),
  D(),

  // 7. PLAN PRUEBAS
  H(1, '7. Plan de Pruebas'),
  H(2, '7.1 Tipos'),
  TABLE(
    ['Tipo', 'Herramienta', 'Alcance', 'Prioridad'],
    [
      ['Unitarias', 'Vitest', 'Scoring, validaciones Zod', 'Alta'],
      ['Integración', 'Supertest', 'API /analyze, webhooks', 'Alta'],
      ['Usabilidad', 'Sesiones', 'Flujo adultos mayores', 'Alta'],
      ['Accesibilidad', 'axe-core', 'WCAG 2.2 AA', 'Media'],
      ['Carga', 'k6', '100 req/min sostenidos', 'Baja'],
      ['Seguridad', 'OWASP ZAP', 'SQLi, XSS, rate limit', 'Alta'],
    ]
  ),
  H(2, '7.2 Escenarios Pipeline'),
  TABLE(
    ['ID', 'Escenario', 'Entrada', 'Esperado'],
    [
      ['P-01', 'URL BBVA legítima', 'bbva.mx', 'Seguro <25'],
      ['P-02', 'Suplantación SAT', 'sats-gob-mx.com', 'Fraude >65'],
      ['P-03', 'Acortador malicioso', 'bit.ly/falso', 'Fraude'],
      ['P-04', 'URL sin HTTPS', 'http://sitio.com', 'Sospechoso'],
      ['P-05', 'Dominio <7 días', '—', 'Sospechoso/Fraude'],
      ['P-06', 'Marca Levenshtein', 'bbva-seguridad.mx', 'Sospechoso'],
    ]
  ),
  H(2, '7.3 Escenarios API'),
  TABLE(
    ['ID', 'Escenario', 'Esperado'],
    [
      ['I-01', 'POST válido', '200 + veredicto'],
      ['I-02', 'Body inválido', '400'],
      ['I-03', 'Rate limit excedido', '429'],
      ['I-04', 'SQL injection', '400'],
      ['I-05', 'Body 200KB', '413'],
      ['I-06', 'Método incorrecto', '405'],
    ]
  ),
  H(2, '7.4 Cobertura'),
  TABLE(
    ['Capa', 'Cobertura'],
    [
      ['Scoring', '100%'],
      ['Validaciones Zod', '100%'],
      ['API routes', '95%'],
      ['Componentes UI', '80%'],
      ['Flujo crítico URL', '100%'],
      ['Supabase + Webhooks', '90%'],
    ]
  ),
  D(),

  // 8. ROADMAP
  H(1, '8. Roadmap'),
  TABLE(
    ['Fase', 'Hito', 'Duración', 'Estado'],
    [
      ['MVP', 'Bot WhatsApp + Dashboard', '2 semanas', 'Completado'],
      ['V1', 'Stripe + Planes suscripción', '2 semanas', 'Pendiente'],
      ['V2', 'Alertas a familiares', '4 semanas', 'Pendiente'],
      ['V3', 'Análisis imágenes OCR', '6 semanas', 'Planeado'],
      ['V4', 'Crowdsourcing MX', 'Q4 2026', 'Planeado'],
    ]
  ),
  D(),

  // CIERRE
  P('Documento generado para proyecto Guardián. Julio 2026. UPVT ITI TSU.'),
];

// Upload in chunks of 40
for (var i = 0; i < blocks.length; i += 40) {
  var chunk = blocks.slice(i, i + 40);
  await notion('PATCH', '/blocks/' + PAGE_ID + '/children', { children: chunk });
  console.log('Subidos ' + Math.min(i + 40, blocks.length) + '/' + blocks.length);
}

// Update page title + icon
await notion('PATCH', '/pages/' + PAGE_ID, {
  icon: { type: 'emoji', emoji: '🛡️' },
  properties: { title: { title: [{ text: { content: 'Guardián — Sistema Anti-Fraude Digital' } }] } },
});

console.log('Documento completo subido a Notion');
