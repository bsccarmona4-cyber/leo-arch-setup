#!/usr/bin/env python3
"""
KREID — Generador de Documento del Proyecto
Crea un DOCX profesional con la descripción general del proyecto,
nichos identificados, canales de venta, stack técnico, y screenshots.
"""

from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

# ─── Config ────────────────────────────────────────────────
OUTPUT = os.path.expanduser("~/kreid/docs/KREID_Proyecto_General.docx")
IMGDIR = os.path.expanduser("~/kreid/docs/imagenes")

doc = Document()

# ─── ESTILOS ───────────────────────────────────────────────
style = doc.styles['Normal']
font = style.font
font.name = 'Calibri'
font.size = Pt(11)
font.color.rgb = RGBColor(0x1a, 0x1a, 0x1a)

# Heading styles
for i in range(1, 5):
    h = doc.styles[f'Heading {i}']
    h.font.name = 'Calibri'
    h.font.color.rgb = RGBColor(0x1a, 0x56, 0xdb)  # KREID blue

# ─── PORTADA ───────────────────────────────────────────────
doc.add_paragraph()
doc.add_paragraph()
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run('KREID')
run.font.size = Pt(48)
run.font.bold = True
run.font.color.rgb = RGBColor(0x1a, 0x56, 0xdb)  # blue

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run('Comercio Beauty & Health — México')
run.font.size = Pt(20)
run.font.color.rgb = RGBColor(0x6b, 0x72, 0x80)

doc.add_paragraph()
doc.add_paragraph()

meta = doc.add_paragraph()
meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
meta.add_run('Documento del Proyecto\n').font.size = Pt(12)
meta.add_run('Agosto 2026\n').font.size = Pt(10)
meta.add_run('Q3 2026 — Versión 1.0').font.size = Pt(10)

doc.add_page_break()

# ─── ÍNDICE ────────────────────────────────────────────────
doc.add_heading('Índice', level=1)
toc_items = [
    '1. Resumen Ejecutivo',
    '2. Modelo de Negocio',
    '3. Nichos Identificados (Auditoría de Mercado)',
    '4. Canales de Venta y Estrategia Multicanal',
    '5. Integración Shopify ↔ TikTok Shop',
    '6. Stack Tecnológico',
    '7. Tienda Web (Screenshots)',
    '8. Próximos Pasos',
    '9. Métricas y Validación',
]
for item in toc_items:
    p = doc.add_paragraph(item)
    p.paragraph_format.space_after = Pt(4)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════
# 1. RESUMEN EJECUTIVO
# ═══════════════════════════════════════════════════════════
doc.add_heading('1. Resumen Ejecutivo', level=1)
doc.add_paragraph(
    'KREID es un proyecto de comercio electrónico enfocado en el mercado mexicano '
    'de Beauty & Health (belleza y salud). El modelo es comercio formal con compra '
    'a importadores en CDMX — sin dropshipping, sin aduanas, sin esperas de 45 días. '
    'Los productos ya están en México y se compran a proveedores mayoristas establecidos '
    'en la zona de importación de la capital.'
)
doc.add_paragraph(
    'El producto héroe identificado es la máscara LED de terapia lumínica (LED Light '
    'Therapy Mask), con un mercado validado de solo 2 marcas en Amazon México, '
    '44-111 reviews y crecimiento de ~22 reviews/mes. El ticket promedio es de '
    '$2,000 MXN con un ratio de rentabilidad de 3.2× al importar directo.'
)

