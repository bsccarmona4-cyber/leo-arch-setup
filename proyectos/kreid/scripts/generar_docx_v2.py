#!/usr/bin/env python3
"""Genera DOCX v2 del proyecto KREID — General, sin productos específicos"""
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

OUTPUT = os.path.expanduser("~/kreid/docs/KREID_Proyecto_General.docx")
IMGDIR = os.path.expanduser("~/kreid/docs/imagenes")

doc = Document()

style = doc.styles['Normal']
font = style.font
font.name = 'Calibri'
font.size = Pt(10)
font.color.rgb = RGBColor(0x1a, 0x1a, 0x1a)

for i in range(1, 5):
    h = doc.styles[f'Heading {i}']
    h.font.name = 'Calibri'
    h.font.color.rgb = RGBColor(0x1a, 0x56, 0xdb)

# ─── PORTADA ───
doc.add_paragraph()
doc.add_paragraph()
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run('KREID')
run.font.size = Pt(48)
run.font.bold = True
run.font.color.rgb = RGBColor(0x1a, 0x56, 0xdb)

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run('Plataforma de Comercio Electrónico — México')
run.font.size = Pt(20)
run.font.color.rgb = RGBColor(0x6b, 0x72, 0x80)

doc.add_paragraph()
meta = doc.add_paragraph()
meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
meta.add_run('Documento del Proyecto · Agosto 2026 · Versión 2.0').font.size = Pt(10)
doc.add_page_break()

# ═══ 1. VISIÓN GENERAL ═══
doc.add_heading('1. Visión General', level=1)
doc.add_paragraph(
    'KREID es una plataforma de comercio electrónico enfocada en categorías de alta demanda '
    'en el mercado mexicano. Opera bajo un modelo de venta multicanal que integra '
    'TikTok Shop como canal principal de conversión, complementado con tienda propia '
    'y presencia en marketplaces.'
)
doc.add_paragraph(
    'El enfoque está en categorías con ventanas de oportunidad comprobadas: mercados donde '
    'la competencia es baja o fragmentada, el ticket es atractivo, y el público objetivo '
    'ya está presente en las plataformas seleccionadas.'
)

doc.add_heading('Métricas objetivo', level=2)
metrics = [
    ('Margen bruto por venta', '≥ 60% después de comisiones de plataforma y envío'),
    ('CAC (costo de adquisición)', '≤ $150 MXN por cliente'),
    ('ROAS', '≥ 2.5× sostenido'),
    ('Tasa de conversión', '≥ 3% en TikTok Shop, ≥ 2% en web propia'),
]
t = doc.add_table(rows=1, cols=2, style='Light Grid Accent 1')
t.rows[0].cells[0].text = 'Métrica'
t.rows[0].cells[1].text = 'Meta'
for k, v in metrics:
    r = t.add_row().cells
    r[0].text = k
    r[1].text = v

doc.add_page_break()

# ═══ 2. NICHOS ═══
doc.add_heading('2. Nichos Identificados', level=1)
doc.add_paragraph(
    'Se realizó una auditoría de mercado en Amazon México abarcando 8 categorías '
    'y ~60 subcategorías. Cada una fue evaluada con datos de reviews reales, número '
    'de competidores y tendencia de crecimiento.'
)

