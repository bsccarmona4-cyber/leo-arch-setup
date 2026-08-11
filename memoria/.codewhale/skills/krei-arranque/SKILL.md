---
name: krei-arranque
description: ⚡ ARRANQUE AUTOMÁTICO (CodeWhale) — Lee el último daily de Obsidian y recupera el contexto de la sesión anterior. Se activa al iniciar cada sesión.
---

# ⚡ KREI — Arranque Automático (CodeWhale)

## Objetivo
Recuperar contexto de sesiones anteriores automáticamente al iniciar CodeWhale.

## Paso 1: Leer el último daily de Obsidian
Busca en `/home/leo/obsidian-iti-leo/90-daily/` el archivo `.md` más reciente por fecha.

## Paso 2: Mostrar resumen de contexto
Del daily extraer:
- ¿Qué proyecto se estaba trabajando?
- ¿Qué fase/paso va?
- ¿Qué APIs están configuradas?
- ¿Qué skills están disponibles?
- Pendientes importantes

## Paso 3: Verificar skills disponibles
CodeWhale carga automáticamente skills de:
- `~/.agents/skills/` (Goose/KREI skills)
- `~/.codewhale/skills/` (CodeWhale nativos)

## Paso 4: Preguntar al usuario
- "¿Seguimos con el proyecto anterior o empezamos algo nuevo?"
- "¿Quieres que revise algo en particular?"
- Si hay repos nuevos: "Usa el protocolo krei-integracion-repos"
