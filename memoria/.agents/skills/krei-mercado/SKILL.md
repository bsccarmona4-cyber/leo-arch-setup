---
name: krei-mercado
description: Investigación automatizada de mercado para encontrar productos ganadores de dropshipping. Usa agentes de Rezvani research + marketing + finanzas.
---

# 📊 KREI — Investigación de Mercado Automatizada

## Pipeline completo de research

### Paso 1: Búsqueda de tendencias
- Usar Google Trends para identificar productos en alza
- Analizar keywords con herramientas de volumen de búsqueda
- Buscar en TikTok/Instagram productos con engagement orgánico
- Skills útiles: `research/pulse`, agente `cs-content-creator`

### Paso 2: Análisis de competencia en Amazon
- Scraper de reviews: extraer TOP negativos para identificar pain points
- Contar reviews del top seller → si <1000, mercado penetrable
- Analizar precios vs calidad
- Skills útiles: `krei-scraper`, `research/dossier`

### Paso 3: Validación de demanda
- Reviews positivas: ¿qué valora la gente?
- Reviews negativas: dolor no resuelto → oportunidad
- Precio promedio del nicho
- Skills útiles: agente `cs-product-analyst`, `research/litreview`

### Paso 4: Unit Economics
- Costo del producto en CJ/Aliexpress vs precio de venta
- Regla 3x: precio venta ≥ 3× costo producto
- Calcular: Stripe fees, shipping, CAC estimado
- Skills útiles: agente `cs-financial-analyst`, `krei-finanzas`

### Paso 5: Decisión final
- Oportunidad real?
- Pain point claro?
- Margen viable?
- Competencia penetrable?

## Productos que buscar
- Económicos (ship desde USA, peso ligero)
- Que resuelvan un dolor específico
- Que se puedan vender a 3× el costo
- Con demanda validada (no inventada)

## Output esperado
```json
{
  "producto": "Nombre",
  "costo_cj": 0.00,
  "precio_venta": 0.00,
  "margen": 0.00,
  "competencia": "baja/media/alta",
  "pain_point": "descripción",
  "demanda": "validada/no_validada",
  "veredicto": "GO/NO_GO"
}
```
