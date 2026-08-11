#!/usr/bin/env python3
"""Genera imagen comparativa de calidad: original vs JPEG vs WebP (recorte ampliado)."""
import os
from PIL import Image

OUT = "/home/leo/final-unidad-1/imagenes"

# Cargar versión original (PNG sin pérdida) y las comprimidas
orig = Image.open(os.path.join(OUT, "foto_original.png")).convert("RGB")
jpeg = Image.open(os.path.join(OUT, "foto_jpeg_q30.jpg")).convert("RGB")
webp = Image.open(os.path.join(OUT, "foto_webp_q60.webp")).convert("RGB")
png8 = Image.open(os.path.join(OUT, "foto_png8.png")).convert("RGB")

# Zona con detalles (montañas + nubes + ruido): x 700-1100, y 150-550
crop_box = (700, 150, 1100, 550)
def crop(img):
    c = img.crop(crop_box)
    return c.resize((c.width * 3, c.height * 3), Image.NEAREST)  # ampliar sin suavizar

labels = ["ORIGINAL (PNG sin pérdida)", "JPEG q30 (artefactos de bloque)", "WebP q60 (menos artefactos)", "PNG-8 (banding de color)"]
imgs = [crop(orig), crop(jpeg), crop(webp), crop(png8)]

W, H = imgs[0].size
pad, label_h = 20, 50
canvas = Image.new("RGB", (W * 2 + pad * 3, H * 2 + label_h * 2 + pad * 3), (240, 240, 245))
from PIL import ImageDraw
d = ImageDraw.Draw(canvas)
positions = [(pad, pad), (W + pad * 2, pad), (pad, H + pad + label_h), (W + pad * 2, H + pad + label_h)]
for (img, label), (x, y) in zip(zip(imgs, labels), positions):
    canvas.paste(img, (x, y))
    d.text((x + 5, y + H + 8), label, fill=(30, 30, 40))
out = os.path.join(OUT, "comparacion_calidad.jpg")
canvas.save(out, "JPEG", quality=92)
print(out, os.path.getsize(out), "bytes", canvas.size)
