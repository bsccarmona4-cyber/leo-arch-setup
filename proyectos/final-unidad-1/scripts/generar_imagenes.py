#!/usr/bin/env python3
"""Genera imágenes de prueba para la Actividad 2.a y mide tamaños/compresión."""
import io, os, json, random
from PIL import Image, ImageDraw, ImageFilter
import struct

OUT = "/home/leo/final-unidad-1/imagenes"
os.makedirs(OUT, exist_ok=True)
random.seed(42)

report = {}

def save(img, name, fmt=None, **kw):
    path = os.path.join(OUT, name)
    img.save(path, format=fmt, **kw)
    size = os.path.getsize(path)
    report[name] = {"bytes": size, "kb": round(size / 1024, 1), "w": img.width, "h": img.height}
    print(f"  {name:32s} {size:>9,} bytes ({size/1024:8.1f} KB) {img.width}x{img.height}")
    return path

# ─────────────────────────────────────────────────────────────
# 1) IMAGEN TIPO FOTO 1920x1080 (para web / landing)
#    Cielo en degradado + sol + montañas + nubes + textura
# ─────────────────────────────────────────────────────────────
print("== Foto 1920x1080 ==")
W, H = 1920, 1080
img = Image.new("RGB", (W, H))
px = img.load()
for y in range(H):
    t = y / H
    r = int(20 + 160 * t)
    g = int(40 + 90 * t)
    b = int(90 + 60 * t)
    for x in range(0, W, 8):
        jitter = random.randint(-6, 6)
        px[x, y] = (max(0, min(255, r + jitter)),
                    max(0, min(255, g + jitter)),
                    max(0, min(255, b + jitter)))
img = img.resize((W, H))

d = ImageDraw.Draw(img)
# Sol
d.ellipse([W - 700, 150, W - 400, 420], fill=(255, 220, 120))
# Montañas (triángulos suavizados)
for base, hgt, col in [(0, 420, (70, 110, 90)), (420, 360, (80, 120, 100)),
                       (900, 480, (55, 95, 80)), (1400, 340, (90, 130, 110))]:
    d.polygon([(base, H), (base + 300, H - hgt), (base + 650, H)], fill=col)
# Nubes (elipses)
for cx, cy, s in [(300, 220, 1), (900, 150, 0.7), (1500, 300, 0.9)]:
    for dx in range(-2, 3):
        d.ellipse([cx + dx * 60 * s, cy - 30 * s, cx + 130 * s + dx * 60 * s, cy + 30 * s], fill=(245, 245, 250))
img = img.filter(ImageFilter.GaussianBlur(0.6))
# Ruido sutil = detalle que la compresión pierde
pix = img.load()
for _ in range(40000):
    x, y = random.randint(0, W - 1), random.randint(0, H - 1)
    r, g, b = pix[x, y]
    j = random.randint(-14, 14)
    pix[x, y] = (max(0, min(255, r + j)), max(0, min(255, g + j)), max(0, min(255, b + j)))

img.save(os.path.join(OUT, "foto_original.png"))  # referencia sin comprimir (PNG)
report["foto_original.png"] = {"bytes": os.path.getsize(os.path.join(OUT, "foto_original.png")),
                               "kb": round(os.path.getsize(os.path.join(OUT, "foto_original.png")) / 1024, 1),
                               "w": W, "h": H, "nota": "PNG sin pérdida (referencia)"}
print(f"  foto_original.png       {os.path.getsize(os.path.join(OUT, 'foto_original.png')):>9,} bytes")

save(img, "foto_jpeg_q80.jpg", "JPEG", quality=80)
save(img, "foto_jpeg_q60.jpg", "JPEG", quality=60)
save(img, "foto_jpeg_q30.jpg", "JPEG", quality=30)
save(img, "foto_webp_q80.webp", "WEBP", quality=80)
save(img, "foto_webp_q60.webp", "WEBP", quality=60)
save(img, "foto_webp_lossless.webp", "WEBP", lossless=True)
save(img, "foto_png24.png", "PNG")
# PNG-8 con paleta adaptativa (256 colores) via convert (magick) para paleta real
os.system(f"magick {os.path.join(OUT, 'foto_png24.png')} -colors 256 -depth 8 {os.path.join(OUT, 'foto_png8.png')}")
report["foto_png8.png"] = {"bytes": os.path.getsize(os.path.join(OUT, "foto_png8.png")),
                           "kb": round(os.path.getsize(os.path.join(OUT, "foto_png8.png")) / 1024, 1), "w": W, "h": H}
print(f"  foto_png8.png           {os.path.getsize(os.path.join(OUT, 'foto_png8.png')):>9,} bytes (paleta 256)")
save(img, "foto_tiff_lzw.tiff", "TIFF", compression="tiff_lzw")
save(img, "foto_tiff_zip.tiff", "TIFF", compression="tiff_adobe_deflate")
save(img, "foto_bmp.bmp", "BMP")
save(img, "foto_gif.gif", "GIF", optimize=True)