# KPIs
doc.add_heading('KPIs del proyecto', level=2)
kpi_data = [
    ('Producto héroe', 'LED Light Therapy Mask (Hello Face)'),
    ('Ticket promedio', '$2,000 MXN'),
    ('Ratio de rentabilidad', '3.2× (precio venta ÷ costo importador)'),
    ('Canales de venta', 'Shopify + TikTok Shop + Mercado Libre + FB Lives'),
    ('Inversión inicial estimada', '$15,000-$25,000 MXN (inventario + ads + store)'),
    ('Meta Ads presupuesto', '$15-20 USD/día para validación inicial'),
    ('Mercado objetivo', 'Mujeres 18-45 años, México, skincare tech'),
    ('Competidores directos (Amazon MX)', 'Solo 2 marcas (Hello Face y genérica)'),
]
table = doc.add_table(rows=1, cols=2, style='Light Grid Accent 1')
hdr = table.rows[0].cells
hdr[0].text = 'Métrica'
hdr[1].text = 'Valor'
for k, v in kpi_data:
    row = table.add_row().cells
    row[0].text = k
    row[1].text = v

doc.add_page_break()

# ═══════════════════════════════════════════════════════════
# 2. MODELO DE NEGOCIO
# ═══════════════════════════════════════════════════════════
doc.add_heading('2. Modelo de Negocio', level=1)

doc.add_heading('2.1 Tipo de comercio', level=2)
doc.add_paragraph(
    'Comercio formal — NO dropshipping. Los productos se compran a importadores '
    'mayoristas ubicados en la Ciudad de México que ya tienen la mercancía en el país. '
    'Esto elimina los problemas del dropshipping tradicional: tiempos de envío de '
    '30-45 días, aduanas, MOQ altos de fábrica, y problemas de calidad sin control.'
)

doc.add_heading('2.2 Fuentes de importadores CDMX', level=2)
fuentes = [
    'Grupos de Facebook: "Importadora y mayoreo de productos CHINOS CDMX"',
    'Plataformas: productoschinos.com.mx, sasbim.com, plazamayoreo.com',
    'Zonas físicas: Plaza Izazaga 89, Centro de Importadores, calle Leona Vicario',
]
for f in fuentes:
    doc.add_paragraph(f, style='List Bullet')

doc.add_heading('2.3 Fórmula de validación', level=2)
doc.add_paragraph(
    'Ratio = Precio de venta ÷ Precio del importador CDMX\n'
    '🟢 ≥ 3.0 → VIABLE | 🟡 2.0–2.9 → AJUSTADO | 🔴 < 2.0 → DESCARTAR'
)

doc.add_heading('2.4 Logística y costos', level=2)
logistica = [
    ('Envío nacional (1kg)', '$80-$180 MXN (Estafeta/Redpack/Paquetexpress)'),
    ('Comisión Mercado Libre (Belleza)', '~14.5%'),
    ('Comisión TikTok Shop', '~6%'),
    ('Comisión Shopify + Stripe', '~2.9% + $4 MXN por transacción'),
    ('Importación directa China (alternativa)', 'IGI 10-15% + DTA 0.8% + IVA 16% = ~27-32% sobre CIF'),
    ('Flete aéreo China→MX', '$3-8 USD/kg (~$2-4 USD para LED mask de 500g)'),
]
for k, v in logistica:
    p = doc.add_paragraph()
    p.add_run(f'{k}: ').bold = True
    p.add_run(v)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════
# 3. NICHOS IDENTIFICADOS
# ═══════════════════════════════════════════════════════════
doc.add_heading('3. Nichos Identificados — Auditoría de Mercado', level=1)
doc.add_paragraph(
    'Auditoría completa realizada el 25 de julio de 2026 usando curl + Puppeteer '
    'en Amazon México (ML MX bloqueado). ~60 productos verificados con reviews '
    'reales. Marcadores de confianza: [2] = 2+ fuentes independientes, [1] = 1 fuente.'
)

doc.add_heading('3.1 Beauty & Care 🥇 (Foco principal)', level=2)
beauty = [
    ('🟢 [2] LED/Light Therapy Masks', 'Hello Face 44-111 reviews (~22/mes, mar-jul 2026), solo 2 marcas. TICKET $1,500-$2,500 MXN. PRODUCTO HÉROE.'),
    ('🔴 Microcurrent devices', 'Skindion 1,967-1,355 reviews. SATURADO.'),
    ('🔴 Skincare consumibles', 'L\'Oréal 130-640 reviews, 5+ canales. SATURADO.'),
]
for k, v in beauty:
    p = doc.add_paragraph()
    p.add_run(f'{k}: ').bold = True
    p.add_run(v)

