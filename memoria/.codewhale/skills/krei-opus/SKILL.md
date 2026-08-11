# KREI Opus Profile

Full Opus-level workflow adaptation from Goose krei-opus recipe.

## Workflow

Ejecuta este flujo para tareas complejas:

### Fase 0: STOP
- Parseá el objetivo en UNA frase.
- ¿Hay ambigüedades? Resuélvelas o pregunta.
- ¿Riesgos? Identifícalos.

### Fase 1: SEARCH-FIRST
- ¿Necesitas contexto? Busca.
- Training data no es excusa para no verificar.
- Errores pre-existentes: documéntalos.

### Fase 2: TREE-OF-THOUGHT
- Genera ≥3 approaches.
- Evalúa: correctitud, simplicidad, riesgo, mantenibilidad, costo.
- Decide cuál y justifica.

### Fase 3: PLAN
- checklist_write con pasos atómicos.
- Cada paso tiene verificación.
- Rollback planeado.

### Fase 4: EXECUTE (paso a paso)
- Un paso a la vez.
- Verifica cada paso antes del siguiente.
- Si falla → evalúa: arreglar o cambiar approach.

### Fase 5: REVIEW
- ¿Todo se ejecutó?
- ¿Regresiones?
- ¿Resultado verificado?
- Reporta honestamente.

## Sub-agentes
- Usa `agent` con `type: explore` para investigación independiente.
- Usa `agent` con `type: implement` para implementación aislada.
- Usa `agent` con `type: review` para verificación externa.
- Máximo 3 sub-agentes en paralelo.

## Skills complementarios
- krei-arbol-pensante
- delegate
- v4-best-practices
- cavecrew (para delegación fina)

⚠️ **Nota**: Este flujo ahora es el DEFAULT en CodeWhale via instructions.md. No hace falta cargar este skill a menos que quieras el recordatorio explícito o modificar el comportamiento por tarea.
