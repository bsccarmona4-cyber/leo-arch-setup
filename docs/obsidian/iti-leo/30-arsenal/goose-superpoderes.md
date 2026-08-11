---
tags: [goose, superpoderes, configuracion]
---

# 🦸 Goose — Superpoderes

**Skill asociada:** `goose-superpoderes`
**Script central:** `~/.goose-skills/scripts/superpoderes.sh`

## Superpoderes disponibles

### 👀 Ojos
| Poder | Comando | Dependencia |
|-------|---------|-------------|
| Screenshot | `superpoderes.sh screenshot` | grim ✅ |
| Foto rápida | `superpoderes.sh photo` | grim ✅ |
| Ventana activa | `superpoderes.sh window` | hyprctl + jq ✅ |
| OCR (leer texto) | `superpoderes.sh ocr` | grim + tesseract ⚠️ (no instalado) |
| Grabar pantalla | `superpoderes.sh record` | wl-screenrec ⚠️ (no instalado) |

### 👂 Oídos
| Poder | Comando | Dependencia |
|-------|---------|-------------|
| Leer portapapeles | `superpoderes.sh clipboard read` | wl-paste ✅ |
| Escribir portapapeles | `superpoderes.sh clipboard write` | wl-copy ✅ |
| Capturar imagen clipboard | `superpoderes.sh clipboard image` | wl-paste ✅ |

### 👄 Boca
| Poder | Comando | Dependencia |
|-------|---------|-------------|
| Notificaciones | `superpoderes.sh notify` | notify-send ✅ |
| Texto a voz | `superpoderes.sh speak` | espeak ⚠️ (no instalado) |

### 🌐 Internet
| Poder | Comando | Dependencia |
|-------|---------|-------------|
| Abrir navegador | `superpoderes.sh browser open` | xdg-open ✅ |
| Buscar en Google | `superpoderes.sh browser search` | xdg-open ✅ |
| Scrapear web | `superpoderes.sh browser scrape` | Playwright ✅ |

### 🖥️ Sistema
| Poder | Comando | Dependencia |
|-------|---------|-------------|
| Info del sistema | `superpoderes.sh sysinfo` | Varias ✅ |

### 🧠 Memoria
- Obsidian vault: `/home/leo/obsidian-iti-leo/`
- Skills automáticas: `~/.agents/skills/`
- TODO activo

## Habilidades extras (de los repos de skills)
- **Matt Pocock**: tdd, diagnose, prototype, grill-me, handoff
- **Rezvani**: 25 agentes (senior-engineer, financial-analyst, product-manager, growth-marketer...)
- **Anthropic**: code-review, frontend-design, feature-dev, security-guidance

## Pendiente
- [ ] Instalar tesseract para OCR
- [ ] Instalar espeak para TTS
- [ ] Instalar wl-screenrec para grabación