categories = [
    ('2.1 Belleza y Cuidado Personal', [
        ('Dispositivos de terapia lumínica facial', 'VIABLE [2] — 2 marcas activas, crecimiento mensual constante, ticket medio-alto.'),
        ('Dispositivos de microcorriente', 'SATURADO — Marca dominante con +1,900 reviews.'),
        ('Cosméticos y consumibles', 'SATURADO — 5+ canales, marcas multinacionales.'),
    ]),
    ('2.2 Recuperación Muscular y Bienestar', [
        ('Botas de compresión', 'VIABLE [1] — 12+ productos, 0-113 reviews. Ticket $1,300-$10,000.'),
        ('Rodillos de fascia', 'VIABLE [2] — Mercado fragmentado sin marca dominante. Ticket accesible.'),
        ('Pistolas de masaje', 'SATURADO — Marca líder con +19,000 reviews.'),
    ]),
    ('2.3 Hogar — Organización', [
        ('Organizadores de nevera (acero)', 'VIABLE [2] — Genéricos 0-18 reviews. Marcas premium saturadas.'),
        ('Especieros/estantes magnéticos', 'VIABLE [2] — Marcas pequeñas 0-27 reviews. Sin líder.'),
        ('Ganchos magnéticos', 'SATURADO — Marca líder +700 reviews.'),
    ]),
    ('2.4 Juguetes Educativos (STEM)', [
        ('Kits de ciencia (económicos)', 'VIABLE [1] — 34-97 reviews. Marcas premium en otro segmento.'),
        ('Microscopios infantiles', 'VIABLE [2] — Marcas pequeñas 0-17 reviews.'),
        ('Bloques magnéticos (gama media)', 'VIABLE [2] — 11-49 reviews. Gama alta saturada.'),
    ]),
    ('2.5 Otras categorías', [
        ('Termómetros infrarrojos', 'VIABLE [2] — 79 reviews totales, baja competencia.'),
        ('Reposamuñecas (oficina)', 'VIABLE [2] — 1-8 reviews, mercado casi inexistente.'),
        ('Organizadores de cajuela (auto)', 'VIABLE [1] — 22 reviews, sin marca dominante.'),
    ]),
]
for cat_title, items in categories:
    doc.add_heading(cat_title, level=2)
    for item_title, item_desc in items:
        p = doc.add_paragraph()
        p.add_run(f'{item_title}: ').bold = True
        p.add_run(item_desc)

doc.add_page_break()

# ═══ CANALES ═══
doc.add_heading('3. Canales de Venta y Estrategia', level=1)

doc.add_heading('3.1 TikTok Shop — Canal principal', level=2)
doc.add_paragraph(
    'TikTok Shop es el eje de la estrategia de venta. Permite transacciones nativas '
    'sin que el usuario salga de la aplicación, reduciendo la fricción de compra. '
    'El contenido orgánico (videos demostrativos, lives) se convierte directamente '
    'en ventas atribuibles.'
)
for item in [
    'Formato: Videos shoppable + lives de venta + showcase en perfil',
    'Pagos: Pasarela nativa de TikTok (tarjetas, Oxxo, transferencias)',
    'Logística: Envío gestionado por el vendedor o por TikTok (FBT opcional)',
]:
    doc.add_paragraph(item, style='List Bullet')

doc.add_heading('3.2 Tienda Web Propia', level=2)
doc.add_paragraph(
    'Plataforma independiente que funciona como hub central del catálogo y destino '
    'para tráfico de anuncios (Meta Ads). Construida con tecnología moderna para '
    'maximizar velocidad de carga y conversión.'
)
for item in [
    'Pagos: Mercado Pago (tarjetas, Oxxo, SPEI, meses sin intereses)',
    'Función: Catálogo completo, SEO, remarketing, email marketing',
]:
    doc.add_paragraph(item, style='List Bullet')

doc.add_heading('3.3 Redes Sociales (Instagram, Facebook)', level=2)
for item in [
    'Instagram Shopping: Catálogo sincronizado con la tienda',
    'Facebook Shop: Tienda integrada en la página',
    'Meta Ads: Tráfico pagado segmentado hacia tienda web y TikTok',
]:
    doc.add_paragraph(item, style='List Bullet')

doc.add_heading('3.4 Sincronización de contenido', level=2)
for i, item in enumerate([
    'Video para TikTok → mismo video como Reel en Instagram/Facebook',
    'Fotos de producto → catálogo web + Instagram Shopping + TikTok Showcase',
    'Testimonios de clientes → contenido para todas las plataformas',
    'Lives de TikTok → clips destacados para ads y orgánico',
], 1):
    doc.add_paragraph(f'{i}. {item}')

