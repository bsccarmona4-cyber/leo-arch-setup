---
name: krei-scraper
description: Scrapers de productos para investigación de dropshipping. Extrae datos de Amazon, CJ Dropshipping y otras fuentes.
---

# 🕷️ KREI — Scrapers de Productos

## Scrapers disponibles en `~/.goose-skills/scripts/`

### Amazon Scraper
- Extrae: título, precio, reviews, rating, imágenes, categoría
- Analiza reviews negativos para pain points

### CJ Dropshipping (pendiente API key)
- Extrae: productos, costos, tiempos de envío, peso
- Filtra por: ship desde USA, peso ligero, categoría

## Output
```json
[
  {
    "fuente": "Amazon | CJ",
    "producto": "Nombre",
    "precio": 0.00,
    "reviews": 0,
    "rating": 0.0,
    "pain_points": ["dolor1", "dolor2"],
    "costo_mayoreo": 0.00
  }
]
```