doc.add_heading('3.2 Sports & Outdoor → Recovery', level=2)
sports = [
    ('🟢 [1] Botas de compresión', '12+ productos (0-113 reviews). RECOVERY BOOST (11), Medisana (24), Compex (113). Ticket $1,376-$9,990.'),
    ('🟢 [2] Rodillos fascia', 'Mercado fragmentado, 0-170 reviews, sin marca dominante. Ticket bajo $125-$393.'),
    ('🔴 Pistola masaje', 'RENPHO 19.7K, BOB AND BRAD 13K. SATURADO.'),
]
for k, v in sports:
    p = doc.add_paragraph()
    p.add_run(f'{k}: ').bold = True
    p.add_run(v)

doc.add_heading('3.3 Home & Garden → Organización', level=2)
home = [
    ('🟢 [2] Organizadores nevera/acero', 'Genéricos 0-18 reviews. Marcas saturadas evitadas. Ticket $100-$1,250.'),
    ('🟢 [2] Especieros/estantes magnéticos', 'Maxgeen (27), GALASALA (6), HASTHIP (0). Ticket $229-$449.'),
]
for k, v in home:
    p = doc.add_paragraph()
    p.add_run(f'{k}: ').bold = True
    p.add_run(v)

doc.add_heading('3.4 Baby & Toys → STEM/Educativos', level=2)
baby = [
    ('🟢 [1] Kits de ciencia (marcas chinas)', '34-97 reviews. Ticket $298-$498. Solo Puppeteer confirmó.'),
    ('🟢 [2] Microscopios infantiles', 'AYNEFY (8), LICAEVEY (17). Ticket $249-$1,052.'),
    ('🟢 [2] Bloques magnéticos (gama media)', 'Nasjac (25), RaceGT (27), Raganet (49). Ticket $263-$719.'),
]
for k, v in baby:
    p = doc.add_paragraph()
    p.add_run(f'{k}: ').bold = True
    p.add_run(v)

doc.add_heading('3.5 Industrial & MRO → Medición', level=2)
industrial = [
    ('🟢 [2] Termómetro infrarrojo', 'IR genérico 79 reviews, 4.4★. Poca competencia directa.'),
]
for k, v in industrial:
    p = doc.add_paragraph()
    p.add_run(f'{k}: ').bold = True
    p.add_run(v)

doc.add_heading('3.6 Office → Ergonomía', level=2)
office = [
    ('🟢 [2] Reposamuñecas', 'Madera antideslizante 1-8 reviews. Mercado casi inexistente.'),
    ('🔴 Teclado ergonómico', 'AUSENTE en Amazon MX — búsquedas = Redragon gaming. La categoría no existe.'),
]
for k, v in office:
    p = doc.add_paragraph()
    p.add_run(f'{k}: ').bold = True
    p.add_run(v)

doc.add_heading('3.7 Resumen de la auditoría', level=2)
summary_data = [
    ('Confianza', '🟢 Viable', '🟡 Ajustado', '🔴 Descartado'),
    ('[2] 2+ fuentes', '8', '0', '4'),
    ('[1] 1 fuente', '4', '4', '5'),
    ('Total subcategorías', '12', '4', '9'),
]
table2 = doc.add_table(rows=4, cols=4, style='Light Grid Accent 1')
for i, row_data in enumerate(summary_data):
    for j, val in enumerate(row_data):
        table2.rows[i].cells[j].text = val

doc.add_page_break()

# ═══════════════════════════════════════════════════════════
# 4. CANALES DE VENTA
# ═══════════════════════════════════════════════════════════
doc.add_heading('4. Canales de Venta y Estrategia Multicanal', level=1)
doc.add_paragraph(
    'KREID adopta una estrategia multicanal para maximizar el alcance y diversificar '
    'las fuentes de ingreso. Cada canal cumple un rol específico en el funnel.'
)

