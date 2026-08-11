// ─────────────────────────────────────────────────────────────
// content.mjs — Construye todos los bloques de la página (v2)
// Sin emojis, sin instrucciones/procedimiento, sin columnas,
// tono de informe, con imágenes de Commons + generadas.
// ─────────────────────────────────────────────────────────────
import { H, P, B, Q, TABLE, IMG, D } from './lib.mjs';

// ── DATOS: ficha de formatos (1.a) ───────────────────────────
const FICHA = [
  ['JPEG (JPG)',
   'Fotografía web, redes sociales, banners, landing pages.',
   'Compresión con pérdida muy eficiente; soporte universal; tamaño pequeño; calidad ajustable.',
   'Pérdida irreversible; artefactos de bloqueo en bordes; sin transparencia ni animación.',
   'DCT 8×8 con pérdida; 8 bits/canal RGB; submuestreo de croma 4:2:0; metadatos EXIF; sin alfa.'],
  ['PNG-8',
   'Iconos, logos planos, gráficos con pocos colores, sprites web.',
   'Paleta indexada de hasta 256 colores → archivos muy ligeros; sin pérdida; transparencia 1 bit.',
   'Solo 256 colores (banding en degradados); sin animación; transparencia dura.',
   'Paleta indexada de 8 bits; DEFLATE sin pérdida; transparencia binaria; sin EXIF completo.'],
  ['PNG-24',
   'Capturas de pantalla, UI, imágenes con transparencia suave, degradados.',
   'Sin pérdida; 16.7 millones de colores; alfa de 8 bits (256 niveles); ideal para texto/UI.',
   'Archivos pesados en fotos (1920×1080 ≈ 726 KB); sin animación; sin CMYK.',
   'RGB de 8 bits/canal + alfa; DEFLATE sin pérdida; interlazado Adam7; metadatos tEXt/gAMA.'],
  ['GIF',
   'Memes, animaciones cortas, logos retro, banners animados simples.',
   'Animación; transparencia 1 bit; soporte histórico universal; sin pérdida en paleta.',
   'Solo 256 colores; transparencia dura; animaciones pesadas; obsoleto para fotografía.',
   'Paleta indexada 8 bits; compresión LZW sin pérdida; animación por frames con delay y loop.'],
  ['WebP',
   'Web moderna: fotos, banners, iconos, animaciones ligeras.',
   'Hasta ~30% más ligero que JPEG a igual calidad (41 KB vs 284 KB en 1920×1080); lossy y lossless; alfa; animación.',
   'Compatibilidad con navegadores antiguos (Safari <14, IE); codificación más lenta; sin CMYK.',
   'Contenedor RIFF; códec VP8/VP8L; lossy con DCT + predicción intra; lossless VP8L; alfa 8 bits.'],
  ['SVG',
   'Logos, iconografía, ilustraciones vectoriales, gráficos de datos, UI escalable.',
   'Vectorial → escala infinita sin pérdida; tamaño mínimo (497 B un corazón); texto buscable; animable con CSS/SMIL.',
   'No apto para fotos; render depende del navegador; demasiados nodos pueden pesar; scripts = riesgo.',
   'XML; formas y paths matemáticos; viewBox sin resolución fija; color con perfiles; metadatos XML.'],
  ['SVGZ',
   'Distribución de SVGs grandes: mapas, icon sets, archivos de diseño.',
   'Mismo SVG comprimido con gzip → hasta 70-90% más pequeño; sin pérdida.',
   'Requiere servidor con Content-Encoding: gzip; no editable directamente.',
   'SVG + gzip (RFC 1952); compresión sin pérdida; descomprime en el cliente.'],
  ['TIFF',
   'Fotografía profesional, preimpresión, escaneo, archivo científico.',
   'Sin pérdida; 16 bits/canal; CMYK; multi-página; flexibilidad de compresión (LZW, ZIP, JPEG).',
   'Archivos enormes (1920×1080 ≈ 802 KB con LZW); sin soporte nativo en navegadores.',
   'Contenedor flexible con tags; 1-32 bits por muestra; RGB/CMYK/gris; compresión LZW/ZIP/JPEG/CCITT.'],
  ['BMP',
   'Fondos de Windows legacy, assets de apps antiguas, prototipos.',
   'Simplicidad absoluta; sin compresión (lectura trivial); sin pérdida; soporte nativo en Windows.',
   'Enorme: 1920×1080 ≈ 6.0 MB; sin transparencia real; sin soporte web.',
   'Raster plano; 1/4/8/24/32 bits por píxel; sin compresión o RLE; encabezado DIB.'],
  ['HEIC / HEIF',
   'Fotos de iPhone/iOS, almacenamiento fotográfico eficiente.',
   'Compresión HEVC ≈ 50% menor que JPEG; 10-16 bits; alfa; múltiples imágenes por archivo.',
   'Soporte limitado en web/Windows/Android; patentes HEVC; requiere códec.',
   'Contenedor ISO BMFF; códec HEVC (H.265) intra-frame; tiles; derivados; metadatos EXIF/XMP.'],
  ['RAW',
   'Fotografía profesional: CR2/CR3 (Canon), NEF (Nikon), ARW (Sony), DNG.',
   'Datos crudos del sensor → máximo rango dinámico; 12-16 bits; sin pérdida; control total de edición.',
   'Archivos enormes (25-60 MB); propietario por marca (salvo DNG); requiere software especializado.',
   'Datos de sensor sin procesar (bayer); 12-16 bits; metadatos de disparo; DNG = estándar abierto.'],
  ['AVIF',
   'Web de alta eficiencia: fotos, banners, contenido HDR.',
   'Compresión AV1 ≈ 50% menor que JPEG y ~20% vs WebP (23 KB en 1920×1080); 8/10/12 bits; HDR; alfa; animación.',
   'Codificación lenta; compatibilidad aún en expansión; sin CMYK; ecosistema joven.',
   'Contenedor HEIF (ISO BMFF); códec AV1 intra; 4:2:0/4:4:4; HDR (PQ/HLG); perfiles de color.'],
  ['ICO',
   'Favicons de sitios web, iconos de apps Windows.',
   'Multi-resolución en un solo archivo (16/32/48/256 px); soporte nativo en navegadores y Windows.',
   'Contenedor legacy; compresión pobre; sin animación estándar.',
   'Contenedor de BMP/PNG comprimidas; directorio de tamaños; 8/24/32 bits; alfa vía PNG.'],
  ['EPS / PSD',
   'EPS: imprenta e ilustración vectorial (PostScript). PSD: diseño con capas en Photoshop.',
   'EPS: vectorial, independiente de resolución, estándar de imprenta. PSD: capas, edición no destructiva.',
   'No son formatos web; archivos pesados; PSD es propietario de Adobe.',
   'EPS: PostScript + preview. PSD: capas y canales, compresión RLE sin pérdida, 8/16/32 bits.'],
];

