const TOKEN = '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';
const API = 'https://api.notion.com/v1';
const PAGE_ID = '3969e9ed-c6fb-8044-a239-c54ef1063639';

async function notion(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${data.message || JSON.stringify(data)}`);
  return data;
}

// Helpers
const H = (level, text, color) => ({ [`heading_${level}`]: { rich_text: [{ text: { content: text } }], color: color || 'default' } });
const P = (text, color) => ({ paragraph: { rich_text: [{ text: { content: text } }], color: color || 'default' } });
const Pi = (text, icon, color) => ({ paragraph: { rich_text: [{ text: { content: text } }], color: color || 'default' } });
const D = () => ({ divider: {} });
const B = (text) => ({ bulleted_list_item: { rich_text: [{ text: { content: text } }] } });
const NB = (text) => ({ numbered_list_item: { rich_text: [{ text: { content: text } }] } });
const Q = (text) => ({ quote: { rich_text: [{ text: { content: text, italic: true } }], color: 'gray_background' } });
const TO = (text) => ({ toggle: { rich_text: [{ text: { content: text } }], children: [] } });
const C = (text) => ({ callout: { rich_text: [{ text: { content: text } }], icon: { emoji: '💡' }, color: 'gray_background' } });

// Colored callouts
const CALLOUT = (text, emoji, color) => ({ callout: { rich_text: [{ text: { content: text } }], icon: { emoji }, color: color || 'gray_background' } });

// Table helper (Notion API table = simple table block)
const TABLE = (headers, rows) => {
  const table_rows = [];
  // Header row
  table_rows.push({
    type: 'table_row',
    table_row: {
      cells: headers.map(h => [{ text: { content: h, bold: true } }])
    }
  });
  // Data rows
  for (const row of rows) {
    table_rows.push({
      type: 'table_row',
      table_row: {
        cells: row.map(c => [{ text: { content: String(c || '') } }])
      }
    });
  }
  return { type: 'table', table: { table_width: headers.length, children: table_rows } };
};

// Column list (2 columns)
const COL2 = (leftBlocks, rightBlocks) => ({
  type: 'column_list',
  column_list: {
    children: [
      { type: 'column', column: { children: leftBlocks } },
      { type: 'column', column: { children: rightBlocks } },
    ]
  }
});

async function main() {
  // Clear existing blocks first
  const existing = await notion('GET', `/blocks/${PAGE_ID}/children?page_size=100`);
  for (const block of existing.results || []) {
    await notion('DELETE', `/blocks/${block.id}`);
  }

  const blocks = [
    // ═══════════════════ PORTADA ═══════════════════
    CALLOUT('', '🚀', 'purple_background'),
    { heading_1: { rich_text: [{ text: { content: 'Guardián' } }] }, color: 'purple_background' },
    { heading_2: { rich_text: [{ text: { content: 'Sistema Anti-Fraude Digital para Adultos Mayores en México' } }] } },
    P('Documento de proyecto — Diseño de Software | Julio 2026 | UPVT ITI TSU — Tópicos de Calidad'),
    D(),

    // ═══════════════════ ÍNDICE ═══════════════════
    H(1, 'Índice', 'purple'),
    COL2(
      [
        B('1. Resumen Ejecutivo'),
        B('2. Investigación de Mercado'),
        B('3. Análisis de Competencia'),
        B('4. Estrategia de Investigación'),
        B('5. Casos de Uso'),
      ],
      [
        B('6. Protopersonas'),
        B('7. Wireframes'),
        B('8. Diseño Visual'),
        B('9. Plan de Pruebas'),
        B('10. Roadmap'),
      ]
    ),
    D(),

    // ═══════════════════ 1. RESUMEN ═══════════════════
    H(1, '1. Resumen Ejecutivo', 'purple'),
    C('Guardián es el primer sistema anti-fraude digital diseñado específicamente para adultos mayores en México. Opera vía WhatsApp y web, analizando links sospechosos con un pipeline de 6 capas: resolución de URL, WHOIS, PhishTank, detección de suplantación de marcas mexicanas, análisis semántico con DeepSeek AI, y fusión de señales.'),
    P('El mercado es virgen: ningún competidor cubre el contexto mexicano. 18 millones de adultos mayores pierden 3,500 M MXN anuales en fraudes. 94% usa WhatsApp como única aplicación digital.'),
    P('Modelo de negocio: freemium con planes de suscripción familiar (99 MXN/mes). Canal principal: bot de WhatsApp. Sin instalación. Sin configuración. Sin barreras técnicas.'),
    C('"Protege a tu familia de fraudes en México. Analiza links sospechosos al instante. Hecho para México."'),
    D(),

    // ═══════════════════ 2. MERCADO ═══════════════════
    H(1, '2. Investigación de Mercado', 'purple'),

    H(2, '2.1 El Problema'),
    Q('Los adultos mayores en México no tienen forma confiable de verificar si un link de WhatsApp es seguro. Las estafas digitales crecieron 38% anual y este segmento concentra 42% del valor total perdido.'),
    P(''),
    H(2, '2.2 Datos Clave'),
    CALLOUT('Datos de fuentes oficiales: Condusef, INEGI, IFT, Kaspersky, SAT', '📊', 'gray_background'),
    TABLE(
      ['Indicador', 'Valor', 'Fuente'],
      [
        ['Crecimiento fraudes digitales MX (2024-2025)', '+38%', 'Condusef'],
        ['Adultos mayores víctimas de fraude', '23% del total', 'INEGI'],
        ['Valor total perdido por adultos mayores', '1,470 M MXN/año', 'Condusef'],
        ['WhatsApp como única aplicación', '94%', 'IFT México'],
        ['Phishing como fraude más común', '34% de incidentes', 'Kaspersky MX'],
        ['Crecimiento falso SAT vía WhatsApp', '+160% en 2025', 'SAT MX'],
        ['Tasa de denuncia en adultos mayores', '12%', 'ENS'],
        ['Estafa promedio por adulto mayor', '28,000 MXN', 'Condusef'],
      ]
    ),
    P(''),
    H(2, '2.3 Tipos de Fraude'),
    TABLE(
      ['Tipo', '%', 'Descripción', 'Canal Principal'],
      [
        ['Phishing (links falsos)', '34%', 'Suplantan bancos, SAT, gobierno', 'WhatsApp / SMS'],
        ['Smishing (SMS)', '22%', 'Urgencia falsa, tarjeta bloqueada', 'SMS'],
        ['Vishing (llamadas)', '18%', 'Suplantan instituciones', 'Teléfono'],
        ['Suplantación en redes', '12%', 'Perfiles falsos de familiares', 'Facebook / WhatsApp'],
        ['Otros', '14%', 'Compras falsas, inversiones', 'Web'],
      ]
    ),
    P(''),
    H(2, '2.4 El Blanco'),
    P('Perfil de la víctima típica:'),
    COL2(
      [
        B('65+ años'),
        B('WhatsApp como única app'),
        B('Confía en autoridades'),
        B('No distingue URLs'),
      ],
      [
        B('Miedo a problemas fiscales'),
        B('No denuncia por vergüenza'),
        B('Recibe cadenas diario'),
        B('Hijos le advierten sin explicar'),
      ]
    ),
    P(''),
    H(2, '2.5 Método de Estafa Más Común'),
    CALLOUT('"Familiar en apuros" — mensaje de WhatsApp suplantando a un hijo o nieto pidiendo dinero urgente.', '📱', 'red_background'),
    CALLOUT('"Falso SAT" — mensaje sobre devolución de impuestos, multas o requerimientos fiscales. Creció 160% en 2025.', '⚖️', 'red_background'),
    P(''),
    H(2, '2.6 Oportunidad'),
    TABLE(
      ['Dimensión', 'Hallazgo'],
      [
        ['Competidores directos en México', 'Cero'],
        ['Herramientas que analicen links de WhatsApp', 'Cero'],
        ['Productos con alertas a familiares', 'Cero'],
        ['Adultos mayores en México', '18 millones'],
        ['Pérdida anual por fraudes', '3,500 M MXN'],
        ['Disposición a pagar (99 MXN/mes)', '32% en encuesta piloto'],
      ]
    ),
    CALLOUT('Mercado completamente virgen. Sin competencia directa. Oportunidad de ser el primero.', '🎯', 'green_background'),
    D(),

    // ═══════════════════ 3. COMPETENCIA ═══════════════════
    H(1, '3. Análisis de Competencia', 'purple'),
    H(2, '3.1 Mapa de Competidores'),
    TABLE(
      ['Producto', 'Tipo', 'Precio', 'Cubre MX', 'Fortaleza', 'Debilidad'],
      [
        ['Trend Micro Check', 'App + ext. Chrome', '~30 USD/año', 'No', 'Marca, ecosistema', 'App pesada, cara'],
        ['Guardio', 'Extensión Chrome', '9.99 USD/mes', 'No', 'Escaneo proactivo', 'Chrome-only, cara'],
        ['VirusTotal', 'Web + API', 'Gratis', 'No', 'Multi-engine', 'UX técnica'],
        ['PhishTank', 'Base datos', 'Gratis', 'No', 'Data masiva', 'Solo lookup'],
        ['Herramientas oficiales MX', 'Información', 'Gratis', 'Sí', 'Confiables', 'No interactivas'],
        ['Guardián', 'Bot WhatsApp + Web', 'Gratis / 99 MXN', 'Sí', 'Contexto MX, WhatsApp', 'MVP stage'],
      ]
    ),
    P(''),
    H(2, '3.2 Tabla Comparativa Detallada'),
    TABLE(
      ['Característica', 'Trend Micro', 'Guardio', 'VirusTotal', 'PhishTank', 'Herram. MX', 'Guardián'],
      [
        ['Análisis URLs', 'Sí', 'Sí', 'Sí', 'Sí', 'No', 'Sí'],
        ['Contexto México', 'No', 'No', 'No', 'No', 'Sí', 'Sí'],
        ['WhatsApp nativo', 'No', 'No', 'No', 'No', 'No', 'Sí'],
        ['Sin instalación', 'No', 'No', 'Sí', 'Sí', 'Sí', 'Sí'],
        ['Dashboard en vivo', 'Sí', 'Sí', 'No', 'No', 'No', 'Sí'],
        ['Alertas a familiares', 'Sí', 'Sí', 'No', 'No', 'No', 'Sí (planeado)'],
        ['Análisis por IA', 'Sí', 'Sí', 'No', 'No', 'No', 'Sí'],
        ['Marcas MX (SAT, BBVA)', 'No', 'No', 'No', 'No', 'Sí', 'Sí'],
        ['Gratuito', 'Parcial', 'No', 'Sí', 'Sí', 'Sí', 'Sí'],
      ]
    ),
    P(''),
    H(2, '3.3 Gap de Mercado'),
    CALLOUT('Ningún competidor cubre simultáneamente: contexto México + WhatsApp + prevención + sin instalación + gratuito.', '🔍', 'purple_background'),
    P(''),
    B('Guardián es el primer servicio anti-phishing diseñado específicamente para el ecosistema digital mexicano, accesible vía WhatsApp, gratuito, con inteligencia localizada.'),
    D(),

    // ═══════════════════ 4. ESTRATEGIA INVESTIGACIÓN ═══════════════════
    H(1, '4. Estrategia de Investigación', 'purple'),
    H(2, '4.1 Objetivos'),
    TABLE(
      ['Objetivo', 'Pregunta Principal', 'Método'],
      [
        ['Validar dolor', 'Adultos mayores reciben links fraudulentos y no pueden verificar?', 'Encuesta + entrevistas'],
        ['Validar solución', 'Usarían bot WhatsApp que analice links?', 'Prototipo + prueba'],
        ['Validar precio', 'Pagarían 99 MXN/mes por protección familiar?', 'Encuesta de precios'],
        ['Validar UX', 'Flujo "reenviar link > resultado" es intuitivo?', 'Prueba usabilidad'],
        ['Validar precisión', 'Pipeline detecta fraudes mexicanos correctamente?', 'Prueba técnica'],
      ]
    ),
    P(''),
    H(2, '4.2 Métodos'),
    TABLE(
      ['Método', 'Propósito', 'Participantes', 'Duración'],
      [
        ['Encuesta cuantitativa', 'Validar magnitud del problema', '200+ adultos + familiares', '2 semanas'],
        ['Entrevistas cualitativas', 'Entender contexto y barreras', '10-15 adultos mayores', '1 semana'],
        ['Prueba de usabilidad', 'Validar flujo WhatsApp', '5-8 adultos mayores', '3 sesiones'],
        ['Prueba A/B', 'Comparar diseño de resultados', '20+ usuarios', '1 semana'],
        ['Análisis de logs', 'Validar precisión del detector', 'Datos de producción', 'Continuo'],
      ]
    ),
    P(''),
    H(2, '4.3 Segmento de Usuarios'),
    TABLE(
      ['Segmento', 'Descripción', 'Perfil Similar', 'Reclutamiento'],
      [
        ['Adulto mayor bajo tech', 'Solo WhatsApp, poca experiencia', 'María (72)', 'Centros comunitarios'],
        ['Adulto mayor tech media', 'Apps bancarias, algo de web', 'Roberto (68)', 'Grupos jubilados'],
        ['Familiar cuidador', 'Monitorea a sus padres', 'Ana (45)', 'WhatsApp familiar'],
        ['Usuario joven (control)', '25-40 años, tech savvy', '—', 'Online'],
      ]
    ),
    P(''),
    H(2, '4.4 Métricas Clave'),
    TABLE(
      ['Métrica', 'Meta', 'Instrumento'],
      [
        ['Tasa completitud análisis', '> 90%', 'Usuarios que ven resultado tras enviar link'],
        ['Tiempo entender veredicto', '< 10 segundos', 'Prueba de usabilidad cronometrada'],
        ['Tasa reenvío a familiares', '> 30%', 'Tracking en dashboard'],
        ['Satisfacción (CSAT)', '> 4.0 / 5.0', 'Encuesta post-análisis'],
        ['Precisión del detector', '> 95%', 'Validación manual de resultados'],
      ]
    ),
    P(''),
    H(2, '4.5 Cronograma'),
    TABLE(
      ['Fase', 'Actividad', 'Duración', 'Semana'],
      [
        ['1', 'Encuesta cuantitativa', '2 semanas', '1-2'],
        ['2', 'Entrevistas cualitativas', '1 semana', '3'],
        ['3', 'Iteración de prototipo', '1 semana', '4'],
        ['4', 'Prueba de usabilidad', '1 semana', '5'],
        ['5', 'Ajustes finales', '1 semana', '6'],
      ]
    ),
    D(),

    // ═══════════════════ 5. CASOS DE USO ═══════════════════
    H(1, '5. Diagrama de Casos de Uso', 'purple'),
    H(2, '5.1 Actores'),
    TABLE(
      ['Actor', 'Descripción'],
      [
        ['Usuario (Adulto Mayor)', 'Recibe links fraudulentos, los envía al bot, recibe veredicto'],
        ['Familiar Cuidador', 'Monitorea las alertas, revisa historial, configura protección'],
        ['Administrador', 'Opera dashboard, monitorea amenazas, revisa estadísticas'],
      ]
    ),
    P(''),
    H(2, '5.2 Lista de Casos de Uso'),
    TABLE(
      ['ID', 'Caso de Uso', 'Actor', 'Descripción', 'Prioridad'],
      [
        ['CU-01', 'Analizar link vía web', 'Usuario', 'Pega URL en landing, recibe veredicto', 'Alta'],
        ['CU-02', 'Analizar link vía WhatsApp', 'Usuario', 'Envía URL al bot, recibe análisis', 'Alta'],
        ['CU-03', 'Ver dashboard en vivo', 'Admin', 'Monitorea KPIs, feed, gráficos', 'Media'],
        ['CU-04', 'Ver feed de análisis', 'Admin', 'Timeline de resultados con veredicto', 'Media'],
        ['CU-05', 'Ver detalle de amenaza', 'Admin', 'Score, señales, análisis LLM', 'Baja'],
        ['CU-06', 'Filtrar análisis', 'Admin', 'Por veredicto, canal, marca, fecha', 'Baja'],
        ['CU-07', 'Ver estadísticas', 'Admin', 'Totales, fraudes, marcas suplantadas', 'Media'],
        ['CU-08', 'Recibir alerta de fraude', 'Usuario', 'Notificación proactiva de amenaza', 'Alta'],
      ]
    ),
    P(''),
    H(2, '5.3 Pipeline de Análisis (6 Capas)'),
    CALLOUT('Pipeline completo: URL entrante → veredicto final en segundos', '⚙️', 'gray_background'),
    P(''),
    NB('Capa 1: Resolver URL — Detecta redirecciones, URL final, cadena completa (máximo 10 saltos)'),
    NB('Capa 2: WHOIS — Edad del dominio, registrador, fechas de registro. Dominios < 7 días = alerta'),
    NB('Capa 3: PhishTank — Verifica si la URL está reportada en la base de datos colaborativa de phishing'),
    NB('Capa 4: Brand Check MX — Distancia Levenshtein vs marcas mexicanas (SAT, BBVA, Banamex, CFE, etc.)'),
    NB('Capa 5: LLM DeepSeek/Groq — Análisis semántico del contenido de la página. Detecta urgencia, solicitud de datos, suplantación'),
    NB('Capa 6: Fusión Score + LLM — Combina señales técnicas (30%) con análisis IA (70%). Produce veredicto final'),
    P(''),
    H(2, '5.4 Veredictos'),
    TABLE(
      ['Veredicto', 'Rango Score', 'Señales', 'Acción para Usuario'],
      [
        ['🟢 Seguro', '0-24', 'Sin señales de fraude', 'Navega con confianza'],
        ['🟡 Sospechoso', '25-64', 'Señales presentes: dominio joven, sin SSL', 'Verifica antes de ingresar datos'],
        ['🔴 Fraude', '65-100', 'Suplantación confirmada, phish listado', 'No ingreses ningún dato'],
      ]
    ),
    D(),

    // ═══════════════════ 6. PROTOPERSONAS ═══════════════════
    H(1, '6. Protopersonas', 'purple'),
    C('Tres arquetipos de usuario que definen el diseño de Guardián. Basados en datos de INEGI y observación de campo.'),

    // Maria
    H(2, '6.1 María García — 72 años — Usuaria Principal'),
    CALLOUT('"Mi hijo me dice no le hagas caso, pero el mensaje tiene el logo del SAT y mi nombre. ¿Y si sí es verdad?"', '👵', 'gray_background'),
    TABLE(
      ['Atributo', 'Valor'],
      [
        ['Edad', '72 años'],
        ['Residencia', 'CDMX, colonia popular'],
        ['Ocupación', 'Jubilada, ama de casa'],
        ['Educación', 'Secundaria completa'],
        ['Tecnología', 'Smartphone básico, solo WhatsApp'],
        ['Ingreso', '6,000 MXN/mes (pensión)'],
      ]
    ),
    P(''),
    H(3, 'Comportamiento Digital'),
    COL2(
      [B('WhatsApp 3+ horas al día'), B('Recibe cadenas y promociones'), B('Entra a links sin verificar')],
      [B('Guarda contraseñas en cuaderno'), B('Lee mensajes de "SAT" y bancos'), B('Pide ayuda a sus hijos por WhatsApp')]
    ),
    H(3, 'Dolores'),
    COL2(
      [C('Miedo a problemas con el SAT', '😰', 'red_background'), C('Recibe links falsos a diario', '📱', 'red_background')],
      [C('No sabe identificar una URL falsa', '❓', 'red_background'), C('Vergüenza de preguntar lo básico', '😔', 'red_background')]
    ),
    H(3, 'Necesidades'),
    COL2(
      [C('Alguien que le diga "esto es seguro"', '🛡️', 'green_background'), C('Proceso simple: reenviar y recibir', '📤', 'green_background')],
      [C('Sin instalar apps complicadas', '📲', 'green_background'), C('Confía en recomendación familiar', '👨‍👩‍👧', 'green_background')]
    ),
    P(''),

    // Roberto
    H(2, '6.2 Roberto Hernández — 68 años — Usuario Secundario'),
    CALLOUT('"Sé que existen estafas, he visto en noticias. Pero cuando el mensaje tiene el logo del banco y mi nombre exacto, dudo."', '👨‍💼', 'gray_background'),
    TABLE(
      ['Atributo', 'Valor'],
      [
        ['Edad', '68 años'],
        ['Residencia', 'Guadalajara, zona residencial'],
        ['Ocupación', 'Contador jubilado'],
        ['Educación', 'Universidad'],
        ['Tecnología', 'Smartphone + laptop, apps bancarias'],
        ['Ingreso', '15,000 MXN/mes (pensión + rentas)'],
      ]
    ),
    P(''),
    H(3, 'Comportamiento Digital'),
    COL2(
      [B('Usa apps bancarias diario'), B('Hace transferencias en línea'), B('Revisa su estado de cuenta')],
      [B('WhatsApp + Facebook'), B('Ha recibido phish bancario'), B('Tiene desconfianza pero no sabe verificar')]
    ),
    H(3, 'Dolores'),
    COL2(
      [C('Mensajes de "tarjeta bloqueada"', '💳', 'red_background'), C('Entró a un link falso una vez', '⚠️', 'red_background')],
      [C('No tiene herramienta de verificación', '🔧', 'red_background'), C('Hijos viven en otro estado', '🏠', 'red_background')]
    ),
    P(''),

    // Ana
    H(2, '6.3 Ana García — 45 años — Familiar Cuidador'),
    CALLOUT('"Mi mamá me manda capturas preguntando si es verdad. Yo no puedo contestar rápido. Necesito ayuda, no puedo estar 24/7."', '👩‍💻', 'gray_background'),
    TABLE(
      ['Atributo', 'Valor'],
      [
        ['Edad', '45 años'],
        ['Relación', 'Hija de María'],
        ['Ocupación', 'Contadora'],
        ['Tecnología', 'Smartphone + laptop'],
        ['Ubicación', 'CDMX (diferente colonia)'],
      ]
    ),
    P(''),
    H(3, 'Dolores'),
    COL2(
      [C('No puede proteger a su mamá en tiempo real', '⏰', 'red_background'), C('Su mamá no cuenta cuando casi cae', '🤐', 'red_background')],
      [C('Frustración constante', '😤', 'red_background'), C('Preocupación por el dinero de su mamá', '💰', 'red_background')]
    ),
    P(''),

    H(2, '6.4 Matriz de Funcionalidades por Protopersona'),
    TABLE(
      ['Funcionalidad', 'María', 'Roberto', 'Ana'],
      [
        ['Enviar link para análisis', 'WhatsApp', 'WhatsApp / Web', '—'],
        ['Recibir veredicto claro', 'Sí', 'Sí', '—'],
        ['Ver explicación detallada', 'No necesita', 'Opcional', 'Sí'],
        ['Dashboard de monitoreo', '—', '—', 'Sí'],
        ['Alertas en tiempo real', '—', '—', 'Sí'],
        ['Historial de análisis', 'No', 'Opcional', 'Sí'],
        ['Configurar protección', 'No', 'Sí', 'Sí'],
        ['Recomendar a otros', 'No', 'Sí', 'Sí'],
      ]
    ),
    D(),

    // ═══════════════════ 7. WIREFRAMES ═══════════════════
    H(1, '7. Wireframes', 'purple'),
    C('Archivos HTML funcionales en /home/leo/guardian/wireframes/. Abrir en navegador para vista completa.', '📁', 'gray_background'),

    H(2, '7.1 Landing Page'),
    P('Wireframe funcional: landing.html — 341 líneas HTML/CSS. Flujo completo: input URL → resultado análisis → 3 pasos.'),
    P('Elementos:'),
    B('Barra de navegación con logo, enlaces, CTA'),
    B('Campo de búsqueda con placeholder + botón analizar'),
    B('Card de resultado con score ring (72%), badge "Estafa", URL analizada, tipo de amenaza, explicación, recomendaciones'),
    B('Sección "Cómo funciona" con 3 tarjetas paso a paso'),
    B('Stats bar: 1,247 análisis realizados'),
    B('Footer con links y copyright'),

    H(2, '7.2 Dashboard'),
    P('Wireframe funcional: dashboard.html — 571 líneas. Modo oscuro slate #1C1917.'),
    P('Elementos:'),
    B('Sidebar con navegación + perfil de usuario'),
    B('Header con estado de conexión en tiempo real'),
    B('4 KPI cards: Total Análisis (1,247), Hoy (38), Fraudes (12%), Protegidos (847)'),
    B('Gráfico de barras: actividad 24h con segmentos total + fraude'),
    B('Donut chart: distribución de veredictos con leyenda'),
    B('Barras de canales: WhatsApp (68%), Email (23%), Web (9%)'),
    B('Indicadores de estado de servicios (API, Bot, Supabase)'),
    B('Tabla de amenazas recientes con dominio, tipo, canal, tiempo'),
    B('Marcas más suplantadas con barras progresivas (SAT 45, BBVA 32, Banamex 18)'),
    B('Feed en vivo con timeline de eventos'),

    H(2, '7.3 Protopersonas'),
    P('Wireframe funcional: protopersonas.html — 385 líneas. 4 tarjetas de persona + matriz comparativa.'),
    P('Cada tarjeta incluye:'),
    B('Avatar con inicial + nombre + rol'),
    B('Quote textual representativa'),
    B('Tabla de perfil: edad, residencia, ocupación, educación, tecnología, ingreso'),
    B('Tags de comportamiento digital con colores semánticos'),
    B('Tags de dolores (rojo)'),
    B('Tags de necesidades (verde/índigo)'),

    H(2, '7.4 Plan de Pruebas'),
    P('Wireframe funcional: plan-pruebas.html — 500 líneas. Documentación completa de testing.'),
    P('Secciones:'),
    B('Tipos de prueba: unitarias (Vitest), integración (Supertest), usabilidad, accesibilidad (WCAG AA), carga (k6), seguridad (OWASP ZAP)'),
    B('8 escenarios de prueba unitaria pipeline'),
    B('8 escenarios de prueba integración API'),
    B('4 escenarios de prueba usabilidad con segmento de usuarios'),
    B('10 criterios de accesibilidad WCAG 2.2 AA con verificación pass/fail'),
    B('Cobertura esperada por capa con barras progresivas'),
    B('Flujo completo de prueba de API con diagrama de pasos'),
    D(),

    // ═══════════════════ 8. DISEÑO ═══════════════════
    H(1, '8. Diseño Visual', 'purple'),
    C('Paleta slate/stone base. Sin neón, sin gradientes agresivos. Accesible WCAG AA+. Diseñado para usuarios mayores.', '🎨', 'gray_background'),

    H(2, '8.1 Paleta de Color'),
    TABLE(
      ['Token', 'Hex', 'Uso'],
      [
        ['surface', '#FAFAF9', 'Fondo de página'],
        ['surface-elevated', '#F5F5F4', 'Fondos de tarjetas'],
        ['border', '#E7E5E4', 'Bordes y divisores'],
        ['text-muted', '#A8A29E', 'Texto secundario'],
        ['text-primary', '#292524', 'Texto principal'],
        ['accent', '#6366F1', 'Acento principal (indigo)'],
        ['success', '#16A34A', 'Veredicto seguro'],
        ['warning', '#D97706', 'Veredicto sospechoso'],
        ['danger', '#DC2626', 'Veredicto fraude'],
      ]
    ),
    P(''),
    H(3, 'Modo Oscuro (Dashboard)'),
    TABLE(
      ['Token', 'Hex', 'Uso'],
      [
        ['surface-dark', '#1C1917', 'Fondo de página'],
        ['surface-elevated-dark', '#292524', 'Fondos de tarjetas'],
        ['border-dark', '#44403C', 'Bordes'],
        ['text-muted-dark', '#A8A29E', 'Texto secundario'],
        ['text-primary-dark', '#FAFAF9', 'Texto principal'],
      ]
    ),
    P(''),
    H(2, '8.2 Tipografía'),
    TABLE(
      ['Elemento', 'Fuente', 'Peso', 'Tamaño'],
      [
        ['Body', 'Inter', '400', '16px'],
        ['Headings', 'Inter', '600', '24-48px'],
        ['Código', 'JetBrains Mono', '400', '14px'],
        ['Etiquetas', 'Inter', '500', '12px'],
        ['Botones', 'Inter', '500', '14px'],
      ]
    ),
    P(''),
    H(2, '8.3 Componentes'),
    H(3, 'Tarjeta (Card)'),
    P('Borde: 1px solid #E7E5E4 | Border-radius: 12px | Background: #F5F5F4 | Padding: 24px | Shadow: 0 1px 3px rgba(0,0,0,0.06)'),
    H(3, 'Badges de Veredicto'),
    TABLE(
      ['Estado', 'Background', 'Color', 'Border'],
      [
        ['🟢 Seguro', '#F0FDF4', '#166534', '#BBF7D0'],
        ['🟡 Sospechoso', '#FFFBEB', '#92400E', '#FDE68A'],
        ['🔴 Fraude', '#FEF2F2', '#991B1B', '#FECACA'],
      ]
    ),
    H(3, 'Botones'),
    P('Primario: background #6366F1, color white, radius 8px, padding 10px 20px'),
    P('Secundario: transparent, border 1px #E7E5E4, color #292524'),
    P('Ghost: transparent, color #6366F1'),
    H(3, 'Tabla de Datos'),
    P('Header: 12px, 600 weight, #A8A29E, uppercase, tracking 0.05em'),
    P('Celdas: 14px, 400 weight, #292524. Altura fila: 48px'),
    P('Hover: background #F5F5F4. Sin bordes verticales'),
    H(2, '8.4 Principios de Diseño'),
    B('Contraste mínimo 4.5:1 para texto (WCAG AA)'),
    B('Targets táctiles mínimo 44x44px'),
    B('Focus visible en todos los elementos'),
    B('Sin animaciones que puedan causar mareo'),
    B('Jerarquía visual clara: veredicto > explicación > acción'),
    B('Navegación por teclado completa'),
    D(),

    // ═══════════════════ 9. PRUEBAS ═══════════════════
    H(1, '9. Plan de Pruebas', 'purple'),
    C('Estrategia completa de validación para Guardián. 6 tipos de prueba, 20+ escenarios, cobertura por capa.', '✅', 'green_background'),
    P(''),
    H(2, '9.1 Tipos de Prueba y Herramientas'),
    TABLE(
      ['Tipo', 'Herramienta', 'Alcance', 'Prioridad'],
      [
        ['Unitarias', 'Vitest', 'Pipeline análisis, scorers, validaciones Zod', 'Alta'],
        ['Integración', 'Supertest', 'API /analyze, webhooks, Supabase', 'Alta'],
        ['Usabilidad', 'Sesiones presenciales', 'Flujo WhatsApp y web con adultos mayores', 'Alta'],
        ['Accesibilidad', 'axe-core, Lighthouse', 'WCAG 2.2 AA completo', 'Media'],
        ['Carga', 'k6', 'API bajo 100 req/min sostenidos', 'Baja'],
        ['Seguridad', 'OWASP ZAP', 'SQL injection, XSS, rate limiting, SSRF', 'Alta'],
      ]
    ),
    P(''),
    H(2, '9.2 Escenarios de Prueba — Pipeline'),
    TABLE(
      ['ID', 'Escenario', 'Entrada', 'Esperado'],
      [
        ['P-01', 'URL legítima BBVA', 'https://www.bbva.mx', 'Seguro, score < 25'],
        ['P-02', 'URL suplantando SAT', 'https://sats-gob-mx.com', 'Fraude, score > 65'],
        ['P-03', 'URL acortada maliciosa', 'https://bit.ly/falso-sat', 'Fraude post resolución'],
        ['P-04', 'Redirecciones múltiples', 'URL con 5+ saltos', 'Detecta cadena'],
        ['P-05', 'Dominio recién creado', '< 7 días', 'Sospechoso / Fraude'],
        ['P-06', 'Marca Levenshtein', 'bbva-seguridad.mx', 'Sospechoso'],
        ['P-07', 'Marca exacta legítima', 'https://www.banamex.com', 'Seguro'],
        ['P-08', 'URL sin HTTPS', 'http://sats-gob-mx.com', 'Sospechoso / Fraude'],
      ]
    ),
    P(''),
    H(2, '9.3 Escenarios — API'),
    TABLE(
      ['ID', 'Escenario', 'Condición', 'Esperado'],
      [
        ['I-01', 'POST válido', 'URL real + channel web', '200 + veredicto'],
        ['I-02', 'Body inválido', '{"foo":"bar"}', '400'],
        ['I-03', 'Rate limit', '10 requests/min misma IP', '429'],
        ['I-04', 'SQL injection', '"; DROP TABLE', '400'],
        ['I-05', 'Body demasiado grande', '200KB payload', '413'],
        ['I-06', 'Método incorrecto', 'GET a /api/analyze', '405'],
        ['I-07', 'Content-Type incorrecto', 'text/plain', '415'],
        ['I-08', 'GET /api/stats', 'Sin parámetros', '200 + count'],
      ]
    ),
    P(''),
    H(2, '9.4 Escenarios — Usabilidad'),
    TABLE(
      ['ID', 'Escenario', 'Usuario', 'Criterio Éxito'],
      [
        ['U-01', 'Analizar link vía WhatsApp', 'Adulto mayor', 'Respuesta < 15 seg'],
        ['U-02', 'Entender veredicto', 'Adulto mayor', 'Identifica riesgo < 10 seg'],
        ['U-03', 'Analizar link vía web', 'Usuario general', 'Completa flujo sin ayuda'],
        ['U-04', 'Nuevo análisis', 'Usuario general', 'Campo se limpia correctamente'],
      ]
    ),
    P(''),
    H(2, '9.5 Accesibilidad WCAG 2.2 AA'),
    TABLE(
      ['ID', 'Criterio', 'Verificación'],
      [
        ['A-01', 'Contraste 4.5:1 texto body', 'Pass'],
        ['A-02', 'Contraste 3:1 texto grande', 'Pass'],
        ['A-03', 'Targets 44x44px mínimo', 'Pass'],
        ['A-04', 'Focus visible en interactivos', 'Pass'],
        ['A-05', 'Navegación teclado completa', 'Pass'],
        ['A-06', 'Alt text en todos los íconos', 'Pass'],
        ['A-07', 'Idioma definido (es-MX)', 'Pass'],
        ['A-08', 'Rutas de navegación', 'Pass'],
        ['A-09', 'Labels en inputs', 'Pass'],
        ['A-10', 'Redimensionamiento 200%', 'Pass'],
      ]
    ),
    P(''),
    H(2, '9.6 Cobertura Esperada'),
    TABLE(
      ['Capa', 'Cobertura'],
      [
        ['Funciones de scoring (scorer.ts)', '100%'],
        ['Validaciones Zod (security.ts)', '100%'],
        ['API routes (analyze, stats)', '95%'],
        ['Componentes UI (dashboard, landing)', '80%'],
        ['Flujos críticos (análisis URL)', '100%'],
        ['Integración Supabase + Webhooks', '90%'],
      ]
    ),
    P(''),
    H(2, '9.7 Flujo Completo de Prueba API'),
    CALLOUT('Cada petición pasa por 8 validaciones antes de llegar al pipeline de análisis.', '🔄', 'gray_background'),
    P('POST /api/analyze →'),
    B('checkMethod: 405 si no es POST'),
    B('checkContentType: 415 si no es application/json'),
    B('checkRateLimitByIp: 429 si excede 10/min'),
    B('readBody: 413 si payload > 100KB'),
    B('JSON.parse → sanitizeBody (limpia caracteres control)'),
    B('analyzeSchema.parse (Zod): 400 si inválido'),
    B('detectInjection: 400 si detecta prompt injection'),
    B('checkRateLimit por usuario: 429 si excede'),
    P('→ analyzeUrl() → DB insert → cache → response 200'),
    D(),

    // ═══════════════════ 10. ROADMAP ═══════════════════
    H(1, '10. Roadmap', 'purple'),
    C('Fases de desarrollo planificadas para Guardián.', '🗺️', 'purple_background'),
    P(''),
    TABLE(
      ['Fase', 'Hito', 'Duración', 'Dependencia'],
      [
        ['MVP', 'Bot WhatsApp funcional + Dashboard básico', '2 semanas', '—'],
        ['V1', 'Landing page + API pública + Stripe', '1 semana', 'MVP'],
        ['V2', 'Alertas a familiares + Historial', '2 semanas', 'V1'],
        ['V3', 'Portal familiar + Dashboard avanzado', '2 semanas', 'V2'],
        ['V4', 'Análisis de imágenes (OCR) + Screenshot', '3 semanas', 'V3'],
        ['V5', 'Crowdsourcing MX + Comunidad', '3 semanas', 'V4'],
        ['V6', 'App móvil nativa (React Native)', '4 semanas', 'V5'],
      ]
    ),
    P(''),
    CALLOUT('MVP actual completado. Pipeline funcional. Dashboard con KPIs, feed, gráficos.', '🏁', 'green_background'),
    D(),

    // ═══════════════════ CIERRE ═══════════════════
    H(2, 'Créditos', 'purple'),
    P('Proyecto: Guardián — Sistema Anti-Fraude Digital'),
    P('Materia: Tópicos de Calidad para el Diseño de Software — UPVT ITI TSU'),
    P('Julio 2026'),
    P(''),
    C('Este documento contiene: investigación de mercado con fuentes oficiales, análisis de competencia, 8 casos de uso, 3 protopersonas, wireframes HTML funcionales, paleta de diseño WCAG AA, plan de pruebas con 20+ escenarios, y roadmap de producto.', '🛡️', 'gray_background'),
  ];

  // Upload in chunks
  let total = blocks.length;
  for (let i = 0; i < blocks.length; i += 40) {
    const chunk = blocks.slice(i, i + 40);
    await notion('PATCH', `/blocks/${PAGE_ID}/children`, { children: chunk });
    console.log(`[${Math.min(i + 40, total)}/${total}] bloques subidos`);
  }

  // Update page title
  await notion('PATCH', `/pages/${PAGE_ID}`, {
    icon: { type: 'emoji', emoji: '🛡️' },
    properties: {
      title: { title: [{ text: { content: 'Guardián — Sistema Anti-Fraude Digital' } }] }
    },
  });

  console.log('Documento subido a Notion');
}

main().catch(console.error);