doc.add_heading('4.1 Shopify — Tienda principal', level=2)
doc.add_paragraph(
    'Shopify es la tienda principal y el hub central del negocio. Concentra el '
    'catálogo completo, la gestión de inventario, los pagos con tarjeta (Stripe), '
    'y la analítica de ventas.\n\n'
    '• Dominio: kreidbeauty.com (por registrar)\n'
    '• Pagos: Stripe (tarjetas) + Oxxo/transferencias (opcional)\n'
    '• Diseño: Optimizado para conversión con efectos de dopamina\n'
    '• Funcionalidades: Carrito, checkout, cuenta de cliente, wishlist, reviews'
)

doc.add_heading('4.2 TikTok Shop — Canal de venta nativo', level=2)
doc.add_paragraph(
    'TikTok Shop es el canal estratégico principal para adquisición. Permite vender '
    'directamente dentro de TikTok sin redirigir a otra página. Ideal para el '
    'público objetivo (mujeres 18-35) que ya consume contenido de skincare en la '
    'plataforma.\n\n'
    '• Comisión: ~6% (más baja que Mercado Libre)\n'
    '• Formatos: Lives de venta, shoppable videos, showcase en perfil\n'
    '• Sinergia: El mismo contenido orgánico que genera views también vende\n'
    '• Conexión directa con Shopify (ver sección 5)'
)

doc.add_heading('4.3 Facebook e Instagram', level=2)
doc.add_paragraph(
    'Meta (Facebook + Instagram) se usa principalmente para tráfico pagado (Meta Ads) '
    'y construcción de comunidad. Instagram Shopping conecta el catálogo de Shopify '
    'con la tienda de Instagram.\n\n'
    '• Meta Ads: $15-20 USD/día para validación inicial\n'
    '• Instagram Shopping: Catálogo sincronizado desde Shopify\n'
    '• Facebook Lives: Entregas personales en Toluca y alrededores\n'
    '• Grupos de Facebook: Comunidades de skincare y beauty mexicanas\n'
    '• Retargeting: Pixel de Meta en la tienda Shopify'
)

doc.add_heading('4.4 Mercado Libre', level=2)
doc.add_paragraph(
    'Mercado Libre se usa como canal complementario para capturar tráfico de '
    'búsqueda orgánica. Aunque la comisión es más alta (~14.5% en Belleza), '
    'la visibilidad en la plataforma más grande de México compensa.\n\n'
    '• Comisión Belleza: ~14.5%\n'
    '• Estrategia: Listados optimizados para SEO interno de ML\n'
    '• Fullfilment: Mercado Envíos (opcional, reduce fricción)\n'
    '• NOTA: ML MX bloqueó nuestras búsquedas de scraping — requiere '
    'investigación manual de competencia en la plataforma'
)

doc.add_heading('4.5 Estrategia de contenido cruzado', level=2)
doc.add_paragraph(
    'El contenido se crea una vez y se distribuye en todos los canales:\n\n'
    '1. Video para TikTok (demo de producto, rutina skincare, unboxing)\n'
    '2. El mismo video se publica como Reel en Instagram y Facebook\n'
    '3. Las fotos del producto van a Instagram Shopping y catálogo Shopify\n'
    '4. Los testimonios de clientes se comparten en todas las plataformas\n'
    '5. Facebook Lives se graban y los highlights van a TikTok'
)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════
# 5. INTEGRACIÓN SHOPIFY ↔ TIKTOK SHOP
# ═══════════════════════════════════════════════════════════
doc.add_heading('5. Integración Shopify ↔ TikTok Shop', level=1)
doc.add_paragraph(
    'Shopify y TikTok tienen una integración oficial que permite gestionar '
    'TikTok Shop directamente desde el panel de Shopify. Esta integración '
    'es gratuita y está disponible en México.'
)

