// ─────────────────────────────────────────────────────────────
// upload-images.mjs — Sube TODAS las imágenes (generadas + web) a catbox
// ─────────────────────────────────────────────────────────────
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const BASE = '/home/leo/final-unidad-1/imagenes';

const IMAGES = [
  // generadas
  'foto_webp_q80.webp',
  'foto_jpeg_q80.jpg',
  'comparacion_calidad_small.jpg',
  'icono.svg',
  'icono_png24.png',
  'escena_png24.png',
  'escena_webp.webp',
  // de Wikimedia Commons (web/)
  'web/Image_formats_by_scope.png',
  'web/Test_-_image_size_comparison_(Jpeg_vs_Png_vs_Jpeg_XL_vs_Heic).png',
  'web/Compression-artifacts.jpg',
  'web/JPEG_compression_Example.jpg',
  'web/Vector_vs_raster.png',
  'web/RGB_and_CMYK_comparison.png',
  'web/PNG_transparency_demonstration_2.png',
  'web/Alpha_transparency_image.png',
  'web/Nopngs.gif',
  'web/animacion_gif.gif',
];

const urls = {};
for (const rel of IMAGES) {
  const path = `${BASE}/${rel}`;
  const out = execFileSync('curl', ['-s', '-F', 'reqtype=fileupload', '-F', `fileToUpload=@${path}`, 'https://catbox.moe/user/api.php'], { encoding: 'utf8' }).trim();
  if (!out.startsWith('http')) throw new Error(`Fallo subida ${rel}: ${out}`);
  const key = rel.replace('web/', '');
  urls[key] = out;
  console.log('✔', rel, '→', out);
}

writeFileSync('/home/leo/final-unidad-1/imagenes/urls.json', JSON.stringify(urls, null, 2));
console.log('\nURLs guardadas:', Object.keys(urls).length, 'imágenes');
