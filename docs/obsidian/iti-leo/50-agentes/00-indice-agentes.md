# 🧠 Goose — Índice de Agentes y Skills

## Arsenal de Referencia (30-arsenal/)
| Recurso | Descripción | ⭐ |
|---|---|---|
| **n8n-mcp** | MCP server para construir workflows n8n desde el chat | 21.4K |
| **n8n-workflows** | 55K workflows n8n prehechos para importar | 54.9K |
| **awesome-n8n-templates** | 280+ templates gratuitos de n8n | 22.6K |
| **BrowserMCP** | MCP server para controlar navegador con IA | 6.6K |
| **Microsoft MCP** | Catálogo oficial de MCP servers de Microsoft | 3.2K |
| **awesome-mcp-servers** | Colección masiva de MCP servers (referencia) | 88.3K |

## MCP Servers Instalados (Extensiones de goose)
| Extensión | Ruta | Estado |
|---|---|---|
| **NanoBanana** | `~/.local/bin/mcp-server-nano-banana` | ✅ Activo (Gemini imágenes) |
| **Google Stitch** | `~/.local/bin/stitch-mcp` | ✅ Activo |
| **BrowserMCP** | `~/.local/share/mcp-servers/browsermcp/` | ✅ Activo (control navegador) |
| **n8n MCP** | `~/.local/bin/n8n-mcp` | ✅ Activo (construir workflows n8n) |

## Skills Instaladas (Permanentes)
Todas en `~/.agents/skills/`:

| Skill | Propósito |
|---|---|
| **caveman** | Modo respuesta comprimida (~75% menos tokens) |
| **caveman-commit** | Commits convencionales cortos |
| **caveman-review** | Code review ultra-compreso |
| **caveman-compress** | Comprime archivos de memoria |
| **caveman-stats** | Estadísticas de tokens ahorrados |
| **caveman-help** | Ayuda rápida de comandos |
| **cavecrew** | Subagentes caveman comprimidos |
| **goose-skills-arsenal** | Catálogo maestro de skills (Matt Pocock, Rezvani, Anthropic, etc.) |
| **goose-superpoderes** | Visión, clipboard, navegador, notificaciones |
| **krei-arranque** | Lectura automática de daily al iniciar |
| **krei-finanzas** | Unit economics, márgenes, ROI en ads |
| **krei-integracion-repos** | Protocolo de seguridad para integrar repos GitHub |
| **krei-mercado** | Investigación de mercado dropshipping |
| **krei-scraper** | Scraping de productos |
| **krei-tienda** | Storefront KREI (React + Stripe + Supabase) |

## Subagentes (Summon)
| Nombre | Rol |
|---|---|
| **krei-estrategia** | Asesor estratégico — decide GO/NO_GO |
| **krei-finanzas** | Analista financiero |
| **krei-fullstack** | Dev full-stack para la tienda |
| **krei-marketing** | Marketing digital + ads |
| **krei-research** | Investigador de mercado |
| **krei-scraping** | Web scraping especializado |

## Configuración Base
- **tom (Top Of Mind)**: Inyecta instrucciones caveman cada sesión vía `GOOSE_MOIM_MESSAGE_FILE`
- **Skills extension**: Habilita skills desde filesystem
- **APIs**: Solo en local (`~/.config/goose/config.yaml`, `.env`), NUNCA en GitHub