doc.add_heading('5.1 ¿Qué permite la integración?', level=2)
beneficios = [
    'Sincronización de productos: Los productos de Shopify aparecen automáticamente en TikTok Shop.',
    'Gestión de inventario unificada: El stock se actualiza en ambas plataformas en tiempo real.',
    'Órdenes centralizadas: Las ventas de TikTok Shop se gestionan desde Shopify.',
    'Pixel de TikTok integrado: Tracking de conversiones sin código adicional.',
    'Campañas de TikTok Ads: Se pueden crear y gestionar desde Shopify.',
    'Catálogo de productos en TikTok: Aparece en la pestaña "Tienda" del perfil.',
]
for b in beneficios:
    doc.add_paragraph(b, style='List Bullet')

doc.add_heading('5.2 Requisitos para conectar', level=2)
requisitos = [
    'Cuenta de TikTok Business (no personal).',
    'TikTok Shop aprobado en México (requiere verificación de identidad y datos fiscales).',
    'Tienda Shopify activa con productos listos.',
    'Cumplir con las políticas de producto de TikTok Shop (no productos restringidos).',
    'Registro fiscal mexicano (RFC) para recibir pagos de TikTok Shop.',
]
for r in requisitos:
    doc.add_paragraph(r, style='List Bullet')

doc.add_heading('5.3 Proceso de conexión', level=2)
doc.add_paragraph(
    '1. En el panel de Shopify, ir a "Canales de venta" → "Agregar canal" → "TikTok".\n'
    '2. Instalar la app oficial de TikTok para Shopify.\n'
    '3. Iniciar sesión con la cuenta de TikTok Business.\n'
    '4. Conectar TikTok Shop (si ya está aprobado) o solicitar el registro.\n'
    '5. Configurar el Pixel de TikTok para tracking.\n'
    '6. Sincronizar el catálogo de productos.\n'
    '7. Configurar métodos de envío y políticas de devolución.'
)

doc.add_heading('5.4 Ventajas estratégicas', level=2)
ventajas = [
    'Menos fricción: El cliente compra sin salir de TikTok → mayor conversión.',
    'Algoritmo de TikTok: Los videos con productos etiquetados tienen más alcance.',
    'Lives de venta: Se pueden mostrar productos en vivo y vender en tiempo real.',
    'Afiliados: Creadores de contenido pueden promocionar productos por comisión.',
    'Datos unificados: Analíticas de TikTok + Shopify en un solo lugar.',
]
for v in ventajas:
    doc.add_paragraph(v, style='List Bullet')

doc.add_page_break()

# ═══════════════════════════════════════════════════════════
# 6. STACK TECNOLÓGICO
# ═══════════════════════════════════════════════════════════
doc.add_heading('6. Stack Tecnológico', level=1)

doc.add_heading('6.1 Tienda Web (React + Vite)', level=2)
stack_data = [
    ('Framework', 'React 19'),
    ('Build tool', 'Vite 6'),
    ('Estilos', 'Tailwind CSS'),
    ('Animaciones', 'Framer Motion + GSAP + Lenis (smooth scroll)'),
    ('Router', 'React Router DOM 7'),
    ('Backend/Database', 'Supabase (PostgreSQL)'),
    ('Auth', 'Supabase Auth'),
    ('Pagos', 'Stripe (Checkout Sessions)'),
    ('Analytics', 'Google Analytics GA4 (8 eventos)'),
    ('Deploy', 'Vercel (serverless)'),
    ('Lenguaje', 'JavaScript (migrando a TypeScript)'),
]
table3 = doc.add_table(rows=1, cols=2, style='Light Grid Accent 1')
table3.rows[0].cells[0].text = 'Componente'
table3.rows[0].cells[1].text = 'Tecnología'
for k, v in stack_data:
    row = table3.add_row().cells
    row[0].text = k
    row[1].text = v

