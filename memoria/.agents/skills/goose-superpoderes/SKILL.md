---
name: goose-superpoderes
description: 🦸 SISTEMA DE SUPERPODERES COMPLETO — Ojos, oídos, boca, manos, internet y automatización. Todo lo que necesito para ser un agente autónomo.
---

# 🦸 GOOSE — Sistema de Superpoderes

Tengo acceso completo a los siguientes superpoderes a través de scripts en `~/.goose-skills/scripts/`:

---

## 👀 OJOS — Ver el mundo

| Comando | Descripción |
|---|---|
| `superpoderes.sh screenshot [archivo]` | Tomar screenshot de pantalla completa |
| `superpoderes.sh photo` | Screenshot con timestamp (no sobreescribe) |
| `superpoderes.sh window` | Ver qué ventana está activa (título, clase, PID) |
| `superpoderes.sh ocr [archivo]` | Leer texto de una imagen (OCR) |
| `superpoderes.sh record [archivo] [segundos]` | Grabar video de pantalla |

## 👂 OÍDOS — Escuchar el entorno

| Comando | Descripción |
|---|---|
| `superpoderes.sh clipboard read` | Leer el portapapeles |
| `superpoderes.sh clipboard write <texto>` | Escribir en el portapapeles |
| `superpoderes.sh clipboard image` | Capturar imagen del portapapeles |

## 👄 BOCA — Comunicarme

| Comando | Descripción |
|---|---|
| `superpoderes.sh notify <título> <mensaje>` | Enviar notificación al escritorio |
| `superpoderes.sh speak <texto>` | Texto a voz (si hay TTS instalado) |

## 🌐 INTERNET — Navegar y scrapear

| Comando | Descripción |
|---|---|
| `superpoderes.sh browser open <url>` | Abrir URL en navegador |
| `superpoderes.sh browser search <query>` | Buscar en Google |
| `superpoderes.sh browser scrape <url>` | Scrapear página web con Playwright |

## 🖥️ SISTEMA — Conocer el entorno

| Comando | Descripción |
|---|---|
| `superpoderes.sh sysinfo` | Info completa del sistema (OS, kernel, CPU, RAM, discos) |
| `superpoderes.sh run <comando>` | Ejecutar cualquier comando en el sistema |

## 🧠 MEMORIA — Recordar entre sesiones

| Sistema | Descripción |
|---|---|
| `Obsidian` | Vault en `/home/leo/obsidian-iti-leo/` con dailies, proyectos, arsenal |
| Skills `~/.agents/skills/` | 8 skills que se cargan automáticamente |
| TODO | Plan de trabajo actual en la skill `todo` |

## 🛠️ HERRAMIENTAS DE DESARROLLO

| Herramienta | Propósito |
|---|---|
| **Developer extension** | Editar archivos, ejecutar comandos, terminal |
| **Analyze extension** | Analizar código con AST |
| **Apps extension** | Crear aplicaciones HTML/CSS/JS |
| **Delegation** | Delegar tareas a subagentes |
| **Playwright** | Automatización de navegador |
| **Python scripts** | Scraping, análisis, cálculos |

## 📋 REGLAS DE USO

1. **Siempre que necesites info visual** → toma screenshot y analiza
2. **Siempre que necesites buscar** → usa el navegador
3. **Siempre que necesites recordar** → revisa Obsidian
4. **Para tareas largas** → usa delegación a subagentes
5. **Para errores** → usa `diagnose` (skill de Matt Pocock)

## 🚀 PROTOCOLO DE LANZAMIENTO RÁPIDO

Cuando el usuario diga cosas como:
- "Mira mi pantalla" → `superpoderes.sh screenshot` + analizar
- "Busca X en internet" → `superpoderes.sh browser search X`
- "¿Qué tengo en el portapapeles?" → `superpoderes.sh clipboard read`
- "Avísame cuando termines" → `superpoderes.sh notify "Goose" "Listo!"`
- "Dime cómo está el sistema" → `superpoderes.sh sysinfo`