const FUENTES = [
  ['JPEG', [['jpeg.org', 'https://jpeg.org/jpeg/'], ['W3C', 'https://www.w3.org/Graphics/JPEG/']]],
  ['PNG-8/PNG-24', [['W3C — PNG', 'https://www.w3.org/TR/png-3/'], ['libpng.org', 'http://www.libpng.org/pub/png/libpng.html']]],
  ['GIF', [['W3C — GIF89a', 'https://www.w3.org/Graphics/GIF/spec-gif89a.txt'], ['FileFormat.info', 'https://www.fileformat.info/format/gif/egff.htm']]],
  ['WebP', [['Google Developers', 'https://developers.google.com/speed/webp'], ['Can I Use', 'https://caniuse.com/webp']]],
  ['SVG', [['W3C — SVG 2.0', 'https://www.w3.org/TR/SVG2/'], ['MDN — SVG', 'https://developer.mozilla.org/es/docs/Web/SVG']]],
  ['SVGZ', [['W3C — SVG', 'https://www.w3.org/TR/SVG2/'], ['RFC 1952 (gzip)', 'https://datatracker.ietf.org/doc/html/rfc1952']]],
  ['TIFF', [['Adobe — TIFF 6.0', 'https://www.adobe.io/open/standards/TIFF.html'], ['libtiff', 'https://libtiff.gitlab.io/libtiff/']]],
  ['BMP', [['Microsoft — Bitmap', 'https://learn.microsoft.com/es-es/windows/win32/gdi/bitmap-structures'], ['FileFormat.info', 'https://www.fileformat.info/format/bmp/egff.htm']]],
  ['HEIC/HEIF', [['Nokia — HEIF', 'https://nokiatech.github.io/heif/technical.html'], ['Apple — HEIF', 'https://support.apple.com/es-mx/HT207022']]],
  ['RAW', [['Adobe — DNG', 'https://helpx.adobe.com/camera-raw/digital-negative.html'], ['Wikipedia — RAW', 'https://es.wikipedia.org/wiki/Formato_de_imagen_RAW']]],
  ['AVIF', [['AOM — AVIF', 'https://aomediacodec.github.io/av1-avif/'], ['Can I Use — AVIF', 'https://caniuse.com/avif']]],
  ['ICO', [['Microsoft — ICO', 'https://learn.microsoft.com/es-es/windows/win32/icm/'], ['FileFormat.info', 'https://www.fileformat.info/format/ico/egff.htm']]],
  ['EPS/PSD', [['Wikipedia — EPS', 'https://es.wikipedia.org/wiki/PostScript_encapsulado'], ['Adobe — PSD', 'https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/']]],
];

