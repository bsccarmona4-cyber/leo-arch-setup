# KREI Power Profile

Activate this skill for full-power sessions with all MCP servers and reasoning tools.

## Instructions

When this skill is active:

1. **Siempre pensar en árbol (tree-of-thought)**: mínimo 3 enfoques antes de decidir.
2. **Usar sub-agentes** para tareas independientes (hasta 3 en paralelo).
3. **Auto-verificar** cada paso.
4. **Checklist** para tareas multi-paso.
5. **Buscar antes de responder**: duda factual → tool call.

## Applicable MCP Servers
- BrowserMCP (navegación web headless)
- n8n-mcp (automatización workflows)
- Fetch (web requests)
- Sequential Thinking (razonamiento profundo estructurado)
- Filesystem (acceso a archivos con restricciones)
- Memory (memoria persistente entre sesiones)
- Puppeteer (navegación web con Chrome)
- Bash (shell nativa)

## Skills cargados automáticamente
- krei-arbol-pensante
- delegate (CodeWhale)
- v4-best-practices (CodeWhale)
