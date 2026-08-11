# ☕ Cafetería POS — Hackathon Edition

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)
[![Rich](https://img.shields.io/badge/UI-Rich-purple.svg)](https://github.com/Textualize/rich)
[![DB](https://img.shields.io/badge/DB-SQLite-green.svg)](https://www.sqlite.org/)
[![IA](https://img.shields.io/badge/IA-DeepSeek-orange.svg)](https://deepseek.com)

**Sistema de Punto de Venta para cafetería con asistente inteligente de lenguaje natural.**

> "No le des clics a un menú aburrido. Háblale a tu POS como si fuera tu barista."

---

## ✨ Características

| Módulo | Descripción |
|--------|-------------|
| 🛒 **Punto de Venta** | Registro rápido de ventas con búsqueda de productos por categoría |
| 👥 **Clientes** | Registro, búsqueda, edición, historial de compras y cumpleaños |
| ⭐ **Lealtad** | Acumulación de puntos, canje por promociones y recompensas |
| 📦 **Productos** | Catálogo full CRUD con categorías y control de stock |
| 📊 **Reportes** | Ventas del día, período, ranking de clientes, productos más vendidos, resumen |
| 👤 **Usuarios** | Roles admin/cajero, sesiones, activación/desactivación |
| 🤖 **Asistente IA** | Comandos en lenguaje natural (`"vender 2 capuchinos"`, `"reporte de hoy"`) |
| 💾 **Backup** | Script de respaldo automático + cron via GitHub Actions |

## 🚀 Quickstart

```bash
cd cafeteria-pos
pip install -r requirements.txt
python main.py
```

**Credenciales demo:**
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Admin |
| `maria` | `cajero123` | Cajero |

### Modo Asistente Inteligente

```bash
python main.py --asistente
```

Escribe comandos como:
- `vender 2 capuchinos y un croissant`
- `reporte de ventas de hoy`
- `buscar cliente carlos`
- `ranking de clientes`
- `productos más vendidos`

**[Modo IA opcional]**: configura `DEEPSEEK_API_KEY` en `.env` para interpretación con DeepSeek.

### Generar datos de demo

```bash
python scripts/seed_demo.py    # ~300 ventas realistas en 30 días
```

## 🧠 Arquitectura

```
┌─────────────────────────────────────────────┐
│                 main.py                      │
│  Rich UI + Menús + Asistente                 │
├──────────┬──────────┬──────────┬────────────┤
│   auth   │ clientes │ lealtad  │ reportes   │
│  .py     │   .py    │   .py    │   .py      │
├──────────┼──────────┴──────────┼────────────┤
│productos │       pos.py        │ config.py  │
│  .py     │                     │            │
├──────────┴─────────────────────┼────────────┤
│         database.py            │orquestador │
│    SQLite (portable)           │    .py     │
└────────────────────────────────┴────────────┘
                                    ↑
                              [DeepSeek API]
                                (opcional)
```

### Super-agente Orquestador

Inspirado en **krei-orquestador** — el mismo que coordina 17 agentes especializados en KREID:

```
USUARIO: "vender 2 capuchinos"
          ↓
    FASE 1: PARSE
    "vender" + cantidad=2 + producto="capuchino"
          ↓
    FASE 2: CLASIFICAR
    intención=vender, agente=VENDEDOR
          ↓
    FASE 3: DESPACHAR
    → _asistente_vender()
          ↓
    FASE 4: VERIFICAR
    productos en catálogo? ✓  stock? ✓
          ↓
    FASE 5: ENTREGAR
    Ticket impreso, puntos otorgados ✓
```

## 📁 Estructura del proyecto

```
examen/
├── main.py              ← Entry point (Rich UI + menús)
├── database.py          ← Motor SQLite
├── auth.py              ← Autenticación (SHA-256)
├── productos.py         ← CRUD de productos
├── clientes.py          ← CRUD de clientes
├── lealtad.py           ← Puntos y promociones
├── pos.py               ← Lógica de ventas
├── reportes.py          ← Reportes y estadísticas
├── ui.py                ← Componentes Rich (tablas, paneles, prompts)
├── orquestador.py       ← Super-agente NLU + IA
├── config.py            ← Variables de entorno (.env)
├── .env.example         ← Template de configuración
├── requirements.txt     ← Dependencias
├── scripts/
│   ├── backup.py        ← Respaldo automático de BD
│   └── seed_demo.py     ← Generador de datos demo
├── web_app.py           ← Dashboard web (Flask)
├── templates/           ← HTML (Jinja2)
├── static/              ← CSS (dark coffee theme)
├── tests/               ← Suite de pruebas
├── backups/             ← Respaldos locales (.gitignore)
└── .github/workflows/
    └── backup.yml       ← CI: backup diario automático
```

## 🛠️ Stack

| Componente | Tecnología |
|-----------|-----------|
| Lenguaje | Python 3.10+ |
| UI | [Rich](https://github.com/Textualize/rich) |
| BD | SQLite3 (stdlib, sin deps externas) |
| Auth | SHA-256 hashing |
| IA (opc.) | DeepSeek API vía httpx |
| Tests | pytest |
| CI/CD | GitHub Actions |

## 🔐 Seguridad

- Contraseñas hasheadas con SHA-256
- Roles admin/cajero con permisos diferenciados
- Prepared statements (sin inyección SQL)
- `.env` en `.gitignore` — credenciales nunca al repo

## 📝 Licencia

MIT — úsalo, modifícalo, preséntalo en tu hackathon.

---

*Construido con ❤️ y ☕ por Leo • Hackathon Edition 2026*
