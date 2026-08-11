#!/usr/bin/env python3
"""Regenera la comparativa de calidad reducida (fix 504 en Notion)."""
import os
from PIL import Image

OUT = "/home/leo/final-unidad-1/imagenes"
src = os.path.join(OUT, "comparacion_calidad.jpg")  # 2460x2560, 965 KB
img = Image.open(src)
# Reducir a ancho ~1400 px manteniendo proporción
ratio = 1400 / img.width
new = img.resize((1400, int(img.height * ratio)), Image.LANCZOS)
out = os.path.join(OUT, "comparacion_calidad_small.jpg")
new.save(out, "JPEG", quality=85, optimize=True)
print(out, os.path.getsize(out), "bytes", new.size)
