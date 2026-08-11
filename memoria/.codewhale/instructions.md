# CodeWhale Instructions — Leo's Setup (Portado de Goose)

## Modo de trabajo (krei-arbol-pensante adaptado)

Siempre activas, inyectadas cada turno:

### Metodología KREI Opus (default)

1. **PARSE (Fase 0 - STOP)**: Parseá el objetivo en una frase. Identifica ambigüedades y riesgos ANTES de mover un dedo.
2. **SEARCH-FIRST (Fase 1)**: Duda factual → tool call. Training data no es excusa. Errores pre-existentes: documéntalos.
3. **TREE-OF-THOUGHT (Fase 2)**: ≥3 approaches. Evalúa: correctitud, simplicidad, riesgo, mantenibilidad, costo. Decide con justificación.
4. **PLAN (Fase 3)**: `checklist_write` con pasos atómicos. Cada paso tiene verificación. Rollback planeado.
5. **EXECUTE (Fase 4)**: Un paso a la vez. Verifica cada paso antes del siguiente. Si falla → evalúa: arreglar o cambiar approach.
6. **REVIEW (Fase 5)**: ¿Todo se ejecutó? ¿Regresiones? ¿Resultado verificado? Reporta honestamente.
7. **Sub-agentes**: usa `agent` para tareas independientes en paralelo (explore/implement/review).
8. **Honestidad epistémica**: "no sé" es válido. No inventes. Conciso, sin relleno.

## Skills disponibles

### De Goose/KREI (en ~/.agents/skills/)
- `krei-arbol-pensante` — Razonamiento profundo: tree-of-thought, search-first, auto-verificación
- `krei-arranque` — Arranque automático, lee daily de Obsidian
- `krei-finanzas` — Unit economics, márgenes, ROI en ads
- `krei-mercado` — Investigación de mercado dropshipping
- `krei-scraper` — Scrapers de productos
- `krei-tienda` — Storefront KREI React/Vite/Stripe/Supabase
- `krei-integracion-repos` — Seguridad al integrar repos GitHub
- `krei-aur-seguro` — Protocolo AUR en Arch Linux
- `cavecrew` — Guía de delegación a subagentes (cavecrew-investigator/builder/reviewer)
- `caveman` — Modo comunicación ultra-compresa
- `caveman-commit` — Commits ultra-compresos
- `caveman-review` — Code reviews ultra-compresos
- `caveman-compress` — Comprimir archivos de memoria a caveman
- `caveman-help` — Referencia rápida de comandos caveman
- `caveman-stats` — Estadísticas de tokens
- `goose-skills-arsenal` — Catálogo maestro de skills
- `goose-superpoderes` — Sistema de superpoderes

### Nativos de CodeWhale (en ~/.codewhale/skills/)
- `delegate` — Delegación estratégica para multi-step coding
- `project-code-graph` — Mapeo de estructura y dependencias del proyecto
- `debugging` — Metodología de debugging paso a paso
- `memory-persistente` — Memoria de preferencias entre sesiones
- `vision-ocr` — Lectura de texto en imágenes/screenshots
- `documents` — Documentos Word/DOCX
- `feishu` — Integración con Feishu/Lark
- `fleet-manager` — Gestión de Agent Fleet
- `mcp-builder` — Diseño/construcción de MCP servers
- `pdf` — Manipulación de PDFs
- `plugin-creator` — Scaffolding de plugins
- `presentations` — Presentaciones PowerPoint
- `skill-creator` — Crear/mejorar skills
- `skill-installer` — Instalar skills desde GitHub
- `spreadsheets` — Hojas de cálculo XLSX/CSV
- `v4-best-practices` — Buenas prácticas para V4

### Perfiles de trabajo
Carga el skill correspondiente para activar el perfil:

- **`krei-power`**: Perfil POWER — todos los MCPs + skills de razonamiento (para trabajo general pesado)
- **`krei-lite`**: Perfil LITE — solo lo básico (dev rápido sin peso)
- **`krei-opus`**: Perfil OPUS — receta completa: parse → scan → think → plan → execute → review

## MCP Servers configurados (en ~/.deepseek/mcp.json)

| MCP | Comando | 
|-----|---------|
| **browsermcp** | `node ~/.local/share/mcp-servers/browsermcp/mcp/dist/index.js` |
| **n8n-mcp** | `~/.local/bin/n8n-mcp` |
| **fetch** | `~/.local/bin/mcp-server-fetch` |
| **sequential-thinking** | `node ~/mcp-servers/servers/src/sequentialthinking/dist/index.js` |
| **filesystem** | `node ~/mcp-servers/servers/src/filesystem/dist/index.js` |
| **memory** | `node ~/mcp-servers/servers/src/memory/dist/index.js` |
| **puppeteer** | `node ~/mcp-servers/npm-packages/node_modules/.bin/mcp-server-puppeteer` |
| **bash** | `python3 ~/mcp-servers/mcp-bash/server.py` |

⚠️ Los MCPs de Goose `nano-banana` y `google-stitch` (dropshipping) no existen porque `/home/leo/goose-dropshipping/` solo está en backup. `mcp-server-time`, `mcp-server-git`, `blackmount-nlp`, `a2asearch`, `clirank` no están instalados.

⚠️ **goose-skills-arsenal** y **goose-superpoderes** son específicos de Goose (referencian `~/.goose-skills/` y `superpoderes.sh`). No funcionan en CodeWhale sin adaptación. El catálogo de skills real está en `~/.agents/skills/` y `~/.codewhale/skills/`.

⚠️ **cavecrew** referencia tipos de agente Anthropic (`Explore`, `Code Reviewer`) pero CodeWhale usa tipos `explore`, `implementer`, `verifier`. Úsalo con esa adaptación mental.

## Proyectos activos
- `/home/leo` — Workspace principal
- `caveman/` — Proyecto caveman
- `guardian/` — Proyecto guardian (Next.js)
- `hallmark/` — Proyecto hallmark
- `pixelle-video/` — Procesador de video
- `kreid/` — Proyecto Kreid
- `goose-dropshipping/` — Dropshipping tools
- `mcp-servers/` — MCP servers locales
- `obsidian-escuela/` — Notas de escuela