const COMPARATIVA = [
  ['JPEG', 'Web, redes, fotografía', 'Ligero, universal', 'Pérdida, sin alfa', 'Fotos de blog, posts', 'Mejor balance peso/calidad para fotografía cuando el color plano no es crítico.'],
  ['PNG-8', 'UI, iconos planos', 'Minúsculo, sin pérdida', '256 colores', 'Botones, sprites', 'Ideal cuando la imagen cabe en una paleta pequeña y se quiere nitidez exacta.'],
  ['PNG-24', 'UI, capturas, transparencia', 'Alfa suave, sin pérdida', 'Pesado en fotos', 'Screenshots, overlays', 'Impone calidad total sobre peso; correcto para gráficos con transparencia.'],
  ['GIF', 'Memes, animaciones cortas', 'Animación simple', '256 colores', 'Stickers, logos animados', 'Único con soporte histórico para animación ligera, aunque WebP ya lo supera.'],
  ['WebP', 'Web moderna', 'Alfa + animación + ligero', 'Compatibilidad vieja', 'Hero de landing, banners', 'Sucede a JPEG/PNG/GIF combinando pérdida, alfa y animación en un formato.'],
  ['SVG', 'Iconografía, logos', 'Escala infinita, mínimo', 'No fotos', 'Logo, íconos de app', 'El costo no depende de la resolución: se define por geometría, no por píxeles.'],
  ['SVGZ', 'Distribución de vectores', 'SVG comprimido', 'Requiere gzip', 'Mapas, icon sets', 'Aplica compresión sin pérdida al XML para reducir transferencia.'],
  ['TIFF', 'Imprenta, archivo', '16 bits, CMYK', 'Enorme, no web', 'Arte final, escaneos', 'Formato de archivo profesional: prioriza fidelidad y editabilidad, no peso.'],
  ['BMP', 'Windows legacy', 'Simple, sin pérdida', '6 MB en 1080p', 'Fondos antiguos', 'Guarda píxel por píxel sin comprimir: simplicidad a costa de tamaño.'],
  ['HEIC', 'Fotos móvil (Apple)', '50% menor que JPEG', 'Compatibilidad', 'Fotos de iPhone', 'Optimiza almacenamiento móvil con HEVC a costa de soporte generalizado.'],
  ['RAW', 'Fotografía profesional', 'Máximo rango dinámico', 'Pesado, propietario', 'Sesiones de estudio', 'Guarda lo que el sensor capturó para editar sin degradar en postproducción.'],
  ['AVIF', 'Web de alta eficiencia', 'Mejor compresión', 'Codificación lenta', 'Fotos HDR en web', 'Lleva la compresión AV1 al dominio de imagen fija: máxima eficiencia moderna.'],
  ['ICO', 'Favicons, iconos Windows', 'Multiresolución', 'Legacy', 'Favicon del sitio', 'Agrupa varios tamaños en uno para que el SO o navegador elija el adecuado.'],
  ['EPS/PSD', 'Imprenta, diseño', 'Vector/capas', 'No web', 'Logos de imprenta, PSD', 'Formatos de trabajo profesional donde importa la estructura, no el peso.'],
];

