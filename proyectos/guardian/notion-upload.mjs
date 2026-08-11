const TOKEN = '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';
const API = 'https://api.notion.com/v1';

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

const H = (level, text) => ({ [`heading_${level}`]: { rich_text: [{ text: { content: text } }] } });
const P = (text) => ({ paragraph: { rich_text: [{ text: { content: text } }] } });
const D = () => ({ divider: {} });
const B = (text) => ({ bulleted_list_item: { rich_text: [{ text: { content: text } }] } });

async function main() {
  // Find or create page
  const search = await notion('POST', '/search', {
    query: 'Guardián Sistema Anti-Fraude',
    filter: { value: 'page', property: 'object' },
  });
  let PAGE_ID;
  if (search.results && search.results.length > 0) {
    PAGE_ID = search.results[0].id;
    console.log('Usando página existente:', search.results[0].url);
  } else {
    const page = await notion('POST', '/pages', {
      parent: { type: 'workspace', workspace: true },
      icon: { type: 'emoji', emoji: '🛡️' },
      properties: {
        title: { title: [{ text: { content: 'Guardián — Sistema Anti-Fraude Digital' } }] },
      },
    });
    PAGE_ID = page.id;
    console.log('Página creada:', page.url);
  }

  const blocks = [
    H(2, 'Documento de proyecto — Diseño de Software'),
    P('Julio 2026 | Calidad de Software'),
    D(),

    H(1, '1. Investigación de Mercado'),
    H(2, 'El Problema'),
    P('Estafas digitales en México crecieron 38% anual. Adultos mayores: 23% de víctimas, 42% del valor perdido. Promedio: 28,000 MXN por víctima. 94% de adultos mayores usan WhatsApp como única aplicación digital. No tienen forma de verificar links sospechosos.'),
    H(2, 'Datos Clave'),
    B('Crecimiento fraudes MX 2024-2025: +38% — Condusef'),
    B('Adultos mayores víctimas: 23% del total — INEGI'),
    B('Pérdida anual adultos mayores: 1,470 M MXN — Condusef'),
    B('WhatsApp como única app: 94% — IFT México'),
    B('Phishing 34% de incidentes — Kaspersky MX'),
    B('Falso SAT vía WhatsApp: +160% en 2025 — SAT MX'),
    B('Tasa de denuncia en adultos mayores: 12%'),
    H(2, 'Tipos de Fraude'),
    B('Phishing (links falsos): 34% — suplantan bancos, SAT, gobierno'),
    B('Smishing (SMS): 22% — mensajes de texto con urgencia falsa'),
    B('Vishing (llamadas): 18% — llamadas suplantando instituciones'),
    B('Suplantación en redes: 12% — perfiles falsos'),
    B('Otros: 14% — fraudes en compras, inversiones falsas'),
    H(2, 'Oportunidad'),
    P('Competidores directos en México: 0. Herramientas que analicen links de WhatsApp: 0. Productos con alertas a familiares: 0. 18 millones de adultos mayores. 3,500 M MXN pérdida anual. Mercado virgen.'),
    D(),

    H(1, '2. Análisis de Competencia'),
    H(2, 'Competidores'),
    B('Trend Micro Check — App — 30 USD/año — Global — Anti-scam general'),
    B('Guardio — Extensión Chrome — 9.99 USD/mes — Global — Seguridad navegación'),
    B('VirusTotal — Web + API — Gratis — Global — Análisis multi-engine'),
    B('PhishTank — Base datos colaborativa — Gratis — Global — URLs phishing'),
    B('Any.Run — Sandbox web — Gratis/99 USD — Global — Análisis malware'),
    B('Herramientas oficiales MX — Ninguna interactiva — Solo informativas'),
    H(2, 'Diferenciador Guardián'),
    P('Primer servicio anti-phishing diseñado para México. Contexto local (SAT, BBVA, Banamex, CFE). WhatsApp nativo. Sin instalación. Gratuito. Dashboard en tiempo real. Alertas a familiares.'),
    D(),

    H(1, '3. Diagrama de Casos de Uso'),
    H(2, 'Actores'),
    P('Usuario (Adulto Mayor) — recibe links, envía al bot, recibe veredicto'),
    P('Administrador — monitorea dashboard, revisa amenazas, configura'),
    H(2, 'Casos de Uso'),
    B('CU-01: Analizar link vía web — Usuario pega URL en landing [Alta]'),
    B('CU-02: Analizar link vía WhatsApp — Usuario envía URL al bot [Alta]'),
    B('CU-03: Ver dashboard en vivo — Admin monitorea KPIs y feed [Media]'),
    B('CU-04: Ver feed de análisis — Admin ve timeline de resultados [Media]'),
    B('CU-05: Ver detalle de amenaza — Score, señales, análisis LLM [Baja]'),
    B('CU-06: Filtrar análisis — Por veredicto, canal, marca [Baja]'),
    B('CU-07: Ver estadísticas — Totales, fraudes, marcas suplantadas [Media]'),
    B('CU-08: Recibir alerta de fraude — Notificación proactiva [Alta]'),
    H(2, 'Pipeline 6 Capas'),
    B('Capa 1: Resolver URL — redirecciones, cadena completa'),
    B('Capa 2: WHOIS — edad dominio, registrador'),
    B('Capa 3: PhishTank — URL reportada como phishing'),
    B('Capa 4: Brand Check MX — Levenshtein vs marcas mexicanas'),
    B('Capa 5: LLM DeepSeek/Groq — análisis semántico del contenido'),
    B('Capa 6: Fusión 30% técnico + 70% LLM → veredicto final'),
    H(2, 'Veredictos'),
    B('Seguro (score 0-24): sin señales de fraude'),
    B('Sospechoso (score 25-64): señales presentes, precaución'),
    B('Fraude (score 65-100): fraude confirmado'),
    D(),

    H(1, '4. Protopersonas'),
    H(2, 'María García — 72 años — Usuaria principal'),
    P('Jubilada, CDMX. Solo WhatsApp. Ingreso 6,000 MXN. Miedo a problemas con SAT. Recibe links falsos diario. No sabe identificar URLs. Vergüenza de preguntar.'),
    P('"Mi hijo me dice no le hagas caso, pero el mensaje tiene el logo del SAT y mi nombre"'),
    H(2, 'Roberto Hernández — 68 años — Usuario secundario'),
    P('Contador jubilado, Guadalajara. Smartphone + laptop. Usa apps bancarias. Ha recibido phish. Quiere herramienta rápida de verificación.'),
    P('"Cuando el mensaje tiene el logo del banco y mi nombre exacto, dudo"'),
    H(2, 'Ana García — 45 años — Familiar cuidador'),
    P('Hija de María. Contadora. Trabaja tiempo completo. Le explica a su mamá pero no puede 24/7. Necesita alertas y tranquilidad.'),
    P('"Mi mamá me manda capturas, pero yo no puedo contestar rápido"'),
    D(),

    H(1, '5. Estrategia de Investigación'),
    H(2, 'Métodos'),
    B('Encuesta cuantitativa: 200+ adultos mayores + familiares — 2 semanas'),
    B('Entrevistas cualitativas: 10-15 adultos mayores — 1 semana'),
    B('Prueba de usabilidad: 5-8 adultos mayores — 3 sesiones'),
    B('Prueba A/B: 20+ usuarios — 1 semana'),
    B('Análisis de logs: datos de producción — continuo'),
    H(2, 'Métricas Clave'),
    B('Tasa completitud análisis > 90%'),
    B('Tiempo entender veredicto < 10 segundos'),
    B('Tasa reenvío a familiares > 30%'),
    B('Satisfacción CSAT > 4.0/5.0'),
    B('Precisión detector > 95%'),
    H(2, 'Cronograma'),
    B('Semana 1-2: Encuesta cuantitativa'),
    B('Semana 3: Entrevistas cualitativas'),
    B('Semana 4: Iteración prototipo'),
    B('Semana 5: Prueba usabilidad'),
    B('Semana 6: Ajustes finales'),
    D(),

    H(1, '6. Wireframes'),
    P('Archivos HTML en /home/leo/guardian/wireframes/:'),
    B('landing.html — Input + resultado análisis + 3 pasos'),
    B('dashboard.html — KPIs, charts, feed, tabla amenazas, marcas'),
    B('protopersonas.html — 4 perfiles visuales + tabla funcionalidades'),
    B('plan-pruebas.html — Tests, cobertura, flujo pipeline completo'),
    P('Abrir en navegador. Diseño slate/stone, WCAG AA+.'),
    D(),

    H(1, '7. Diseño Visual'),
    H(2, 'Paleta Base'),
    P('surface: #FAFAF9 | surface-elevated: #F5F5F4 | border: #E7E5E4 | text-muted: #A8A29E | text-primary: #292524 | accent: #6366F1 | success: #16A34A | warning: #D97706 | danger: #DC2626'),
    P('Modo oscuro: surface: #1C1917 | elevated: #292524 | border: #44403C | text-primary: #FAFAF9'),
    H(2, 'Tipografía'),
    P('Body: Inter 400 16px | Headings: Inter 600 24-48px | Code: JetBrains Mono 400 14px'),
    H(2, 'Componentes'),
    P('Cards: border 1px #E7E5E4, radius 12px, shadow suave 0 1px 3px'),
    P('Botones: radius 8px, primario indigo #6366F1, secundario ghost'),
    P('Badges: pills con colores semánticos pastel para veredictos'),
    P('Tablas: header 11px uppercase, sin bordes verticales, hover sutil'),
    D(),

    H(1, '8. Plan de Pruebas'),
    H(2, 'Tipos de Prueba'),
    B('Unitarias (Vitest): scoring, validaciones Zod — cobertura 100%'),
    B('Integración (Supertest): API /analyze, webhooks — cobertura 95%'),
    B('Usabilidad: sesiones presenciales con 20 participantes'),
    B('Accesibilidad: axe-core, Lighthouse — WCAG 2.2 AA'),
    B('Carga (k6): 100 req/min sostenidos'),
    B('Seguridad (OWASP ZAP): SQL injection, XSS, rate limiting, SSRF'),
    H(2, 'Escenarios Pipeline'),
    B('P-01: URL legítima BBVA bbva.mx → Seguro, score < 25'),
    B('P-02: URL suplantando SAT sats-gob-mx.com → Fraude, score > 65'),
    B('P-03: URL acortada maliciosa bit.ly/falso → Fraude post resolución'),
    B('P-04: URL con 5+ redirecciones → Detecta cadena completa'),
    B('P-05: Dominio < 7 días creado → Sospechoso o Fraude'),
    B('P-06: bbva-seguridad.mx (Levenshtein) → Sospechoso'),
    B('P-07: banamex.com legítimo → Seguro'),
    B('P-08: http:// sin SSL → Sospechoso o Fraude'),
    H(2, 'Escenarios Integración'),
    B('I-01: POST /api/analyze URL válida → 200 + veredicto'),
    B('I-02: POST /api/analyze body inválido → 400'),
    B('I-03: POST /api/analyze rate limit excedido → 429'),
    B('I-04: POST /api/analyze SQL injection → 400'),
    B('I-05: POST /api/analyze body 200KB → 413'),
    B('I-06: GET a /api/analyze → 405'),
    B('I-07: Content-Type text/plain → 415'),
    B('I-08: GET /api/stats → 200 + totalAnalyses'),
    H(2, 'Flujo Completo API'),
    P('POST /api/analyze → checkMethod(405) → checkContentType(415) → rateLimit(429) → readBody(413) → JSON.parse → sanitizeBody → Zod validate(400) → detectInjection(400) → checkRateLimit(429) → analyzeUrl → isPrivateHost → checkCache(24h) → resolveUrl(10 redirects) → fetch page(5s timeout, 500KB max) → scoreSignals(WHOIS, PhishTank, Brand MX, SSL, contenido) → callLLM(DeepSeek → Groq fallback) → fusionScore(30% tech + 70% LLM) → db.insert → upsert cache → increment count → 200 {verdict, score, response}'),
    D(),

    H(3, 'Generado para proyecto Guardián — Julio 2026'),
    P('Calidad de Software — UPVT'),
  ];

  // Upload in chunks of 50
  for (let i = 0; i < blocks.length; i += 50) {
    const chunk = blocks.slice(i, i + 50);
    await notion('PATCH', `/blocks/${PAGE_ID}/children`, { children: chunk });
    console.log(`Subidos bloques ${i + 1}-${Math.min(i + 50, blocks.length)}`);
  }

  console.log('Documento completo en Notion');
}

main().catch(console.error);