# GIF animado (para demostrar animación)
frames = []
for k in range(6):
    f = img.copy()
    fd = ImageDraw.Draw(f)
    fd.ellipse([200 + k * 120, 700, 260 + k * 120, 760], fill=(255, 255, 255))
    frames.append(f)
frames[0].save(os.path.join(OUT, "foto_gif_animado.gif"), save_all=True, append_images=frames[1:], duration=120, loop=0)
report["foto_gif_animado.gif"] = {"bytes": os.path.getsize(os.path.join(OUT, "foto_gif_animado.gif")),
                                  "kb": round(os.path.getsize(os.path.join(OUT, "foto_gif_animado.gif")) / 1024, 1), "w": W, "h": H}
print(f"  foto_gif_animado.gif    {os.path.getsize(os.path.join(OUT, 'foto_gif_animado.gif')):>9,} bytes (6 frames)")

# AVIF si Pillow lo soporta
try:
    save(img, "foto_avif.avif", "AVIF", quality=60)
except Exception as e:
    print("  AVIF: no soportado por Pillow ->", e)

# HEIC no soportado por Pillow; anotar
print("  HEIC: no generable con Pillow (se documenta el procedimiento)")

# ICO (multiresolución 16/32/48/256)
ico_img = img.resize((256, 256))
ico_img.save(os.path.join(OUT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (256, 256)])
report["favicon.ico"] = {"bytes": os.path.getsize(os.path.join(OUT, "favicon.ico")),
                         "kb": round(os.path.getsize(os.path.join(OUT, "favicon.ico")) / 1024, 1), "w": 256, "h": 256}
print(f"  favicon.ico             {os.path.getsize(os.path.join(OUT, 'favicon.ico')):>9,} bytes (16/32/48/256)")

# ─────────────────────────────────────────────────────────────
# 2) ICONOGRAFÍA 256x256 con transparencia
# ─────────────────────────────────────────────────────────────
print("== Iconografía (transparencia) ==")
icon = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
di = ImageDraw.Draw(icon)
# Corazón con gradiente simple
di.polygon([(128, 210), (40, 120), (40, 70), (90, 35), (128, 70), (166, 35), (216, 70), (216, 120)], fill=(230, 60, 90, 255))
di.ellipse([40, 45, 120, 115], fill=(230, 60, 90, 255))
di.ellipse([136, 45, 216, 115], fill=(230, 60, 90, 255))
# Borde suave
icon = icon.filter(ImageFilter.GaussianBlur(0.4))
save(icon, "icono_png24.png", "PNG")
save(icon, "icono_webp.webp", "WEBP", quality=90)
os.system(f"magick {os.path.join(OUT, 'icono_png24.png')} -colors 128 -depth 8 {os.path.join(OUT, 'icono_png8.png')}")
report["icono_png8.png"] = {"bytes": os.path.getsize(os.path.join(OUT, "icono_png8.png")),
                            "kb": round(os.path.getsize(os.path.join(OUT, "icono_png8.png")) / 1024, 1), "w": 256, "h": 256}
print(f"  icono_png8.png          {os.path.getsize(os.path.join(OUT, 'icono_png8.png')):>9,} bytes (paleta 128)")

# SVG vectorial (escalable infinito)
svg = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff5f7e"/>
      <stop offset="100%" stop-color="#e03a5a"/>
    </linearGradient>
  </defs>
  <path d="M128 210 C60 150 24 120 24 74 C24 40 56 20 84 40 C102 52 118 70 128 86 C138 70 154 52 172 40 C200 20 232 40 232 74 C232 120 196 150 128 210 Z" fill="url(#g)"/>
</svg>"""
with open(os.path.join(OUT, "icono.svg"), "w") as f:
    f.write(svg)
report["icono.svg"] = {"bytes": len(svg.encode()), "kb": round(len(svg.encode()) / 1024, 1), "w": 256, "h": 256, "vectorial": True}
print(f"  icono.svg               {len(svg.encode()):>9,} bytes (vectorial)")

# ─────────────────────────────────────────────────────────────
# 3) ESCENA CON TRANSPARENCIA 800x600 (capa sobre fondo)
# ─────────────────────────────────────────────────────────────
print("== Escena con transparencia ==")
esc = Image.new("RGBA", (800, 600), (0, 0, 0, 0))
de = ImageDraw.Draw(esc)
de.rectangle([250, 200, 550, 500], fill=(70, 130, 200, 255))          # edificio
de.polygon([(210, 200), (400, 120), (590, 200)], fill=(90, 90, 140, 255))  # techo
for wx in range(270, 550, 60):
    de.rectangle([wx, 240, wx + 30, 300], fill=(255, 230, 120, 255))  # ventanas
de.ellipse([360, 430, 440, 510], fill=(60, 170, 90, 255))             # árbol
esc = esc.filter(ImageFilter.GaussianBlur(0.3))
save(esc, "escena_png24.png", "PNG")
save(esc, "escena_webp.webp", "WEBP", quality=90)

# Guardar reporte JSON
with open(os.path.join(OUT, "reporte.json"), "w") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
print("\nReporte guardado en", os.path.join(OUT, "reporte.json"))