const DATOS = [
  ['JPEG', 'Con pérdida (DCT)', '284 KB @ q80 (medido)', '24 bits RGB', 'No', 'No'],
  ['PNG-8', 'Sin pérdida (paleta)', '~193 KB (medido)', '8 bits indexado', 'Sí (1 bit)', 'No'],
  ['PNG-24', 'Sin pérdida (DEFLATE)', '726 KB (medido)', '24 bits RGB + alfa', 'Sí (8 bits)', 'No'],
  ['GIF', 'Sin pérdida (LZW)', '336 KB estático / 1.3 MB animado (medido)', '8 bits indexado', 'Sí (1 bit)', 'Sí'],
  ['WebP', 'Con/sin pérdida (VP8/VP8L)', '41 KB @ q80; 347 KB lossless (medido)', '24 bits + alfa', 'Sí (8 bits)', 'Sí'],
  ['SVG', 'N/A (vectorial XML)', '~0.5 KB (medido)', 'Colores ICC', 'Sí', 'Sí (CSS/SMIL)'],
  ['SVGZ', 'Sin pérdida (gzip)', '~70-90% menos que SVG', 'Igual que SVG', 'Sí', 'Sí'],
  ['TIFF', 'Sin pérdida (LZW/ZIP)', '802 KB LZW / 510 KB ZIP (medido)', '8-16 bits, CMYK', 'Sí', 'No (multi-página)'],
  ['BMP', 'Ninguna (o RLE)', '6.0 MB (medido)', '1-32 bits', 'No real', 'No'],
  ['HEIC', 'Con pérdida (HEVC)', '~50% de JPEG ≈ 140 KB (estimado)', '8-16 bits', 'Sí', 'Sí'],
  ['RAW', 'Sin pérdida (crudos)', '25-60 MB (estimado)', '12-16 bits/canal', 'No aplica', 'No'],
  ['AVIF', 'Con pérdida (AV1)', '23 KB @ q60 (medido)', '8-12 bits, HDR', 'Sí', 'Sí'],
  ['ICO', 'Sin pérdida (BMP/PNG)', '~44 KB multiresolución (medido)', '8-32 bits', 'Sí (vía PNG)', 'No'],
  ['EPS/PSD', 'EPS: vectorial; PSD: RLE', 'Variable', 'RGB/CMYK/16 bits', 'Sí', 'No'],
];

const AJUSTES = [
  ['Reducción de color (paleta)', 'PNG-8: bajar de 16.7 M a ≤256 colores con cuantización adaptativa. Medido: 726 KB → 193 KB en la foto (73% menos) con banding visible en cielos; en íconos planos el banding es nulo y el ahorro total.'],
  ['Submuestreo de croma (4:2:0)', 'En JPEG/WebP lossy se muestrea el color a la mitad de resolución que el brillo: imperceptible en fotos, ahorra ~30-40%. Evitar en texto/UI de colores puros (fringes).'],
  ['Resolución', 'Redimensionar al tamaño de render real. Una foto mostrada a 800 px no necesita 1920 px: la mitad de píxeles ≈ la mitad del archivo.'],
  ['Transparencia', 'PNG-24 para alfa suave (bordes difuminados); PNG-8 solo transparencia dura (1 bit); WebP/AVIF alfa con color comprimido y alfa nítida.'],
  ['Metadatos', 'Eliminar EXIF/GPS antes de publicar web (privacidad y peso); conservar en TIFF/RAW para flujo profesional (autoría, cámara, derechos).'],
  ['Perfiles de color', 'Web: sRGB (estándar de navegadores); pantallas HDR/P3: AVIF con perfil P3; imprenta: CMYK + ICC. Sin perfil, el color se ve apagado o sobresaturado.'],
];

const COMPAT = [
  ['JPEG', 'Sí', 'Sí', 'Sí', 'Sí'],
  ['PNG-8/24', 'Sí', 'Sí', 'Sí', 'Sí'],
  ['GIF', 'Sí', 'Sí', 'Sí', 'Sí'],
  ['WebP', 'Sí', 'Sí', 'Sí (14+)', 'Sí'],
  ['AVIF', 'Sí (85+)', 'Sí (77+)', 'Sí (16.4+)', 'Sí (17+)'],
  ['SVG', 'Sí', 'Sí', 'Sí', 'Sí'],
  ['TIFF', 'No', 'No', 'No', 'No'],
  ['BMP', 'Parcial', 'No', 'No', 'No'],
  ['HEIC', 'No', 'No', 'No', 'No (iOS nativo)'],
];

// Rich text con links
const seg = (t, b = false, u = null) => {
  const s = { text: { content: t }, annotations: { bold: b } };
  if (u) s.text.link = { url: u };
  return s;
};
const BS = (segs) => ({ bulleted_list_item: { rich_text: segs } });

