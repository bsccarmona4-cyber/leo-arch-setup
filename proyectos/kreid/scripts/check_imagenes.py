#!/usr/bin/env python3
"""Extrae screenshots para el documento KREID"""
import base64, os

img_dir = os.path.expanduser("~/kreid/docs/imagenes")
os.makedirs(img_dir, exist_ok=True)

# Las imágenes se guardan desde los artefactos de los tool calls
# Verificamos si ya existen
for img in ['homepage-hero.png', 'products-section.png', 'testimonials.png']:
    path = os.path.join(img_dir, img)
    if os.path.exists(path):
        print(f'✅ Ya existe: {img} ({os.path.getsize(path):,} bytes)')
    else:
        print(f'⏳ Falta: {img}')

print(f'\n📁 Imágenes en: {img_dir}')
print('\n⚠️ Para extraer las imágenes base64 de Puppeteer, ejecuta manualmente:')
print('   python3 ~/kreid/scripts/extraer_imagenes.py')