doc.add_page_break()

# ═══ 4. COSTOS ═══
doc.add_heading('4. Estructura de Costos por Canal', level=1)

doc.add_heading('4.1 TikTok Shop — Desglose de tarifas', level=2)
tt_fees = [
    ('Comisión de plataforma', '5% – 8%', 'Varía por categoría. Belleza ~6%.'),
    ('Tarifa fija por transacción', '$6.00 MXN', 'Por cada orden, sin importar el monto.'),
    ('Procesamiento de pago', 'Incluido en comisión', 'TikTok procesa con pasarela propia.'),
    ('Envío (FBT)', 'Variable', 'Opcional. ~$40-$80 MXN si se usa Fulfillment by TikTok.'),
    ('Afiliados/creadores', '1% – 20%', 'Opcional. Comisión a creadores por promoción.'),
]
t = doc.add_table(rows=1, cols=3, style='Light Grid Accent 1')
t.rows[0].cells[0].text = 'Concepto'
t.rows[0].cells[1].text = 'Tarifa'
t.rows[0].cells[2].text = 'Notas'
for concept, fee, note in tt_fees:
    r = t.add_row().cells
    r[0].text = concept
    r[1].text = fee
    r[2].text = note

doc.add_paragraph(
    'Ejemplo: venta de $500 MXN (Belleza 6%) → $30 + $6 = $36 MXN (7.2%). '
    'Venta de $2,000 MXN → $120 + $6 = $126 MXN (6.3%). '
    'A mayor ticket, menor impacto del costo fijo.'
)

doc.add_paragraph(
    'Ruta recomendada: TikTok Shop es el canal prioritario por tener la comisión '
    'más baja (~6% + $6 MXN) y la mayor capacidad de conversión con contenido '
    'orgánico. A diferencia de Mercado Libre (~14.5%), el margen neto es '
    'significativamente mayor.'
)

doc.add_heading('4.2 Tienda Web — Mercado Pago', level=2)
mp_fees = [
    ('Tarjetas crédito/débito', '2.99% + IVA'),
    ('Pago en Oxxo/efectivo', '~3.5% + IVA'),
    ('Meses sin intereses', 'Varía (5-12%)'),
    ('Transferencias SPEI', 'Sin costo'),
]
t = doc.add_table(rows=1, cols=2, style='Light Grid Accent 1')
t.rows[0].cells[0].text = 'Concepto'
t.rows[0].cells[1].text = 'Tarifa'
for k, v in mp_fees:
    r = t.add_row().cells
    r[0].text = k
    r[1].text = v

doc.add_heading('4.3 Comparativa de canales', level=2)
comp = [
    ('TikTok Shop', '~6-7%', 'Orgánico + pagado', 'Conversión principal'),
    ('Tienda Web + Mercado Pago', '~3.5%', 'Pagado (Meta Ads)', 'Hub + remarketing'),
    ('Mercado Libre', '~14.5%', 'Orgánico (búsqueda)', 'Complementario'),
    ('Instagram/Facebook Shop', '~3.5%', 'Orgánico + pagado', 'Tráfico a web'),
]
t = doc.add_table(rows=1, cols=4, style='Light Grid Accent 1')
t.rows[0].cells[0].text = 'Canal'
t.rows[0].cells[1].text = 'Costo/venta'
t.rows[0].cells[2].text = 'Tráfico'
t.rows[0].cells[3].text = 'Rol'
for a, b, c, d in comp:
    r = t.add_row().cells
    r[0].text = a
    r[1].text = b
    r[2].text = c
    r[3].text = d

doc.add_page_break()

# ═══ 5. INTEGRACIÓN TIKTOK ═══
doc.add_heading('5. Integración con TikTok Shop', level=1)

doc.add_heading('5.1 ¿Cómo funciona?', level=2)
doc.add_paragraph(
    'TikTok Shop permite vender productos directamente dentro de la aplicación sin '
    'redirección externa. El usuario ve un video, toca el producto, y completa la '
    'compra sin salir de TikTok.'
)