doc.add_heading('6.2 Herramientas de negocio', level=2)
tools = [
    'Shopify — Plataforma de e-commerce principal.',
    'TikTok Shop — Venta nativa en TikTok.',
    'Instagram Shopping — Catálogo sincronizado.',
    'Meta Ads Manager — Tráfico pagado.',
    'Mercado Libre — Canal complementario.',
    'Stripe — Procesador de pagos.',
    'Supabase — Base de datos y autenticación.',
]
for t in tools:
    doc.add_paragraph(t, style='List Bullet')

doc.add_page_break()

# ═══════════════════════════════════════════════════════════
# 7. TIENDA WEB — SCREENSHOTS
# ═══════════════════════════════════════════════════════════
doc.add_heading('7. Tienda Web (Screenshots)', level=1)
doc.add_paragraph(
    'La tienda web fue construida con React 19 + Vite 6 + Tailwind CSS. '
    'A continuación se muestran las pantallas principales. '
    'La tienda está desplegada en Vercel: https://goose-dropshipping.vercel.app'
)

doc.add_heading('7.1 Homepage — Hero Section', level=2)
doc.add_paragraph('Sección principal con hero banner, productos destacados '
    'y llamada a la acción para explorar la colección de Beauty & Health.')
# Insert screenshot 1
img1 = os.path.join(IMGDIR, 'homepage-hero.png')
if os.path.exists(img1):
    doc.add_picture(img1, width=Inches(5.5))

doc.add_heading('7.2 Homepage — Productos Destacados', level=2)
doc.add_paragraph('Sección de productos destacados mostrando LED Mask ($1,999), '
    'Botas de Compresión ($2,499), Rodillo Facial de Jade ($349) y '
    'Termómetro Infrarrojo ($459).')
img2 = os.path.join(IMGDIR, 'products-section.png')
if os.path.exists(img2):
    doc.add_picture(img2, width=Inches(5.5))

doc.add_heading('7.3 Testimonios y Secciones', level=2)
doc.add_paragraph('Sección de testimonios de clientas reales, FAQ, '
    'newsletter y efectos visuales de dopamina para aumentar retención.')
img3 = os.path.join(IMGDIR, 'testimonials.png')
if os.path.exists(img3):
    doc.add_picture(img3, width=Inches(5.5))

doc.add_heading('7.4 Páginas adicionales implementadas', level=2)
paginas = [
    '/products — Catálogo con filtros, búsqueda, categorías y ordenamiento.',
    '/products/:id — Detalle de producto con galería, features, reviews.',
    '/checkout — Checkout con Stripe (PCI-DSS compliant).',
    '/success — Página de éxito post-pago.',
    '/dashboard — Dashboard admin con 6 secciones (overview, analytics, productos, órdenes, alertas, clientes).',
    '/account — Cuenta de usuario con órdenes expandibles y stats.',
    '/cart — Carrito persistente con localStorage.',
]
for p in paginas:
    doc.add_paragraph(p, style='List Bullet')

doc.add_page_break()

# ═══════════════════════════════════════════════════════════
# 8. PRÓXIMOS PASOS
# ═══════════════════════════════════════════════════════════
doc.add_heading('8. Próximos Pasos', level=1)

fases = [
    ('Fase 1 — Validación de precios (AHORA)', [
        'Buscar precios reales de LED mask en importadores CDMX.',
        'Visitar Plaza Izazaga 89 y Centro de Importadores.',
        'Cotizar en grupos de FB: "Importadora y mayoreo de productos CHINOS CDMX".',
        'Aplicar fórmula ratio ≥ 3.0.',
        'Si no pasa → pivot a Rodillo Fascia (🟢[2], wellness).',
    ]),
    ('Fase 2 — Setup de tienda Shopify', [
        'Registrar dominio kreidbeauty.com.',
        'Configurar tienda Shopify con tema optimizado.',
        'Instalar app de TikTok para Shopify y conectar TikTok Shop.',
        'Configurar Pixel de Meta y TikTok.',
        'Migrar catálogo de productos de la tienda React a Shopify.',
    ]),
    ('Fase 3 — Validación con tráfico', [
        'Meta Ads $15-20 USD/día → campaña a producto héroe.',
        'Medir CTR, CPC, add-to-cart, conversión.',
        'TikTok orgánico: 3-5 videos/semana con producto.',
        'Si ROAS ≥ 2.0 → escalar. Si no → iterar creatividades.',
    ]),
    ('Fase 4 — Escalamiento', [
        'Aumentar presupuesto de ads gradualmente.',
        'Activar TikTok Lives de venta.',
        'Activar Instagram Shopping y Facebook Shop.',
        'Añadir productos complementarios de los nichos validados.',
        'Explorar Mercado Libre como canal adicional.',
    ]),
]