// ── CONSTRUCTOR PRINCIPAL ───────────────────────────────────
export function buildBlocks(urls) {
  const blocks = [];

  // ══════════ PORTADA ══════════
  blocks.push(H(1, 'Formatos de Imagen Digital', 'purple'));
  blocks.push(H(2, 'Consulta, comparativa, escenarios y optimización de formatos'));
  blocks.push(P('Informe sobre formatos de imagen digital: ficha técnica por formato, tabla comparativa con datos medidos a 1920×1080, tres escenarios de uso y un análisis de optimización y justificación técnica.'));

  // ══════════ ÍNDICE ══════════
  blocks.push(H(2, 'Contenido', 'blue'));
  blocks.push(B('1 · Consulta de formatos y ficha personal'));
  blocks.push(B('2 · Tabla comparativa'));
  blocks.push(B('3 · Tres escenarios de uso'));
  blocks.push(B('4 · Optimización de archivos para medios digitales'));
  blocks.push(B('5 · Justificación técnica de composiciones'));
  blocks.push(B('6 · Referencias técnicas'));
  blocks.push(D());

  // ══════════ 1.a ══════════
  blocks.push(H(1, '1 · Consulta de formatos', 'purple'));
  blocks.push(P('Los formatos de imagen se dividen en raster (píxeles) y vectoriales (geometría). El mapa siguiente ubica cada formato según su alcance de uso:'));
  blocks.push(IMG(urls['Image_formats_by_scope.png'], 'Mapa de formatos de imagen por ámbito de uso (Wikimedia Commons).'));
  blocks.push(P('La diferencia entre una imagen raster y una vectorial define la escalabilidad y el peso:'));
  blocks.push(IMG(urls['Vector_vs_raster.png'], 'Comparación visual: imagen raster (izquierda, se pixeliza al ampliar) vs vectorial (derecha, escala sin pérdida).'));
  blocks.push(H(2, 'Ficha personal de formatos', 'blue'));
  blocks.push(TABLE(
    ['Formato', 'Medio de uso típico', 'Ventajas clave', 'Desventajas clave', 'Características técnicas'],
    FICHA, true
  ));
  blocks.push(P(''));
  blocks.push(H(2, 'Fuentes sugeridas (2 referencias técnicas por formato)', 'blue'));
  for (const [fmt, refs] of FUENTES) {
    const segs = [seg(fmt + ' — ', true)];
    refs.forEach((r, i) => segs.push(seg(r[0] + (i === 0 ? ' · ' : ''), false, r[1])));
    blocks.push(BS(segs));
  }
  blocks.push(D());

  // ══════════ 1.b ══════════
  blocks.push(H(1, '2 · Tabla comparativa', 'purple'));
  blocks.push(H(2, '2.1 Comparativa general', 'blue'));
  blocks.push(TABLE(
    ['Formato', 'Medios de aplicación', 'Ventajas', 'Desventajas', 'Ejemplos de uso', 'Justificación técnica'],
    COMPARATIVA, true
  ));
  blocks.push(P(''));
  blocks.push(H(2, '2.2 Datos prácticos — imagen de referencia 1920×1080', 'blue'));
  blocks.push(P('Tamaños medidos exportando la misma imagen de referencia (foto sintética con degradados, textura y detalles). HEIC y RAW se estiman con valores documentados.'));
  blocks.push(TABLE(
    ['Formato', 'Compresión típica', 'Tamaño @ 1920×1080', 'Soporte de color', 'Transparencia', 'Animación'],
    DATOS, true
  ));
  blocks.push(P('La comparación independiente siguiente (JPEG vs PNG vs JPEG XL vs HEIC) refuerza la relación entre formato y peso para una misma escena:'));
  blocks.push(IMG(urls['Test_-_image_size_comparison_(Jpeg_vs_Png_vs_Jpeg_XL_vs_Heic).png'], 'Comparación de tamaño de archivo entre formatos para la misma imagen (Wikimedia Commons).'));
  blocks.push(Q('La misma foto pesa 6.0 MB en BMP, 726 KB en PNG-24, 284 KB en JPEG q80, 41 KB en WebP q80 y 23 KB en AVIF q60: elegir formato es decidir entre fidelidad y peso.'));
  blocks.push(D());

  // ══════════ 1.c ══════════
  blocks.push(H(1, '3 · Tres escenarios de uso', 'purple'));

  blocks.push(H(2, 'Escenario 1 · Imagen hero para landing page web', 'blue'));
  blocks.push(P('Formato recomendado: WebP (lossy, q80) con fallback JPEG.'));
  blocks.push(B('WebP entrega 41 KB vs 284 KB de JPEG q80 → 85% menos de peso con calidad visual equivalente.'));
  blocks.push(B('Soporta fotografía con degradados y detalle, el caso de uso de un hero.'));
  blocks.push(B('AVIF (23 KB medidos) queda como alternativa futura; PNG-24 se descarta por peso sin ganancia visual.'));
  blocks.push(B('Optimización: redimensionar al tamaño real de render, submuestreo 4:2:0, eliminar metadatos EXIF/GPS, usar sRGB y lazy loading.'));
  blocks.push(IMG(urls['foto_webp_q80.webp'], 'Versión WebP q80 — 41 KB.'));
  blocks.push(IMG(urls['foto_jpeg_q80.jpg'], 'Versión JPEG q80 — 284 KB (fallback universal).'));
  blocks.push(Q('Para una landing, la velocidad de carga es prioridad: WebP ahorra ~85% frente a JPEG con pérdida imperceptible en fotografía; AVIF es el upgrade futuro.'));

  blocks.push(H(2, 'Escenario 2 · Iconografía de interfaz (logotipo/íconos)', 'blue'));
  blocks.push(P('Formato recomendado: SVG (vectorial) con PNG-24 como respaldo.'));
  blocks.push(B('El corazón en SVG pesa 497 B vs 2.4 KB de PNG-24 → 5× menos.'));
  blocks.push(B('Escala a cualquier tamaño/DPR (retina, 4K) sin pixelar ni re-exportar.'));
  blocks.push(B('Colores y estados (hover, dark mode) editables por CSS sin regenerar archivos.'));
  blocks.push(B('Alternativas: PNG-8 (1.3 KB) si el ícono usa ≤128 colores; WebP con alfa para sprites fotográficos.'));
  blocks.push(IMG(urls['icono.svg'], 'Ícono en SVG — 497 B (vectorial, escala infinita).'));
  blocks.push(IMG(urls['icono_png24.png'], 'Ícono en PNG-24 con alfa — 2.4 KB (fallback).'));
  blocks.push(Q('La iconografía se repite y se re-escala: el SVG paga el costo de diseño una vez y escala gratis; PNG-24 solo se usa como fallback o con efectos raster complejos.'));

  blocks.push(H(2, 'Escenario 3 · Póster para impresión', 'blue'));
  blocks.push(P('Formato recomendado: TIFF (LZW, 300 DPI, CMYK) o PDF vectorial.'));
  blocks.push(B('Imprenta exige alta resolución (300 DPI reales) y modo de color CMYK.'));
  blocks.push(B('TIFF sin pérdida conserva 16 bits/canal para degradados sin banding en papel.'));
  blocks.push(B('Alternativas: PDF vectorial si hay texto/logos; PNG-24 RGB a 300 DPI si la imprenta convierte; JPEG q90 solo para bocetos.'));
  blocks.push(B('Optimización: resolución final de impresión, perfil ICC de la imprenta (p. ej. Coated FOGRA39), sangrado y marcas de corte.'));
  blocks.push(IMG(urls['RGB_and_CMYK_comparison.png'], 'Comparación de espacios de color RGB vs CMYK (Wikimedia Commons).'));
  blocks.push(Q('En impresión el criterio no es el peso sino la fidelidad: TIFF sin pérdida en CMYK evita banding y deriva de color; el PDF vectorial es mejor aún para tipografía.'));
  blocks.push(D());

  // ══════════ BLOQUE 2 ══════════
  blocks.push(H(1, '4 · Optimización de archivos para medios digitales', 'purple'));

  blocks.push(H(2, '4.1 Optimización por escenario', 'blue'));
  blocks.push(H(3, 'Escenario 1 · Foto para web: JPEG vs WebP vs PNG', 'default'));
  blocks.push(P('La misma imagen 1920×1080 exportada en varios formatos. La comparativa ampliada 3× muestra la calidad real de cada uno:'));
  blocks.push(IMG(urls['comparacion_calidad_small.jpg'], 'Comparativa de calidad: original PNG, JPEG q30 (artefactos de bloque), WebP q60, PNG-8 (banding). Ampliación 3×.'));
  blocks.push(TABLE(
    ['Versión', 'Tamaño', 'vs PNG-24', 'Pérdida perceptible', 'Ajustes aplicados'],
    [
      ['PNG-24 (referencia)', '726 KB', '—', 'Ninguna (sin pérdida)', 'Ninguno'],
      ['JPEG q80', '284 KB', '-61%', 'Mínima en fotos', 'Calidad 80, 4:2:0, sin metadatos'],
      ['JPEG q60', '220 KB', '-70%', 'Leve, ok para thumbnail', 'Calidad 60, 4:2:0'],
      ['WebP q80', '41 KB', '-94%', 'Imperceptible', 'Calidad 80, 4:2:0, sin metadatos'],
      ['WebP lossless', '347 KB', '-52%', 'Ninguna', 'Modo lossless VP8L'],
      ['AVIF q60', '23 KB', '-97%', 'Muy leve', 'Calidad 60, 4:2:0'],
      ['PNG-8 (paleta 256)', '193 KB', '-73%', 'Banding visible en cielos', 'Cuantización a 256 colores'],
      ['BMP', '6.0 MB', '+730%', 'Ninguna', 'Sin compresión (control)'],
    ], true
  ));
  blocks.push(P('Los artefactos típicos de la compresión con pérdida se aprecian en los ejemplos clásicos:'));
  blocks.push(IMG(urls['Compression-artifacts.jpg'], 'Artefactos de compresión JPEG en bordes de alto contraste (Wikimedia Commons).'));
  blocks.push(IMG(urls['JPEG_compression_Example.jpg'], 'Ejemplo de compresión JPEG: la calidad baja a la derecha (Wikimedia Commons).'));

  blocks.push(H(3, 'Escenario 2 · Iconografía: SVG vs PNG-24 vs PNG-8 vs WebP', 'default'));
  blocks.push(TABLE(
    ['Versión', 'Tamaño', 'vs SVG', 'Detalle', 'Cuándo usarla'],
    [
      ['SVG (vectorial)', '497 B', '—', 'Escala a cualquier resolución', 'Íconos, logos, UI responsive'],
      ['PNG-24 con alfa', '2.4 KB', '+380%', 'Alfa suave, sin pérdida', 'Fallback o efectos raster'],
      ['PNG-8 (128 colores)', '1.3 KB', '+170%', 'Plano, transparencia dura', 'Íconos planos con ≤128 colores'],
      ['WebP con alfa', '3.4 KB', '+590%', 'Compresión con pérdida', 'Sprites fotográficos con recorte'],
    ], true
  ));

  blocks.push(H(3, 'Transparencia: PNG-24 vs WebP y demostración de alfa', 'default'));
  blocks.push(IMG(urls['escena_png24.png'], 'Escena con transparencia en PNG-24 — 4.6 KB (referencia alfa).'));
  blocks.push(IMG(urls['escena_webp.webp'], 'Escena con transparencia en WebP — 5.0 KB.'));
  blocks.push(P('En gráficos planos con alfa, PNG-24 puede ganarle a WebP (4.6 KB vs 5.0 KB) porque DEFLATE es muy eficiente en áreas planas; WebP brilla en fotografía, no siempre en UI plana.'));
  blocks.push(IMG(urls['PNG_transparency_demonstration_2.png'], 'Demostración de transparencia PNG sobre fondos de color (Wikimedia Commons).'));
  blocks.push(IMG(urls['Alpha_transparency_image.png'], 'Canal alfa: la imagen muestra niveles de opacidad (Wikimedia Commons).'));

  blocks.push(H(3, 'Animación: GIF y sus alternativas', 'default'));
  blocks.push(IMG(urls['Nopngs.gif'], 'GIF animado pequeño: paleta de 256 colores y transparencia dura (Wikimedia Commons).'));
  blocks.push(IMG(urls['animacion_gif.gif'], 'Animación GIF de ejemplo: el peso crece con cada frame (Wikimedia Commons, reducido).'));
  blocks.push(P('El GIF sigue siendo el formato de animación con mayor soporte histórico, pero WebP animado y AVIF lo superan en peso y calidad de color.'));

  blocks.push(H(3, 'Ajustes técnicos aplicados', 'default'));
  blocks.push(TABLE(
    ['Ajuste', 'Qué hace y cuánto ahorra (medido)'],
    AJUSTES, true
  ));
  blocks.push(D());

  // 2.b
  blocks.push(H(1, '5 · Justificación técnica de composiciones', 'purple'));
  blocks.push(H(2, '5.1 Selección de formatos por escenario', 'blue'));
  blocks.push(B('Escenario web → WebP: la fotografía tolera pérdida selectiva; 94% de ahorro frente a PNG-24 con calidad visual equivalente. AVIF queda como evolución, JPEG como red de seguridad universal.'));
  blocks.push(B('Escenario iconografía → SVG: el costo de un ícono no depende de píxeles sino de geometría; se reutiliza en toda la UI sin re-exportar y se adapta a dark mode/DPR por CSS.'));
  blocks.push(B('Escenario impresión → TIFF/PDF: en papel el peso no importa; importan la resolución real (300 DPI), el modo de color CMYK y la ausencia de compresión destructiva.'));
  blocks.push(H(2, '5.2 Impacto en experiencia de usuario', 'blue'));
  blocks.push(B('Carga: el hero WebP (41 KB) descarga 7× más rápido que JPEG (284 KB) y 17× que PNG-24 (726 KB). En conexiones móviles esto decide si la página se ve o no.'));
  blocks.push(B('Claridad: sin submuestreo agresivo ni re-compresiones, el texto y bordes de UI se mantienen nítidos (PNG/SVG para UI, JPEG nunca para texto).'));
  blocks.push(B('Legibilidad: imágenes nítidas y de color consistente (sRGB) reducen el rebote; imágenes pesadas aumentan la tasa de abandono.'));
  blocks.push(H(2, '5.3 Compatibilidad entre plataformas y navegadores', 'blue'));
  blocks.push(TABLE(
    ['Formato', 'Chrome', 'Firefox', 'Safari', 'Edge/iOS'],
    COMPAT, true
  ));
  blocks.push(B('Estrategia de fallback: <picture> con AVIF → WebP → JPEG sirve lo mejor que cada navegador soporte sin romper nada.'));
  blocks.push(B('SVG y PNG tienen soporte universal: son la base segura; WebP/AVIF se sirven progresivamente.'));
  blocks.push(H(2, '5.4 Accesibilidad y escalabilidad', 'blue'));
  blocks.push(B('Texto alternativo (alt) descriptivo en cada imagen; SVG con <title>/<desc> y role="img" para lectores de pantalla.'));
  blocks.push(B('Escalabilidad: SVG escala a cualquier DPR sin re-exportar; los raster se generan a la resolución máxima esperada y se sirven con srcset.'));
  blocks.push(B('Contraste: evitar compresión fuerte en zonas de texto sobre imagen (legibilidad WCAG 1.4.3).'));
  blocks.push(H(2, '5.5 Color y metadatos', 'blue'));
  blocks.push(B('Color: la web asume sRGB; imágenes P3/AdobeRGB sin etiquetar se ven desaturadas o sobresaturadas. AVIF soporta HDR (PQ/HLG); imprenta exige CMYK + ICC.'));
  blocks.push(B('Metadatos: EXIF/XMP dan autoría y datos de cámara (valioso en RAW/TIFF), pero en web pesan y filtran GPS → se eliminan al publicar; se conservan en archivo profesional.'));
  blocks.push(B('Perfiles: etiquetar siempre el perfil ICC (sRGB en web, CMYK en imprenta) para que el color sea predecible entre dispositivos.'));
  blocks.push(D());

  // ══════════ REFERENCIAS ══════════
  blocks.push(H(1, '6 · Referencias técnicas', 'purple'));
  blocks.push(B('W3C — PNG 3rd Edition: https://www.w3.org/TR/png-3/'));
  blocks.push(B('Google Developers — WebP: https://developers.google.com/speed/webp'));
  blocks.push(B('AOM — AVIF: https://aomediacodec.github.io/av1-avif/'));
  blocks.push(B('Adobe — TIFF 6.0: https://www.adobe.io/open/standards/TIFF.html'));
  blocks.push(B('MDN — Tipos de imagen: https://developer.mozilla.org/es/docs/Web/Media/Formats/Image_types'));
  blocks.push(B('Can I Use — WebP/AVIF: https://caniuse.com/webp · https://caniuse.com/avif'));
  blocks.push(B('Nokia — HEIF Technical: https://nokiatech.github.io/heif/technical.html'));
  blocks.push(P('Imágenes de apoyo: Wikimedia Commons (licencias libres CC). Imágenes de comparación de calidad: generadas localmente con Python/Pillow e ImageMagick a partir de una imagen de referencia 1920×1080.'));

  return blocks;
}