doc.add_heading('5.2 Formatos de venta', level=2)
for item in [
    'Video shoppable: Videos con productos etiquetados. Checkout integrado.',
    'LIVE de venta: Transmisión en vivo con compra en tiempo real. Mayor conversión.',
    'Showcase: Pestaña "Tienda" en el perfil con catálogo completo.',
]:
    doc.add_paragraph(item, style='List Bullet')

doc.add_heading('5.3 Requisitos para México', level=2)
for item in [
    'Cuenta TikTok Business (no personal)',
    'Registro en TikTok Shop Seller Center',
    'RFC y datos fiscales mexicanos',
    'Cuenta bancaria para pagos',
    'Productos que cumplan políticas de TikTok Shop',
]:
    doc.add_paragraph(item, style='List Bullet')

doc.add_heading('5.4 Ruta recomendada', level=2)
for i, item in enumerate([
    'Crear cuenta TikTok Business y solicitar acceso a TikTok Shop',
    'Subir catálogo al Seller Center',
    'Crear contenido orgánico diario (2-3 videos) con productos etiquetados',
    'Programar 2-3 lives semanales de venta',
    'Validar demanda con orgánico → escalar con TikTok Ads',
    'Activar afiliados para que creadores promocionen por comisión',
], 1):
    doc.add_paragraph(f'{i}. {item}')

doc.add_page_break()

# ═══ 6. PLATAFORMA ═══
doc.add_heading('6. Plataforma Tecnológica', level=1)

doc.add_heading('6.1 Tienda Web', level=2)
doc.add_paragraph(
    'La tienda web está construida como SPA (Single Page Application) con renderizado '
    'ultrarrápido. Tres principios guiaron la arquitectura: velocidad de carga (crítica '
    'en México con tráfico móvil 4G), experiencia visual envolvente (animaciones fluidas, '
    'scroll narrativo), y despliegue serverless (costo $0 fijo, escala automático).'
)

stack = [
    ('Interfaz de usuario', 'React 19', 'Framework con mayor ecosistema, renderizado eficiente'),
    ('Empaquetado', 'Vite 6', 'Dev instantáneo, builds optimizados, HMR rápido'),
    ('Estilos', 'Tailwind CSS', 'CSS atómico sin código muerto, personalizable'),
    ('Animaciones', 'Framer Motion + GSAP', 'Animaciones declarativas + control de timeline'),
    ('Base de datos', 'Supabase (PostgreSQL)', 'PostgreSQL administrado, API REST, auth incluido'),
    ('Pagos', 'Mercado Pago', 'Checkout con todos los medios de pago mexicanos'),
    ('Despliegue', 'Vercel', 'CDN global, deploy git, serverless, dominio personalizado'),
]
t = doc.add_table(rows=1, cols=3, style='Light Grid Accent 1')
t.rows[0].cells[0].text = 'Capa'
t.rows[0].cells[1].text = 'Tecnología'
t.rows[0].cells[2].text = 'Justificación'
for a, b, c in stack:
    r = t.add_row().cells
    r[0].text = a
    r[1].text = b
    r[2].text = c

doc.add_heading('6.2 Flujo de compra', level=2)
for i, item in enumerate([
    'Usuario llega por TikTok, Instagram, Google o directo',
    'Explora catálogo con filtros por categoría y precio',
    'Agrega al carrito (localStorage + Supabase si autenticado)',
    'Checkout con Mercado Pago',
    'Página de éxito + email automático',
    'Dashboard: administrador ve órdenes, productos, analytics',
], 1):
    doc.add_paragraph(f'{i}. {item}')