for titulo, items in fases:
    doc.add_heading(titulo, level=2)
    for item in items:
        doc.add_paragraph(item, style='List Bullet')

doc.add_page_break()

# ═══════════════════════════════════════════════════════════
# 9. MÉTRICAS Y VALIDACIÓN
# ═══════════════════════════════════════════════════════════
doc.add_heading('9. Métricas y Validación', level=1)

doc.add_heading('9.1 Métricas clave de negocio', level=2)
metricas = [
    ('Ratio de rentabilidad', '≥ 3.0× (precio venta ÷ costo producto)'),
    ('CAC (Customer Acquisition Cost)', 'Meta: < $150 MXN por cliente'),
    ('AOV (Average Order Value)', 'Meta: ≥ $1,500 MXN'),
    ('ROAS (Return on Ad Spend)', 'Meta: ≥ 2.0× en validación, ≥ 3.0× en escala'),
    ('Tasa de conversión', 'Meta: ≥ 2% en Shopify, ≥ 3% en TikTok Shop'),
    ('Margen bruto', 'Meta: ≥ 60% después de comisiones y envío'),
]
for k, v in metricas:
    p = doc.add_paragraph()
    p.add_run(f'{k}: ').bold = True
    p.add_run(v)

doc.add_heading('9.2 Notas sobre competencia en TikTok Shop México', level=2)
doc.add_paragraph(
    'TikTok Shop México es un canal relativamente nuevo con menos saturación que '
    'Amazon MX o Mercado Libre. Los productos de Beauty & Health tienen alta '
    'demanda en la plataforma, especialmente en formato de video demostrativo. '
    'La combinación Shopify + TikTok Shop permite:\n\n'
    '• Gestionar todo desde un solo panel (Shopify).\n'
    '• Usar TikTok para tráfico y Shopify para conversión.\n'
    '• Datos unificados de clientes en Supabase.\n'
    '• Retargeting cross-platform (quien ve en TikTok, recibe ad en Meta).'
)

doc.add_heading('9.3 Riesgos identificados', level=2)
riesgos = [
    'COFEPRIS: Si el producto hace claims médicos, requiere registro. Solución: evitarlos en el marketing.',
    'Competencia: Hello Face está creciendo ~22 reviews/mes. Si acelera, la ventana se cierra.',
    'Proveedores: Dependencia de importadores CDMX. Si no hay stock, se necesita plan B (importación directa).',
    'TikTok Shop: Cambios en políticas o comisiones de la plataforma.',
    'Estacionalidad: Beauty puede tener picos en fechas específicas (Hot Sale, Buen Fin, Navidad).',
]
for r in riesgos:
    doc.add_paragraph(r, style='List Bullet')

# ─── FOOTER ──────────────────────────────────────────────
doc.add_paragraph()
doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('KREID — Q3 2026 | Documento generado el 5 de agosto de 2026')
run.font.size = Pt(9)
run.font.color.rgb = RGBColor(0x9c, 0xa3, 0xaf)

# ─── GUARDAR ──────────────────────────────────────────────
doc.save(OUTPUT)
print(f'✅ DOCX generado: {OUTPUT}')
print(f'📄 Tamaño: {os.path.getsize(OUTPUT):,} bytes')
