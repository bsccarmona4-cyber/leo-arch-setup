# Debugging Mode

Skill con metodología para debuggear código paso a paso sin necesidad de watch expressions.

## Flujo de debugging

### Fase 1: REPLICAR
- ¿Cuál es el error exacto? Copia el mensaje.
- ¿Es reproducible? Sí/No + condiciones.
- ¿Pasó antes o es nuevo?

### Fase 2: AISLAR
- Encuentra el punto exacto donde falla.
- Usa `grep_files` + `file_search` para rastrear el flujo.
- Divide el problema: ¿input, lógica, output?

### Fase 3: HIPÓTESIS
- Genera ≥2 hipótesis de por qué falla.
- Para cada una: ¿qué evidencia la apoya? ¿qué la refuta?

### Fase 4: VERIFICAR
- Inspecciona variables/estado con herramientas.
- Prueba cada hipótesis con un cambio mínimo.
- Usa sub-agentes `verifier` para revisar cambios.

### Fase 5: ARREGLAR
- Cambio quirúrgico, mínimo.
- Verifica que el fix funciona Y no rompe nada más.

### Herramientas
- `grep_files` — rastrear flujo
- `file_search` — encontrar archivos
- `read_file` — inspeccionar código
- `run_tests` / `run_verifiers` — validar
- Sub-agentes `explore` para investigar módulos independientes