doc.add_heading('6.3 Por qué este stack', level=2)
for item in [
    'Costo inicial $0: Vercel + Supabase planes gratuitos. Solo dominio ($200 MXN/año)',
    'Escala automática: sin administrar servidores. Aguanta tráfico viral de TikTok',
    'Iteración rápida: cambios en minutos con deploy desde git',
    'Independencia: si TikTok Shop cambia políticas, la web propia sigue funcionando',
]:
    doc.add_paragraph(item, style='List Bullet')

doc.add_page_break()

# ═══ 7. TIENDA ═══
doc.add_heading('7. Tienda Web — Estructura y Diseño', level=1)
doc.add_paragraph(
    'La tienda fue diseñada bajo el concepto de "dopamina e-commerce": una experiencia '
    'visual que mantiene al usuario explorando. En lugar de una cuadrícula estática, '
    'la página narra un recorrido con animaciones al scroll, secciones que revelan '
    'contenido progresivamente, y micro-interacciones premium.'
)

doc.add_heading('7.1 Página principal', level=2)
img1 = os.path.join(IMGDIR, 'homepage-hero.png')
if os.path.exists(img1):
    doc.add_picture(img1, width=Inches(5.2))
doc.add_paragraph('Secciones narrativas del home:')
for i, item in enumerate([
    'Hero: mensaje principal + CTA',
    'Prueba social: clientes, reseñas, envíos',
    'Productos destacados: grid con hover effects, compra rápida',
    'Colecciones: navegación visual por categorías',
    'Quiz interactivo: recomendador de productos (engagement)',
], 1):
    doc.add_paragraph(f'{i}. {item}')

doc.add_heading('7.2 Secciones inferiores', level=2)
img2 = os.path.join(IMGDIR, 'products-section.png')
if os.path.exists(img2):
    doc.add_picture(img2, width=Inches(5.2))
for i, item in enumerate([
    'Beneficios: ventajas competitivas',
    'Scroll narrativo: contenido avanza con el scroll',
    'Scroll horizontal: galería lateral de productos',
    'Testimonios: reseñas con foto, nombre, ubicación',
], 6):
    doc.add_paragraph(f'{i}. {item}')

doc.add_heading('7.3 Testimonios y cierre', level=2)
img3 = os.path.join(IMGDIR, 'testimonials.png')
if os.path.exists(img3):
    doc.add_picture(img3, width=Inches(5.2))
for i, item in enumerate([
    'Newsletter: captura de correos',
    'FAQ: preguntas frecuentes con acordeón',
], 10):
    doc.add_paragraph(f'{i}. {item}')

doc.add_heading('7.4 Páginas funcionales', level=2)
pages = [
    ('/products', 'Catálogo con búsqueda, filtros, ordenamiento'),
    ('/products/:id', 'Detalle: galería, specs, reseñas, relacionados'),
    ('/cart', 'Carrito persistente con cálculo de envío gratis'),
    ('/checkout', 'Checkout integrado con Mercado Pago'),
    ('/account', 'Historial de órdenes, datos de envío, seguimiento'),
    ('/dashboard', 'Panel admin: analytics, productos, órdenes, alertas'),
]
t = doc.add_table(rows=1, cols=2, style='Light Grid Accent 1')
t.rows[0].cells[0].text = 'Ruta'
t.rows[0].cells[1].text = 'Función'
for k, v in pages:
    r = t.add_row().cells
    r[0].text = k
    r[1].text = v

doc.add_heading('7.5 Principios de diseño', level=2)
for item in [
    'Mobile-first: diseño desde celular (80%+ del tráfico en México)',
    'Velocidad: Lighthouse >90. Lazy-loading, code splitting por ruta',
    'Persuasión visual: partículas, contadores, confetti — sutil, no invasivo',
    'Persistencia: carrito y preferencias en localStorage',
    'Independencia de backend: si Supabase falla, la tienda sigue con caché local',
]:
    doc.add_paragraph(item, style='List Bullet')

# ─── GUARDAR ───
doc.save(OUTPUT)
print(f'✅ DOCX v2 generado: {OUTPUT}')
print(f'📄 Tamaño: {os.path.getsize(OUTPUT):,} bytes')
