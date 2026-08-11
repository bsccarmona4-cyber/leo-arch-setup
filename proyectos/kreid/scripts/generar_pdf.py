#!/usr/bin/env python3
"""Genera un PDF del documento KREID via HTML + Playwright"""
import os
from playwright.sync_api import sync_playwright

DOCS = os.path.expanduser("~/kreid/docs")
OUTPUT = os.path.join(DOCS, "KREID_Proyecto_General.pdf")

html = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 2cm; size: A4; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; line-height: 1.6; font-size: 11pt; }
  .cover { text-align: center; padding: 120px 0; page-break-after: always; }
  .cover h1 { font-size: 48pt; color: #1a56db; margin: 0; }
  .cover h2 { font-size: 20pt; color: #6b7280; margin: 10px 0 40px; }
  h1 { color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 6px; margin-top: 30px; }
  h2 { color: #1e40af; margin-top: 24px; }
  table { border-collapse: collapse; width: 100%; margin: 15px 0; }
  th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
  th { background: #1a56db; color: white; }
  .green { background: #d1fae5; color: #065f46; padding: 1px 6px; border-radius: 3px; font-weight: bold; }
  .yellow { background: #fef3c7; color: #92400e; padding: 1px 6px; border-radius: 3px; font-weight: bold; }
  .red { background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 3px; font-weight: bold; }
  .page-break { page-break-before: always; }
  img { max-width: 100%; margin: 10px 0; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
  .footer { text-align: center; color: #9ca3af; font-size: 9pt; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  ul { padding-left: 20px; }
  li { margin: 4px 0; }
  .kpi td:first-child { font-weight: bold; width: 35%; }
</style>
</head>
<body>

<!-- ═══ PORTADA ═══ -->
<div class="cover">
  <h1>KREID</h1>
  <h2>Comercio Beauty & Health — México</h2>
  <p style="font-size:12pt">Documento del Proyecto</p>
  <p style="font-size:10pt; color:#6b7280">Agosto 2026 · Q3 2026 · Versión 1.0</p>
</div>

<!-- ═══ 1. RESUMEN EJECUTIVO ═══ -->
<h1>1. Resumen Ejecutivo</h1>
<p>KREID es un proyecto de comercio electrónico enfocado en el mercado mexicano de <strong>Beauty & Health</strong> (belleza y salud). El modelo es <strong>comercio formal con compra a importadores en CDMX</strong> — sin dropshipping, sin aduanas, sin esperas de 45 días. Los productos ya están en México y se compran a proveedores mayoristas establecidos en la zona de importación de la capital.</p>

<p>El producto héroe identificado es la <strong>máscara LED de terapia lumínica</strong> (LED Light Therapy Mask), con un mercado validado de solo 2 marcas en Amazon México, 44-111 reviews y crecimiento de ~22 reviews/mes. El ticket promedio es de $2,000 MXN con un ratio de rentabilidad de 3.2× al importar directo.</p>

<h2>KPIs del proyecto</h2>
<table class="kpi">
<tr><th>Métrica</th><th>Valor</th></tr>
<tr><td>Producto héroe</td><td>LED Light Therapy Mask (Hello Face)</td></tr>
<tr><td>Ticket promedio</td><td>$2,000 MXN</td></tr>
<tr><td>Ratio de rentabilidad</td><td>3.2× (precio venta ÷ costo importador)</td></tr>
<tr><td>Canales de venta</td><td>Shopify + TikTok Shop + Mercado Libre + FB Lives</td></tr>
<tr><td>Inversión inicial estimada</td><td>$15,000-$25,000 MXN (inventario + ads + store)</td></tr>
<tr><td>Meta Ads presupuesto</td><td>$15-20 USD/día para validación inicial</td></tr>
<tr><td>Mercado objetivo</td><td>Mujeres 18-45 años, México, skincare tech</td></tr>
<tr><td>Competidores directos (Amazon MX)</td><td>Solo 2 marcas</td></tr>
</table>

<!-- ═══ 2. MODELO DE NEGOCIO ═══ -->
<div class="page-break"></div>
<h1>2. Modelo de Negocio</h1>

<h2>2.1 Tipo de comercio</h2>
<p>Comercio formal — <strong>NO dropshipping</strong>. Los productos se compran a importadores mayoristas ubicados en la Ciudad de México que ya tienen la mercancía en el país. Esto elimina los problemas del dropshipping tradicional: tiempos de envío de 30-45 días, aduanas, MOQ altos de fábrica, y problemas de calidad sin control.</p>

<h2>2.2 Fuentes de importadores CDMX</h2>
<ul>
  <li>Grupos de Facebook: "Importadora y mayoreo de productos CHINOS CDMX"</li>
  <li>Plataformas: productoschinos.com.mx, sasbim.com, plazamayoreo.com</li>
  <li>Zonas físicas: Plaza Izazaga 89, Centro de Importadores, calle Leona Vicario</li>
</ul>

<h2>2.3 Fórmula de validación</h2>
<p><strong>Ratio = Precio de venta ÷ Precio del importador CDMX</strong></p>
<p><span class="green">≥ 3.0 → VIABLE</span> &nbsp; <span class="yellow">2.0–2.9 → AJUSTADO</span> &nbsp; <span class="red">＜ 2.0 → DESCARTAR</span></p>

<h2>2.4 Logística y costos</h2>
<table>
<tr><th>Concepto</th><th>Detalle</th></tr>
<tr><td>Envío nacional (1kg)</td><td>$80-$180 MXN (Estafeta/Redpack/Paquetexpress)</td></tr>
<tr><td>Comisión Mercado Libre (Belleza)</td><td>~14.5%</td></tr>
<tr><td>Comisión TikTok Shop</td><td>~6%</td></tr>
<tr><td>Comisión Shopify + Stripe</td><td>~2.9% + $4 MXN por transacción</td></tr>
<tr><td>Importación directa China</td><td>IGI 10-15% + DTA 0.8% + IVA 16% ≈ 27-32% sobre CIF</td></tr>
<tr><td>Flete aéreo China→MX</td><td>$3-8 USD/kg</td></tr>
</table>

<!-- ═══ 3. NICHOS ═══ -->
<div class="page-break"></div>
<h1>3. Nichos Identificados — Auditoría de Mercado</h1>
<p>Auditoría completa realizada el <strong>25 de julio de 2026</strong> usando curl + Puppeteer en Amazon México (ML MX bloqueado). ~60 productos verificados con reviews reales. Marcadores de confianza: <strong>[2]</strong> = 2+ fuentes independientes, <strong>[1]</strong> = 1 fuente.</p>

<h2>3.1 Beauty & Care 🥇 (Foco principal)</h2>
<table>
<tr><th>Producto</th><th>Estado</th></tr>
<tr><td><span class="green">LED/Light Therapy Masks</span></td><td>🟢[2] Hello Face 44-111 reviews (~22/mes). Solo 2 marcas. PRODUCTO HÉROE.</td></tr>
<tr><td><span class="red">Microcurrent devices</span></td><td>🔴 Skindion 1,967 reviews. SATURADO.</td></tr>
<tr><td><span class="red">Skincare consumibles</span></td><td>🔴 L'Oréal 130-640 reviews, 5+ canales. SATURADO.</td></tr>
</table>

<h2>3.2 Sports & Outdoor → Recovery</h2>
<table>
<tr><th>Producto</th><th>Estado</th></tr>
<tr><td><span class="green">Botas de compresión</span></td><td>🟢[1] 12+ productos (0-113 reviews). Ticket $1,376-$9,990.</td></tr>
<tr><td><span class="green">Rodillos fascia</span></td><td>🟢[2] 0-170 reviews, sin marca dominante. Ticket $125-$393.</td></tr>
<tr><td><span class="red">Pistola masaje</span></td><td>🔴 RENPHO 19.7K rev. SATURADO.</td></tr>
</table>

<h2>3.3 Home & Garden → Organización</h2>
<table>
<tr><th>Producto</th><th>Estado</th></tr>
<tr><td><span class="green">Organizadores nevera/acero</span></td><td>🟢[2] Genéricos 0-18 reviews. Ticket $100-$1,250.</td></tr>
<tr><td><span class="green">Especieros/estantes magnéticos</span></td><td>🟢[2] Maxgeen (27), GALASALA (6). Ticket $229-$449.</td></tr>
</table>

<h2>3.4 Baby & Toys → STEM</h2>
<table>
<tr><th>Producto</th><th>Estado</th></tr>
<tr><td><span class="green">Kits de ciencia (marcas chinas)</span></td><td>🟢[1] 34-97 reviews. Ticket $298-$498.</td></tr>
<tr><td><span class="green">Microscopios infantiles</span></td><td>🟢[2] AYNEFY (8), LICAEVEY (17). Ticket $249-$1,052.</td></tr>
<tr><td><span class="green">Bloques magnéticos (gama media)</span></td><td>🟢[2] Nasjac (25), RaceGT (27), Raganet (49).</td></tr>
</table>

<h2>3.5 Industrial, Office y otros nichos</h2>
<table>
<tr><th>Producto</th><th>Estado</th></tr>
<tr><td><span class="green">Termómetro infrarrojo</span></td><td>🟢[2] IR genérico 79 reviews, 4.4★.</td></tr>
<tr><td><span class="green">Reposamuñecas</span></td><td>🟢[2] 1-8 reviews. Mercado casi inexistente.</td></tr>
<tr><td><span class="red">Teclado ergonómico</span></td><td>🔴 AUSENTE en Amazon MX. Categoría no existe.</td></tr>
</table>

<h2>3.6 Resumen de la auditoría</h2>
<table>
<tr><th>Confianza</th><th>🟢 Viable</th><th>🟡 Ajustado</th><th>🔴 Descartado</th></tr>
<tr><td>[2] 2+ fuentes</td><td>8</td><td>0</td><td>4</td></tr>
<tr><td>[1] 1 fuente</td><td>4</td><td>4</td><td>5</td></tr>
<tr><td><strong>Total</strong></td><td><strong>12</strong></td><td><strong>4</strong></td><td><strong>9</strong></td></tr>
</table>

<!-- ═══ 4. CANALES ═══ -->
<div class="page-break"></div>
<h1>4. Canales de Venta y Estrategia Multicanal</h1>

<h2>4.1 Shopify — Tienda principal</h2>
<p>Shopify es la tienda principal y el hub central del negocio. Concentra el catálogo completo, la gestión de inventario, los pagos con tarjeta (Stripe), y la analítica de ventas.</p>
<ul>
  <li><strong>Dominio:</strong> kreidbeauty.com (por registrar)</li>
  <li><strong>Pagos:</strong> Stripe (tarjetas) + Oxxo/transferencias (opcional)</li>
  <li><strong>Diseño:</strong> Optimizado para conversión con efectos de dopamina</li>
</ul>

<h2>4.2 TikTok Shop — Canal de venta nativo</h2>
<p>TikTok Shop permite vender directamente dentro de TikTok <strong>sin redirigir a otra página</strong>. Ideal para el público objetivo (mujeres 18-35) que ya consume contenido de skincare en la plataforma.</p>
<ul>
  <li><strong>Comisión:</strong> ~6% (más baja que Mercado Libre)</li>
  <li><strong>Formatos:</strong> Lives de venta, shoppable videos, showcase en perfil</li>
  <li><strong>Sinergia:</strong> El mismo contenido orgánico que genera views también vende</li>
</ul>

<h2>4.3 Facebook e Instagram</h2>
<ul>
  <li><strong>Meta Ads:</strong> $15-20 USD/día para validación inicial</li>
  <li><strong>Instagram Shopping:</strong> Catálogo sincronizado desde Shopify</li>
  <li><strong>Facebook Lives:</strong> Entregas personales en Toluca y alrededores</li>
  <li><strong>Retargeting:</strong> Pixel de Meta en la tienda Shopify</li>
</ul>

<h2>4.4 Mercado Libre</h2>
<p>Canal complementario para capturar tráfico de búsqueda orgánica. Comisión ~14.5% en Belleza.</p>

<h2>4.5 Estrategia de contenido cruzado</h2>
<ol>
  <li>Video para TikTok (demo de producto, rutina skincare, unboxing)</li>
  <li>El mismo video se publica como Reel en Instagram y Facebook</li>
  <li>Fotos del producto → Instagram Shopping y catálogo Shopify</li>
  <li>Testimonios de clientes → todas las plataformas</li>
  <li>Facebook Lives → highlights van a TikTok</li>
</ol>

<!-- ═══ 5. SHOPIFY ↔ TIKTOK ═══ -->
<div class="page-break"></div>
<h1>5. Integración Shopify ↔ TikTok Shop</h1>
<p>Shopify y TikTok tienen una integración oficial que permite gestionar TikTok Shop directamente desde el panel de Shopify. Esta integración es gratuita y está disponible en México.</p>

<h2>5.1 ¿Qué permite la integración?</h2>
<ul>
  <li><strong>Sincronización de productos:</strong> Los productos de Shopify aparecen automáticamente en TikTok Shop</li>
  <li><strong>Gestión de inventario unificada:</strong> El stock se actualiza en ambas plataformas en tiempo real</li>
  <li><strong>Órdenes centralizadas:</strong> Las ventas de TikTok Shop se gestionan desde Shopify</li>
  <li><strong>Pixel de TikTok integrado:</strong> Tracking de conversiones sin código adicional</li>
  <li><strong>Campañas de TikTok Ads:</strong> Se pueden crear y gestionar desde Shopify</li>
  <li><strong>Catálogo en TikTok:</strong> Aparece en la pestaña "Tienda" del perfil</li>
</ul>

<h2>5.2 Requisitos</h2>
<ul>
  <li>Cuenta de TikTok Business (no personal)</li>
  <li>TikTok Shop aprobado en México (verificación de identidad y RFC)</li>
  <li>Tienda Shopify activa con productos listos</li>
  <li>Cumplir con las políticas de producto de TikTok Shop</li>
</ul>

<h2>5.3 Proceso de conexión</h2>
<ol>
  <li>Shopify → "Canales de venta" → "Agregar canal" → "TikTok"</li>
  <li>Instalar la app oficial de TikTok para Shopify</li>
  <li>Iniciar sesión con la cuenta de TikTok Business</li>
  <li>Conectar TikTok Shop (o solicitar el registro)</li>
  <li>Configurar el Pixel de TikTok para tracking</li>
  <li>Sincronizar el catálogo de productos</li>
</ol>

<h2>5.4 Ventajas estratégicas</h2>
<ul>
  <li>Menos fricción: el cliente compra sin salir de TikTok → mayor conversión</li>
  <li>Algoritmo de TikTok: videos con productos etiquetados tienen más alcance</li>
  <li>Lives de venta: mostrar productos en vivo y vender en tiempo real</li>
  <li>Afiliados: creadores de contenido pueden promocionar por comisión</li>
  <li>Datos unificados: analíticas de TikTok + Shopify en un solo lugar</li>
</ul>

<!-- ═══ 6. STACK ═══ -->
<div class="page-break"></div>
<h1>6. Stack Tecnológico</h1>

<h2>6.1 Tienda Web (React + Vite)</h2>
<table>
<tr><th>Componente</th><th>Tecnología</th></tr>
<tr><td>Framework</td><td>React 19</td></tr>
<tr><td>Build tool</td><td>Vite 6</td></tr>
<tr><td>Estilos</td><td>Tailwind CSS</td></tr>
<tr><td>Animaciones</td><td>Framer Motion + GSAP + Lenis</td></tr>
<tr><td>Router</td><td>React Router DOM 7</td></tr>
<tr><td>Backend/Database</td><td>Supabase (PostgreSQL)</td></tr>
<tr><td>Auth</td><td>Supabase Auth</td></tr>
<tr><td>Pagos</td><td>Stripe (Checkout Sessions)</td></tr>
<tr><td>Analytics</td><td>Google Analytics GA4 (8 eventos)</td></tr>
<tr><td>Deploy</td><td>Vercel (serverless)</td></tr>
</table>

<h2>6.2 Herramientas de negocio</h2>
<ul>
  <li>Shopify — Plataforma de e-commerce principal</li>
  <li>TikTok Shop — Venta nativa en TikTok</li>
  <li>Instagram Shopping — Catálogo sincronizado</li>
  <li>Meta Ads Manager — Tráfico pagado</li>
  <li>Mercado Libre — Canal complementario</li>
  <li>Stripe — Procesador de pagos</li>
  <li>Supabase — Base de datos y autenticación</li>
</ul>

<!-- ═══ 7. SCREENSHOTS ═══ -->
<div class="page-break"></div>
<h1>7. Tienda Web — Screenshots</h1>
<p>La tienda fue construida con React 19 + Vite 6 + Tailwind CSS. Desplegada en Vercel.</p>

<h2>7.1 Homepage — Hero Section</h2>
<p>Sección principal con hero banner, productos destacados y llamada a la acción.</p>
<img src="imagenes/homepage-hero.png" alt="KREID Homepage">

<h2>7.2 Homepage — Productos Destacados</h2>
<p>LED Mask ($1,999), Botas de Compresión ($2,499), Rodillo Facial de Jade ($349), Termómetro Infrarrojo ($459).</p>
<img src="imagenes/products-section.png" alt="KREID Products">

<h2>7.3 Testimonios y Secciones</h2>
<p>Testimonios de clientas reales, FAQ, newsletter y efectos visuales de dopamina.</p>
<img src="imagenes/testimonials.png" alt="KREID Testimonials">

<h2>7.4 Páginas adicionales implementadas</h2>
<ul>
  <li><code>/products</code> — Catálogo con filtros, búsqueda, categorías</li>
  <li><code>/products/:id</code> — Detalle con galería, features, reviews</li>
  <li><code>/checkout</code> — Checkout con Stripe (PCI-DSS compliant)</li>
  <li><code>/success</code> — Página de éxito post-pago</li>
  <li><code>/dashboard</code> — Dashboard admin (overview, analytics, productos, órdenes, alertas, clientes)</li>
  <li><code>/account</code> — Cuenta de usuario con órdenes expandibles</li>
  <li><code>/cart</code> — Carrito persistente con localStorage</li>
</ul>

<!-- ═══ 8. PRÓXIMOS PASOS ═══ -->
<div class="page-break"></div>
<h1>8. Próximos Pasos</h1>

<h2>Fase 1 — Validación de precios (AHORA)</h2>
<ul>
  <li>Buscar precios reales de LED mask en importadores CDMX</li>
  <li>Visitar Plaza Izazaga 89 y Centro de Importadores</li>
  <li>Cotizar en grupos de FB: "Importadora y mayoreo de productos CHINOS CDMX"</li>
  <li>Aplicar fórmula ratio ≥ 3.0</li>
  <li>Si no pasa → pivot a Rodillo Fascia (🟢[2], wellness)</li>
</ul>

<h2>Fase 2 — Setup de tienda Shopify</h2>
<ul>
  <li>Registrar dominio kreidbeauty.com</li>
  <li>Configurar tienda Shopify con tema optimizado</li>
  <li>Instalar app de TikTok para Shopify y conectar TikTok Shop</li>
  <li>Configurar Pixel de Meta y TikTok</li>
  <li>Migrar catálogo de la tienda React a Shopify</li>
</ul>

<h2>Fase 3 — Validación con tráfico</h2>
<ul>
  <li>Meta Ads $15-20 USD/día → campaña a producto héroe</li>
  <li>Medir CTR, CPC, add-to-cart, conversión</li>
  <li>TikTok orgánico: 3-5 videos/semana con producto</li>
  <li>Si ROAS ≥ 2.0 → escalar. Si no → iterar creatividades</li>
</ul>

<h2>Fase 4 — Escalamiento</h2>
<ul>
  <li>Aumentar presupuesto de ads gradualmente</li>
  <li>Activar TikTok Lives de venta</li>
  <li>Activar Instagram Shopping y Facebook Shop</li>
  <li>Añadir productos complementarios de los nichos validados</li>
  <li>Explorar Mercado Libre como canal adicional</li>
</ul>

<!-- ═══ 9. MÉTRICAS ═══ -->
<div class="page-break"></div>
<h1>9. Métricas y Validación</h1>

<h2>9.1 Métricas clave de negocio</h2>
<table>
<tr><th>Métrica</th><th>Meta</th></tr>
<tr><td>Ratio de rentabilidad</td><td>≥ 3.0× (precio venta ÷ costo producto)</td></tr>
<tr><td>CAC (Customer Acquisition Cost)</td><td>＜ $150 MXN por cliente</td></tr>
<tr><td>AOV (Average Order Value)</td><td>≥ $1,500 MXN</td></tr>
<tr><td>ROAS (Return on Ad Spend)</td><td>≥ 2.0× validación, ≥ 3.0× escala</td></tr>
<tr><td>Tasa de conversión</td><td>≥ 2% Shopify, ≥ 3% TikTok Shop</td></tr>
<tr><td>Margen bruto</td><td>≥ 60% después de comisiones y envío</td></tr>
</table>

<h2>9.2 TikTok Shop México — Ventaja competitiva</h2>
<p>TikTok Shop México es un canal relativamente nuevo con menos saturación que Amazon MX o Mercado Libre. Los productos de Beauty & Health tienen alta demanda en la plataforma. La combinación Shopify + TikTok Shop permite gestionar todo desde un solo panel, usar TikTok para tráfico y Shopify para conversión, datos unificados de clientes, y retargeting cross-platform.</p>

<h2>9.3 Riesgos identificados</h2>
<ul>
  <li><strong>COFEPRIS:</strong> Si el producto hace claims médicos, requiere registro. Solución: evitarlos en el marketing</li>
  <li><strong>Competencia:</strong> Hello Face creciendo ~22 reviews/mes. Si acelera, la ventana se cierra</li>
  <li><strong>Proveedores:</strong> Dependencia de importadores CDMX. Plan B: importación directa</li>
  <li><strong>TikTok Shop:</strong> Cambios en políticas o comisiones de la plataforma</li>
  <li><strong>Estacionalidad:</strong> Picos en Hot Sale, Buen Fin, Navidad</li>
</ul>

<div class="footer">
  <p>KREID — Q3 2026 | Documento generado el 5 de agosto de 2026</p>
</div>

</body>
</html>"""

html_path = os.path.join(DOCS, "KREID_Proyecto_General.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)

print(f"✅ HTML generado: {html_path}")
print(f"📄 Tamaño: {os.path.getsize(html_path):,} bytes")

# Convertir a PDF con Playwright
print("\n🖨️ Convirtiendo a PDF...")
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    page = browser.new_page()
    
    # Usar file:// para cargar el HTML local con las imágenes
    page.goto(f"file://{html_path}", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(1000)
    
    page.pdf(
        path=OUTPUT,
        format="A4",
        margin={"top": "2cm", "bottom": "2cm", "left": "2cm", "right": "2cm"},
        print_background=True,
    )
    browser.close()

size_kb = os.path.getsize(OUTPUT) / 1024
print(f"✅ PDF generado: {OUTPUT}")
print(f"📄 Tamaño: {size_kb:.0f} KB")
