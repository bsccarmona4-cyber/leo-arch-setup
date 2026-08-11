# 🧰 i-have-adhd

**Repo:** https://github.com/ayghri/i-have-adhd
**Ubicación:** ~/.agents/skills/i-have-adhd/
**Estrellas:** ⭐ 18,045
**Licencia:** MIT
**Lenguaje:** Python
**Seguridad:** ✅ Seguro (7/7 patrones limpios, 2026-08-07)

## Descripción
Skill transversal que evita que el agente de código entierre la respuesta. Output directo y accionable: acción primero, pasos numerados, sin "Hope this helps!", sin preámbulos, listas de máximo 5 items. Basado en *The Adult ADHD Tool Kit*.

## Skills/Agentes
- `i-have-adhd` — Skill principal (SKILL.md con 10 reglas)
- Plugins para: Claude Code, Codex, Cursor, Qwen, Kimi, Gemini
- Hooks: always-on (sh, ps1, mjs)
- Evals con casos de prueba

## Uso en KREID
Productivity Hub (🔧). Aplica a TODOS los agentes del orquestador. Se activa con `/i-have-adhd` y cambia el output a modo directo.

## Asignado a
Orquestador → 🔧 Productivity Hub (agente 13) — TRANSVERSAL
