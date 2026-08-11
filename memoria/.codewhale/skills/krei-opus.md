# 🌳 KREI OPUS — Pipeline 6 fases

Workflow bloqueante. NO saltar fases. Cada fase verifica antes de avanzar.

## FASE 0: STOP
- Parse objetivo en 1 frase
- Identifica riesgos, ambigüedades, dependencias
- Si ambigüedad → pregunta antes de actuar

## FASE 1: SEARCH-FIRST
- Escanea estado actual del proyecto
- tree, git status, cat archivos clave
- Documenta errores pre-existentes

## FASE 2: RAMAS (Tree of Thought)
- Genera ≥3 approaches distintos
- Evalúa: correctitud, simplicidad, riesgo, mantenibilidad, costo
- Decide cuál con justificación

## FASE 3: PLAN
- Desglosa solución en pasos atómicos verificables
- Cada paso tiene verificación
- Incluye rollback

## FASE 4: EXECUTE
- Ejecuta plan paso a paso
- Verifica cada paso antes del siguiente

## FASE 5: REVIEW
- Auto-review post-ejecución
- Integridad, regresiones, calidad
- Reporta honestamente

## Subagentes
- Tareas independientes → parallel
- Dependencias estrictas → sequential
- Max 3 subagentes simultáneos
