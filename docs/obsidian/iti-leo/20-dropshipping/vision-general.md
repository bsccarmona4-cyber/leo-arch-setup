# 🚀 Dropshipping Autónomo — Visión General

## Concepto
Sistema completamente autónomo que:
1. Busca productos ganadores vía API de CJ Dropshipping / AliExpress
2. Los sube a la tienda automáticamente
3. Fija precios con márgenes inteligentes
4. Publica contenido en redes sociales
5. Reporta métricas diarias
6. Optimiza precios dinámicamente

## Arquitectura propuesta

```
☁️ NUBE (siempre activo, GRATIS)
├── GitHub Actions → automatizaciones
├── Supabase → base de datos
├── Cron-job.org → disparador
└── Render/Railway → tienda web

🏠 LAP (solo cuando Leo abre sesión)
├── Goose → decisiones, ajustes, supervisión
└── Obsidian → registro, planes, notas
```

## Costos
- **GitHub Actions:** 🟢 Gratis (2000 min/mes)
- **Supabase:** 🟢 Gratis (500MB DB)
- **Cron-job.org:** 🟢 Gratis
- **Render/Railway:** 🟢 Gratis (con sleep)
- **Hosting:** 🟢 Gratis
- **Tokens Goose:** 💰 Solo cuando Leo se conecta a supervisar

## Fases

### Fase 1 — Base (ahora)
Tienda base (Next.js + Stripe + CJ API) + panel de control

### Fase 2 — Automatización
Buscar productos, subir automático, sincronizar stock/precios

### Fase 3 — Marketing
Contenido generado por IA y publicado en redes

### Fase 4 — Orquestación total
Todo corre solo. Leo solo recibe reportes y toma decisiones estratégicas.
