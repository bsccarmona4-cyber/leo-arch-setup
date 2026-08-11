---
name: krei-arranque
description: ⚡ ARRANQUE AUTOMÁTICO — Lee el último daily de Obsidian y recupera el contexto de la sesión anterior. Se activa al iniciar cada sesión.
---

# ⚡ KREI — Arranque Automático

## Paso 1: Leer el último daily
```bash
ls -t /home/leo/obsidian-iti-leo/90-daily/*.md 2>/dev/null | head -1
```

## Paso 2: Mostrar resumen de contexto
Del daily extraer:
- ¿Qué proyecto se estaba trabajando?
- ¿Qué fase/paso va?
- ¿Qué APIs están configuradas?
- ¿Qué skills están disponibles?
- Pendientes importantes

## Paso 3: Verificar skills disponibles
```bash
ls ~/.agents/skills/ 2>/dev/null
ls ~/.goose-skills/ 2>/dev/null
```

## Paso 4: Preguntar al usuario
- "¿Seguimos con el proyecto anterior o empezamos algo nuevo?"
- "¿Quieres que revise algo en particular?"
- Si hay repos nuevos: "Usa el protocolo krei-integracion-repos"
